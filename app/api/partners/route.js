import { getAllPartners, createPartner } from '@/lib/partners/partner'

// GET: Връща всички партньори с магазини
export async function GET() {
  try {
    const partners = await getAllPartners()
    return Response.json(partners)
  } catch (error) {
    console.error('[PARTNERS_GET_ERROR]', error)
    return new Response(
        JSON.stringify({ error: 'Failed to fetch partners' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// POST: Създава нов партньор
export async function POST(req) {
    try {
      const body = await req.json()
      const partner = await createPartner(body)
      return new Response(JSON.stringify(partner), { status: 201 })
    } catch (error) {
      console.error('[PARTNERS_POST_ERROR]', error)
      const status = error.status || 500
      const message = error.message || 'Failed to create partner'
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
