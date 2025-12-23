import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {prisma} from "./prisma"
import bcrypt from "bcrypt"
import { adapter } from "next/dist/server/web/adapter";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";



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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    // Mobile clients often omit Origin; we disable the origin check and rely on bearer token auth.
    disableOriginCheck: true,
    trustedOrigins: [
      process.env.BETTER_AUTH_URL,
      process.env.NEXTAUTH_URL,
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      "http://localhost:3000",
    ].filter(Boolean),
  },
  emailAndPassword: {
    enabled: true,
    // Use bcrypt to verify existing passwords
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        // hash comes from Account.password field
        return await bcrypt.compare(password, hash);
      },
    },
    // Disable password requirements for migration
    minPasswordLength: 1,
  },
  // Add role field to user
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60 * 12, // 12 hours
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
