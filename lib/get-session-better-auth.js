import { auth } from "./auth";
import { headers } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "better-auth.session_token";

/**
 * Replacement for getServerSession that uses Better Auth
 * Returns session in the same shape as NextAuth for compatibility
 */
export async function getServerSession() {
  try {
    const incomingHeaders = await headers();

    // Allow mobile clients to send bearer tokens instead of cookies
    const bearer = incomingHeaders.get("authorization");
    const token = bearer?.match(/^Bearer\\s+(.+)$/i)?.[1]?.trim();
    const forwardedHeaders = new Headers(incomingHeaders);
    if (token) {
      const existingCookies = forwardedHeaders.get("cookie");
      const sessionCookie = `${SESSION_COOKIE_NAME}=${token}`;
      const combinedCookies = existingCookies
        ? `${existingCookies}; ${sessionCookie}`
        : sessionCookie;
      forwardedHeaders.set("cookie", combinedCookies);
    }

    const session = await auth.api.getSession({
      headers: forwardedHeaders,
    });

    if (!session?.user) {
      return null;
    }

    // Fetch full user from DB to get role (Better Auth doesn't include custom fields by default)
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, image: true },
    });

    if (!dbUser) {
      return null;
    }

    // Return in NextAuth-compatible format
    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
      },
      expires: session.session?.expiresAt?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error("[GET_SESSION_ERROR]", error);
    return null;
  }
}
