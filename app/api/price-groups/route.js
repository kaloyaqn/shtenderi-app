
import { createPriceGroup, getPriceGroups } from "@/lib/price_groups/price_group";
import { getServerSession } from "@/lib/get-session-better-auth";

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session) return new Response("Unauthorized", {status: 401});
        if (session.user.role !== "ADMIN") return new Response("Forbidden", {status: 403});

        const body = await req.json();
        const priceGroup = await createPriceGroup(body)
        return Response.json(priceGroup, {status: 201})

    } catch (err) {
        console.error("error", err);
        return new Response("failed to create price group", {status: 500})
    }
}

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return new Response("Unauthorized", {status: 401});
        if (session.user.role !== "ADMIN") return new Response("Forbidden", {status: 403});   

        const price_groups = await getPriceGroups();
        return Response.json(price_groups);
    } catch (err) {
        console.error("error", err);
        return new Response("failed to fetch pirce groups")
    }
}
