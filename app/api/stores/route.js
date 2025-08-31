import { getAllStores, createStore } from '@/lib/stores/store'

// GET: Връща всички магазини с партньор
export async function GET() {
  try {
    const stores = await getAllStores()
    return Response.json(stores)
  } catch (error) {
    console.error('[STORES_GET_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to fetch stores'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// POST: Създава нов магазин
export async function POST(req) {
  try {
    const body = await req.json()
    const store = await createStore(body)
    return new Response(JSON.stringify(store), { status: 201 })
  } catch (error) {
    console.error('[STORES_POST_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to create store'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 