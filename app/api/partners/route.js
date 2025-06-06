import { NextResponse } from 'next/server'
import {prisma} from "@/lib/prisma"

// GET: Връща всички партньори с магазини
export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        stores: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error('[PARTNERS_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

// POST: Създава нов партньор
export async function POST(req) {
    try {
      const body = await req.json()
      console.log('📥 POST body:', body)
  
      const { id, name, bulstat, contactPerson, phone } = body
  
      if (!id?.trim() || !name?.trim()) {
        console.log('❌ Липсва ID или name')
        return NextResponse.json(
          { error: 'ID и име на фирмата са задължителни' },
          { status: 400 }
        )
      }
  
      const existing = await prisma.partner.findUnique({ where: { id } })
      console.log('🔍 Съществуващ партньор:', existing)
  
      if (existing) {
        return NextResponse.json(
          { error: 'Партньор с този ID вече съществува' },
          { status: 409 }
        )
      }
  
      const partner = await prisma.partner.create({
        data: { id, name, bulstat, contactPerson, phone },
      })
  
      console.log('✅ Създаден партньор:', partner)
  
      return NextResponse.json(partner, { status: 201 })
    } catch (error) {
      console.error('[PARTNERS_POST_ERROR]', error)
      return NextResponse.json(
        { error: 'Грешка при създаване на партньор', details: error.message },
        { status: 500 }
      )
    }
  }
  
