import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        
        console.log('API Debug - Received params:', { stand, userId, dateFrom, dateTo });
        
        let whereClause = {
            revision: {
                ...(stand?.length && {
                    standId: {in: stand}
                }),
                ...(userId && {
                    userId: {contains: userId, mode: 'insensitive'}
                }),
                ...(dateFrom && {
                    createdAt: {gte: new Date(dateFrom + 'T00:00:00.000Z')}
                }),
                ...(dateTo && {
                    createdAt: {lte: new Date(dateTo + 'T23:59:59.999Z')}
                })
            }
        }

        // Fix: If we have both dateFrom and dateTo, we need to merge the createdAt conditions
        if (dateFrom && dateTo) {
            whereClause.revision.createdAt = {
                gte: new Date(dateFrom + 'T00:00:00.000Z'),
                lte: new Date(dateTo + 'T23:59:59.999Z')
            };
        } else if (dateFrom) {
            whereClause.revision.createdAt = {
                gte: new Date(dateFrom + 'T00:00:00.000Z')
            };
        } else if (dateTo) {
            whereClause.revision.createdAt = {
                lte: new Date(dateTo + 'T23:59:59.999Z')
            };
        }

        console.log('API Debug - Missing products whereClause:', JSON.stringify(whereClause, null, 2));

        //da ot-do
        //partnior
        //produkt - barcode i ime ama

        // Fetch missing products
        const missingProducts = await prisma.missingProduct.findMany({
            where: whereClause,
            orderBy: { 
                revision: {
                    createdAt: "desc"
                }
            },
            include: {
                product: true,
                revision: {
                    include: {
                        stand: true,
                        partner: true,
                        storage: true,
                        user: true,
                    }
                }
            }
        });

        console.log('API Debug - Missing products count:', missingProducts.length);
        if (missingProducts.length > 0) {
            console.log('API Debug - First missing product date:', missingProducts[0].revision.createdAt);
        }

        // Fetch refund products with similar filters
        const refundProductsWhereClause = {
            refund: {
                ...(stand?.length && {
                    sourceId: {in: stand}
                }),
                ...(userId && {
                    userId: {contains: userId, mode: 'insensitive'}
                }),
                ...(dateFrom && {
                    createdAt: {gte: new Date(dateFrom + 'T00:00:00.000Z')}
                }),
                ...(dateTo && {
                    createdAt: {lte: new Date(dateTo + 'T23:59:59.999Z')}
                })
            }
        };

        // Fix: If we have both dateFrom and dateTo, we need to merge the createdAt conditions
        if (dateFrom && dateTo) {
            refundProductsWhereClause.refund.createdAt = {
                gte: new Date(dateFrom + 'T00:00:00.000Z'),
                lte: new Date(dateTo + 'T23:59:59.999Z')
            };
        } else if (dateFrom) {
            refundProductsWhereClause.refund.createdAt = {
                gte: new Date(dateFrom + 'T00:00:00.000Z')
            };
        } else if (dateTo) {
            refundProductsWhereClause.refund.createdAt = {
                lte: new Date(dateTo + 'T23:59:59.999Z')
            };
        }

        console.log('API Debug - Refund products whereClause:', JSON.stringify(refundProductsWhereClause, null, 2));

        const refundProducts = await prisma.refundProduct.findMany({
            where: refundProductsWhereClause,
            orderBy: { 
                refund: {
                    createdAt: "desc"
                }
            },
            include: {
                product: true,
                refund: {
                    include: {
                        user: true,
                    }
                }
            }
        });

        console.log('API Debug - Refund products count:', refundProducts.length);
        if (refundProducts.length > 0) {
            console.log('API Debug - First refund product date:', refundProducts[0].refund.createdAt);
        }

        // Fetch source information for refunds (stands and storages)
        const standIds = [...new Set(refundProducts
            .filter(rp => rp.refund.sourceType === 'STAND')
            .map(rp => rp.refund.sourceId)
        )];
        
        const storageIds = [...new Set(refundProducts
            .filter(rp => rp.refund.sourceType === 'STORAGE')
            .map(rp => rp.refund.sourceId)
        )];

        const stands = standIds.length > 0 ? await prisma.stand.findMany({
            where: { id: { in: standIds } },
            select: { id: true, name: true }
        }) : [];

        const storages = storageIds.length > 0 ? await prisma.storage.findMany({
            where: { id: { in: storageIds } },
            select: { id: true, name: true }
        }) : [];

        // Create lookup objects
        const standsLookup = Object.fromEntries(stands.map(s => [s.id, s]));
        const storagesLookup = Object.fromEntries(storages.map(s => [s.id, s]));

        // Add source information to refund products
        const refundProductsWithSource = refundProducts.map(rp => ({
            ...rp,
            sourceInfo: rp.refund.sourceType === 'STAND' 
                ? standsLookup[rp.refund.sourceId]
                : storagesLookup[rp.refund.sourceId]
        }));

        return NextResponse.json({
            missingProducts,
            refundProducts: refundProductsWithSource
        })



    } catch (err) {
        return NextResponse.json({error: "Failed to fetch missing products", err}, {status: 500})
    }
}