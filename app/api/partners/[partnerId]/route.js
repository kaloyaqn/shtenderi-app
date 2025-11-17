import { getPartnerById, updatePartner, deletePartner } from '@/lib/partners/partner'
import { getServerSession } from '@/lib/get-session-better-auth'

// GET: Fetch a single partner, optionally with stores
export async function GET(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    if (session.user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 })

    const { partnerId } = await params
    const url = new URL(req.url, 'http://localhost')
    const includeStores = url.searchParams.get('includeStores') === '1'
    const partner = await getPartnerById(partnerId, includeStores)
    return Response.json(partner)
  } catch (error) {
    console.error('[PARTNER_GET_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to fetch partner'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT: Update a partner
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    if (session.user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 })

    const { partnerId } = await params
    const body = await req.json()

    // Normalize priceGroupId when explicitly null/empty
    if (body.hasOwnProperty("priceGroupId")) {
      if (body.priceGroupId === "null" || body.priceGroupId === "") {
        body.priceGroupId = null;
      }
    }

    // Normalize percentageDiscount to a number (or null)
    if (body.hasOwnProperty('percentageDiscount')) {
      const pd = body.percentageDiscount;
      body.percentageDiscount =
        pd === '' || pd === null || typeof pd === 'undefined'
          ? null
          : Number(pd);
    }

    // Normalize optional email: treat empty string as null
    if (body.hasOwnProperty('email') && body.email === '') {
      body.email = null;
    }

    const partner = await updatePartner(partnerId, body)
    return Response.json(partner)
  } catch (error) {
    console.error('[PARTNER_PUT_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to update partner'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DELETE: Delete a partner
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    if (session.user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 })

    const { partnerId } = await params
    await deletePartner(partnerId)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('[PARTNER_DELETE_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to delete partner'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 