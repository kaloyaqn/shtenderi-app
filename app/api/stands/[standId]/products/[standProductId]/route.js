import { updateProductOnStand, removeProductFromStand } from '@/lib/standProducts/standProduct';

export async function PATCH(req, { params }) {
    try {
        const { standProductId } = params;
        const body = await req.json();
        const updatedStandProduct = await updateProductOnStand(standProductId, body);
        return new Response(JSON.stringify(updatedStandProduct));
    } catch (error) {
        console.error('[STAND_PRODUCT_PATCH_ERROR]', error);
        const status = error.status || 500;
        const message = error.message || 'Failed to update product on stand';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { standProductId } = params;
        await removeProductFromStand(standProductId);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[STAND_PRODUCT_DELETE_ERROR]', error);
        const status = error.status || 500;
        const message = error.message || 'Failed to remove product from stand';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 