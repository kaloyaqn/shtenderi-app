import { getStandById, updateStand, deleteStand } from "@/lib/stands/stand";

export async function GET(req, { params }) {
    try {
        const { standId } = params;
        const stand = await getStandById(standId);
        return Response.json(stand);
    } catch (err) {
        console.error('[STAND_GET_ERROR]', err);
        const status = err.status || 500
        const message = err.message || 'Failed to fetch stand'
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function PATCH(req, { params }) {
    try {
        const { standId } = params;
        const body = await req.json();
        const updatedStand = await updateStand(standId, body);
        return Response.json(updatedStand);
    } catch (err) {
        console.error('[STAND_PATCH_ERROR]', err);
        const status = err.status || 500
        const message = err.message || 'Failed to update stand'
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { standId } = params;
        await deleteStand(standId);
        return new Response(null, { status: 204 });
    } catch (err) {
        console.error('[STAND_DELETE_ERROR]', err);
        const status = err.status || 500
        const message = err.message || 'Failed to delete stand'
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        })
    }
} 