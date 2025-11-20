import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";


export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { standId } = params;
        const body = await req.json();

        // Only allow updating the "region" field
        if (!body || !body.region) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

      const updatedStand = await prisma.stand.update({
        where: {
          id: standId
        },
        data: {
          region: body.region
        }
      });

        // const updatedStand = await updateStand(standId, { region: body.region });
        return Response.json(updatedStand);
    } catch (err) {
        console.error('[STAND_PATCH_REGION_ERROR]', err);
        const status = err.status || 500;
        const message = err.message || 'Failed to update stand region';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
