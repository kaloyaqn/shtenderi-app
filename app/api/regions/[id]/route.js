import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, {params}) {
  try {
    const session = await getServerSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = await params;
    const { name } = await req.json();


    const region = await prisma.region.update({
      where: {
        id: id
      },
      data: {
        name: name
      }
    })

    return NextResponse.json(region)

  } catch(err) {
    console.error('[REGION_UPDATE_ERROR]', err);
    return NextResponse.json({ err }, { status: 500 });
  }
}

export async function DELETE(req, {params}) {
  try {
    const session = await getServerSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = await params;

    const region = await prisma.region.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json(region)
  } catch {
    console.error('[REGION_DELETE_ERROR]', err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
