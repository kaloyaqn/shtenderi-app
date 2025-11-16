import { getServerSession } from "@/lib/get-session-better-auth";

import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partners = await prisma.partner.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return Response.json(partners);

  } catch (error) {
    console.error("Error fetching partners:", error);
    return Response.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
} 