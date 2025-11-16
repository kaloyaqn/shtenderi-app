import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function POST(req, { params }) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }
  const { userId } = params;
  const { partnerIds } = await req.json();

  if (!Array.isArray(partnerIds)) {
    return new Response('Invalid partnerIds', { status: 400 });
  }

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Remove all current assignments for this user
      await tx.userPartner.deleteMany({ where: { userId } });

      // Add new assignments if any are provided
      if (partnerIds.length > 0) {
        await tx.userPartner.createMany({
          data: partnerIds.map(partnerId => ({ userId, partnerId })),
          skipDuplicates: true,
        });
      }
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('[USER_PARTNERS_POST_ERROR]', err);
    return new Response('Failed to update partners', { status: 500 });
  }
} 