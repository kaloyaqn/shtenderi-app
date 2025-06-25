import { getAllProducts, createProduct } from '@/lib/products/product'

export async function GET() {
  try {
    const products = await getAllProducts()
    return Response.json(products)
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error)
    return new Response(
        JSON.stringify({ error: 'Failed to fetch products' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(req) {
    try {
      const body = await req.json()
      const product = await createProduct(body)
      return new Response(JSON.stringify(product), { status: 201 })
    } catch (error) {
      console.error('[PRODUCTS_POST_ERROR]', error)
      const status = error.status || 500
      const message = error.message || 'Failed to create product'
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } 