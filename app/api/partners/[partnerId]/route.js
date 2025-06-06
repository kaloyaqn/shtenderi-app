import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch a single partner
export async function GET(req, { params }) {
  try {
    const { partnerId } = params

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(partner)
  } catch (error) {
    console.error('[PARTNER_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

// PUT: Update a partner
export async function PUT(req, { params }) {
  try {
    const { partnerId } = params
    const body = await req.json()
    const { name, bulstat, contactPerson, phone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Името е задължително' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        name,
        bulstat,
        contactPerson,
        phone,
      },
    })

    return NextResponse.json(partner)
  } catch (error) {
    console.error('[PARTNER_PUT_ERROR]', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a partner
export async function DELETE(req, { params }) {
  try {
    const { partnerId } = params

    await prisma.partner.delete({
      where: { id: partnerId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[PARTNER_DELETE_ERROR]', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
} 