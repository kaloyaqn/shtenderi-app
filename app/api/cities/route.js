import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";

export async function GET() {
  const session = getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" });
  }

  const cities = await prisma.city.findMany()

  return NextResponse.json(cities);
}



export async function POST(req) {
  const session = getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" });
  }

  const { name } = await req.json();

  const city = await prisma.city.create({
    data: {
      name: name
    }
  });

  return NextResponse.json(city);
}
