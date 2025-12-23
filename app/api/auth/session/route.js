import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session-better-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  return NextResponse.json(session);
}
