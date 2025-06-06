import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Връща магазин по ID с партньор
export async function GET(req, { params }) {
  try {
    const { storeId } = params
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { partner: true },
    })
    if (!store) {
      return NextResponse.json({ error: 'Магазинът не е намерен' }, { status: 404 })
    }
    return NextResponse.json(store)
  } catch (error) {
    console.error('[STORE_GET_ERROR]', error)
    return NextResponse.json({ error: 'Грешка при зареждане на магазин' }, { status: 500 })
  }
}

// PUT: Редактира магазин
export async function PUT(req, { params }) {
  try {
    const { storeId } = params
    const body = await req.json()
    const { name, address, contact, phone, partnerId } = body
    if (!name || !address || !partnerId) {
      return NextResponse.json({ error: 'Името, адресът и партньорът са задължителни' }, { status: 400 })
    }
    const store = await prisma.store.update({
      where: { id: storeId },
      data: { name, address, contact, phone, partnerId },
      include: { partner: true },
    })
    return NextResponse.json(store)
  } catch (error) {
    console.error('[STORE_PUT_ERROR]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Магазинът не е намерен' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Грешка при редактиране на магазин' }, { status: 500 })
  }
}

// DELETE: Изтрива магазин
export async function DELETE(req, { params }) {
  try {
    const { storeId } = params
    await prisma.store.delete({ where: { id: storeId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[STORE_DELETE_ERROR]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Магазинът не е намерен' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Грешка при изтриване на магазин' }, { status: 500 })
  }
} 