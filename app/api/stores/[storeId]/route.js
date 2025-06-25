import { getStoreById, updateStore, deleteStore } from '@/lib/stores/store'

// GET: Връща магазин по ID с партньор
export async function GET(req, { params }) {
  try {
    const { storeId } = params
    const store = await getStoreById(storeId)
    return Response.json(store)
  } catch (error) {
    console.error('[STORE_GET_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to fetch store'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT: Редактира магазин
export async function PUT(req, { params }) {
  try {
    const { storeId } = params
    const body = await req.json()
    const store = await updateStore(storeId, body)
    return Response.json(store)
  } catch (error) {
    console.error('[STORE_PUT_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to update store'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DELETE: Изтрива магазин
export async function DELETE(req, { params }) {
  try {
    const { storeId } = params
    await deleteStore(storeId)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('[STORE_DELETE_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to delete store'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 