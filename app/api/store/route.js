// app/api/store/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Create store
export async function POST(req) {
  const body = await req.json()
  const { name, address, contact, phone, cityId, partnerId } = body

  if (!name || !address) {
    return NextResponse.json({ error: 'Name and address are required' }, { status: 400 })
  }

  try {
    const store = await prisma.store.create({
      data: {
        name,
        address,
        contact,
        phone,
        cityId: cityId || null,
        partnerId,         // ✅ REQUIRED
      },
      include: {
        partner: true,
        city: true,
      },
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('[STORE_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
  }
}

// GET: Fetch all stores
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('[STORE_GET_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
  }
}
