import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// List all users (GET)
export async function GET(req) {
  if (req.nextUrl?.pathname?.endsWith('/me')) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userStands: { select: { stand: { select: { id: true, name: true } } } },
        userPartners: { select: { partner: { select: { id: true, name: true } } } },
        userStorages: { select: { storage: { select: { id: true, name: true } } } },
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...user,
      stands: user.userStands.map(us => us.stand),
      partners: user.userPartners.map(up => up.partner),
      storages: user.userStorages.map(us => us.storage),
    });
  }

  // Add authentication check for main users endpoint
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add role check - only admins can access all users
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userStands: {
          select: {
            stand: {
              select: { id: true, name: true }
            }
          }
        },
        userPartners: {
          select: {
            partner: {
              select: { id: true, name: true }
            }
          }
        },
        userStorages: {
          select: {
            storage: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    // Flatten stands and partners for frontend
    const usersWithRelations = users.map(u => ({
      ...u,
      stands: u.userStands.map(us => us.stand),
      partners: u.userPartners.map(up => up.partner),
      storages: u.userStorages.map(us => us.storage),
    }));
    return NextResponse.json(usersWithRelations);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create a new user (POST)
export async function POST(req) {
  // Add authentication check for creating users
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add role check - only admins can create users
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await req.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 