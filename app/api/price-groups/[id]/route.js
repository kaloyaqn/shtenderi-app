
import { deletePriceGroup } from "@/lib/price_groups/price_group";
import { getServerSession } from "@/lib/get-session-better-auth";

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession()
        if (!session) return new Response('Unauthorized', { status: 401 })
        if (session.user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 })

        // The dynamic route param is named 'id', not 'price_group_id'
        const { id } = params;
        if (!id) {
            return new Response('Missing price group id', { status: 400 });
        }
        await deletePriceGroup(id);
        return new Response(null, { status: 204 });

    } catch (err) {
        console.error("error deleting price group", err)
        return new Response("Failed to delete price group", { status: 500 });
    }
}