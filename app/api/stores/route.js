import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Връща всички магазини с партньор
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('[STORES_GET_ERROR]', error)
    return NextResponse.json({ error: 'Грешка при зареждане на магазини' }, { status: 500 })
  }
}

// POST: Създава нов магазин
export async function POST(req) {
  try {
    const body = await req.json()
    const { name, address, contact, phone, partnerId } = body

    if (!name || !address || !partnerId) {
      return NextResponse.json({ error: 'Името, адресът и партньорът са задължителни' }, { status: 400 })
    }

    const store = await prisma.store.create({
      data: { name, address, contact, phone, partnerId },
      include: { partner: true },
    })
    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('[STORES_POST_ERROR]', error)
    return NextResponse.json({ error: 'Грешка при създаване на магазин' }, { status: 500 })
  }
} 