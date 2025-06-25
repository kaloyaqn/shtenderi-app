import { getProductsOnStand, addProductToStand } from '@/lib/standProducts/standProduct';

export async function GET(req, { params }) {
    try {
        const { standId } = params;
        const products = await getProductsOnStand(standId);
        return new Response(JSON.stringify(products));
    } catch (error) {
        console.error('[STAND_PRODUCTS_GET_ERROR]', error);
        const status = error.status || 500;
        const message = error.message || 'Failed to fetch products for stand';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(req, { params }) {
    try {
        const { standId } = params;
        const body = await req.json();
        const newStandProduct = await addProductToStand(standId, body);
        return new Response(JSON.stringify(newStandProduct), { status: 201 });
    } catch (error) {
        console.error('[STAND_PRODUCTS_POST_ERROR]', error);
        const status = error.status || 500;
        const message = error.message || 'Failed to add product to stand';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 