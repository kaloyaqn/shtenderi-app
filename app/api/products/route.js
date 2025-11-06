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
      // Fetch base products (with standProducts for existing UI)
    const products = await getAllProducts();

    // Aggregate quantities in storages and in DRAFT deliveries
    const [storageAgg, draftAgg] = await Promise.all([
      prisma.storageProduct.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
      }),
      prisma.deliveryProduct.groupBy({
        by: ['productId'],
        where: { delivery: { status: 'DRAFT' } },
        _sum: { quantity: true },
      }),
    ]);

    const storageMap = new Map(storageAgg.map(r => [r.productId, Number(r._sum.quantity || 0)]));
    const draftMap = new Map(draftAgg.map(r => [r.productId, Number(r._sum.quantity || 0)]));

    const enriched = products.map(p => {
      const storageQuantity = storageMap.get(p.id) || 0;
      const draftDeliveriesQuantity = draftMap.get(p.id) || 0;
      return {
        ...p,
        storageQuantity,
        draftDeliveriesQuantity,
      };
    });

    return Response.json(enriched);
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