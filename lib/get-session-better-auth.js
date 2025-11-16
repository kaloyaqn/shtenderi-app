import { auth } from "./auth";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Replacement for getServerSession that uses Better Auth
 * Returns session in the same shape as NextAuth for compatibility
 */
export async function getServerSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
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

