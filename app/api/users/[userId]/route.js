import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Delete user
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const { userId } = params;
  try {
    await prisma.user.delete({ where: { id: userId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[USER_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update user
export async function PATCH(req, { params }) {
  try {
    const { userId } = params;
    const { name, email, password, role } = await req.json();
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// GET a specific user by ID
export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse('Forbidden', { status: 403 });
    }
    const { userId } = params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                userStands: { select: { stand: { select: { id: true, name: true } } } },
                userPartners: { select: { partner: { select: { id: true, name: true } } } },
                userStorages: { select: { storage: { select: { id: true, name: true } } } },
            }
        });
        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }
        // Flatten relations
        const userWithRelations = {
            ...user,
            stands: user.userStands.map(us => us.stand),
            partners: user.userPartners.map(up => up.partner),
            storages: user.userStorages.map(us => us.storage),
        };
        return NextResponse.json(userWithRelations);
    } catch (error) {
        console.error('[USER_GET_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// PUT update a user's details
export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse('Forbidden', { status: 403 });
    }
    const { userId } = params;
    try {
        const body = await req.json();
        const { name, email, role } = body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                role,
            },
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('[USER_PUT_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 