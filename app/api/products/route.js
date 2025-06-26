import { getAllProducts, createProduct } from '@/lib/products/product'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');
    if (barcode) {
      const product = await prisma.product.findUnique({ where: { barcode } });
      return Response.json(product ? [product] : []);
    }
    const products = await getAllProducts();
    return Response.json(products);
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