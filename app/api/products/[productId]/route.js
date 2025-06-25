import { getProductById, updateProduct, deleteProduct } from '@/lib/products/product'

export async function GET(req, { params }) {
  try {
    const { productId } = params
    const product = await getProductById(productId)
    return Response.json(product)
  } catch (error) {
    console.error('[PRODUCT_GET_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to fetch product'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PATCH(req, { params }) {
  try {
    const { productId } = params
    const body = await req.json()
    const product = await updateProduct(productId, body)
    return Response.json(product)
  } catch (error) {
    console.error('[PRODUCT_PATCH_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to update product'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { productId } = params
    await deleteProduct(productId)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('[PRODUCT_DELETE_ERROR]', error)
    const status = error.status || 500
    const message = error.message || 'Failed to delete product'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 