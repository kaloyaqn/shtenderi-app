import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Placeholder admin check
async function isAdmin(req) {
  // TODO: Implement real admin check
  return true;
}

export async function PATCH(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { storageId, cashMovementId } = params;
  const body = await req.json();
  const { amount, type } = body;
  const cashMovement = await prisma.cashMovement.findUnique({ where: { id: cashMovementId } });
  if (!cashMovement) {
    return NextResponse.json({ error: 'Cash movement not found' }, { status: 404 });
  }
  // Revert old balance
  await prisma.cashRegister.update({
    where: { id: cashMovement.cashRegisterId },
    data: {
      cashBalance: {
        increment: cashMovement.type === 'DEPOSIT' ? -cashMovement.amount : cashMovement.amount,
      },
    },
  });
  // Update movement
  const updated = await prisma.cashMovement.update({
    where: { id: cashMovementId },
    data: { amount, type },
  });
  // Apply new balance
  await prisma.cashRegister.update({
    where: { id: cashMovement.cashRegisterId },
    data: {
      cashBalance: {
        increment: type === 'DEPOSIT' ? amount : -amount,
      },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { storageId, cashMovementId } = params;
  const cashMovement = await prisma.cashMovement.findUnique({ where: { id: cashMovementId } });
  if (!cashMovement) {
    return NextResponse.json({ error: 'Cash movement not found' }, { status: 404 });
  }
  await prisma.cashMovement.delete({ where: { id: cashMovementId } });
  // Revert balance
  await prisma.cashRegister.update({
    where: { id: cashMovement.cashRegisterId },
    data: {
      cashBalance: {
        increment: cashMovement.type === 'DEPOSIT' ? -cashMovement.amount : cashMovement.amount,
      },
    },
  });
  return NextResponse.json({ success: true });
} 