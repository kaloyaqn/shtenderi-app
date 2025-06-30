import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }

  const { userId } = params;
  const { storageIds } = await req.json();

  if (!Array.isArray(storageIds)) {
    return new Response('Invalid storageIds', { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Clear existing assignments
      await tx.userStorage.deleteMany({ where: { userId } });

      // Create new assignments
      if (storageIds.length > 0) {
        await tx.userStorage.createMany({
          data: storageIds.map(storageId => ({ userId, storageId })),
          skipDuplicates: true,
        });
      }
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('[USER_STORAGES_POST_ERROR]', err);
    return new Response('Failed to update storages', { status: 500 });
  }
} 