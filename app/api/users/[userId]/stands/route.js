import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }
  const { userId } = params;
  const { standIds } = await req.json();
  if (!Array.isArray(standIds)) {
    return new Response('Invalid standIds', { status: 400 });
  }
  try {
    // Remove all current assignments
    await prisma.userStand.deleteMany({ where: { userId } });
    // Add new assignments
    await prisma.userStand.createMany({
      data: standIds.map(standId => ({ userId, standId })),
      skipDuplicates: true,
    });
    return new Response('OK');
  } catch (err) {
    console.error('[USER_STANDS_POST_ERROR]', err);
    return new Response('Failed to update stands', { status: 500 });
  }
} 