import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        // if (!session) {
        //     return new NextResponse("Unauthorized", {status: 401})
        // }

        // if (session.user.role !== "ADMIN") {
        //    return new NextResponse("Not an admin!", {status: 401}) 
        // }

        const {searchParams} = new URL(req.url);

        
        const stand = searchParams.get('stand')?.split(',')
        const userId = searchParams.get('userId');
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        
        let whereClause = {
            ...(stand?.length && {
                standId: {in: stand}
            }),
            ...(userId && {
                userId: {contains: userId, mode: 'insensitive'}
            }),
            ...(dateFrom && {
                createdAt: {gte: new Date(dateFrom)}
            }),
            ...(dateTo && {
                createdAt: {lte: new Date(dateTo)}
            })
        }

        // if (stand) {
        //     whereClause = {
        //         standId: {
        //             in: stand.split(",")
        //         }
        //     }
        // }

        // if (userId) {
        //     whereClause.userId = {contains: userId, mode: 'insensitive'}        }

        //da ot-do
        //partnior
        //produkt - barcode i ime ama

        const sales = await prisma.revision.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                stand: true,
                partner: true,
                storage: true,
                user: true,
                missingProducts: true,
            }
        });

        return NextResponse.json(sales)



    } catch (err) {
        return NextResponse.json({error: "Failed to fetch sales", err}, {status: 500})
    }
}