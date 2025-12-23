import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session-better-auth";
import { getCorsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCorsHeaders(req),
    }
  );
}

export async function GET(req) {
  const session = await getServerSession();
  const headers = getCorsHeaders(req);

  if (!session) {
    return NextResponse.json({ session: null }, { status: 401, headers });
  }

  return NextResponse.json(session, { headers });
}
