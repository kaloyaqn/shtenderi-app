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
          session.user.id = user?.id || token?.sub
          session.user.role = user?.role || token?.role
          return session
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
      },
      secret: process.env.NEXTAUTH_SECRET
}