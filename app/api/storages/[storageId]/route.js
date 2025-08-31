import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { storageId } = await params;
    const storage = await prisma.storage.findUnique({
      where: {
        id: storageId,
      },
    });

    if (!storage) {
      return new NextResponse('Storage not found', { status: 404 });
    }

    return NextResponse.json(storage);
  } catch (error) {
    console.error('[STORAGE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(req, { params }) {
    try {
      const { storageId } = await params;
      const body = await req.json();
      const { name } = body;
  
      if (!name) {
        return new NextResponse("Name is required", { status: 400 });
      }
  
      const storage = await prisma.storage.update({
        where: {
          id: storageId,
        },
        data: {
          name,
        },
      });
  
      return NextResponse.json(storage);
    } catch (error) {
        console.error('[STORAGE_PATCH]', error);
        if (error.code === 'P2002') {
            return new NextResponse('A storage with this name already exists', { status: 409 });
        }
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
      const { storageId } = await params;
  
      await prisma.storage.delete({
        where: {
          id: storageId,
        },
      });
  
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[STORAGE_DELETE]', error);
      return new NextResponse('Internal error', { status: 500 });
    }
} 