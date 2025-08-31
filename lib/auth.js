import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {prisma} from "./prisma"
import bcrypt from "bcrypt"
import { adapter } from "next/dist/server/web/adapter";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'text'},
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: {email: credentials.email}
                })

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null;

                console.log('Login attempt for:', credentials.email)
                console.log('User in DB:', user)
                console.log('Is valid:', isValid)

                return user
            }
        })
    ],
    callbacks: {
        async session({ session, token, user }) {
          // Always check if the user still exists in the DB
          const userId = user?.id || token?.sub;
          const dbUser = await prisma.user.findUnique({ where: { id: userId } });
          if (!dbUser) {
            // User no longer exists, invalidate session
            return null;
          }
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          return session;
        },
        async jwt({ token, user }) {
          if (user) {
            token.role = user.role
          }
          return token
        },
      },
      pages: {
        // signIn: '/login',
      },
      session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 24, // 1 day in seconds
        updateAge: 60 * 60 * 12, // 12 hours in seconds (how often to update session)
      },
      jwt: {
        maxAge: 60 * 60 * 24, // 1 day in seconds
      },
      secret: process.env.NEXTAUTH_SECRET
}