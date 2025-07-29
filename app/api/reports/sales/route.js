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
        const status = searchParams.get("status"); // paid, unpaid
        const type = searchParams.get("type"); // refund, missing
        const partnerId = searchParams.get("partnerId");
        const barcode = searchParams.get("barcode"); // barcode filter
        
        console.log('API Debug - Received params:', { stand, userId, dateFrom, dateTo, status, type, partnerId, barcode });
        
        let whereClause = {
            revision: {
                ...(stand?.length && {
                    standId: {in: stand}
                }),
                ...(userId && {
                    userId: {contains: userId, mode: 'insensitive'}
                }),
                ...(partnerId && {
                    partnerId: partnerId
                }),
                ...(status && {
                    status: status.toUpperCase()
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
        }).catch(err => {
            console.error('API Debug - Missing products query error:', err);
            throw err;
        });

        // Filter missing products by barcode if specified
        let filteredMissingProducts = missingProducts;
        if (barcode) {
            filteredMissingProducts = missingProducts.filter(mp => 
                mp.product?.barcode?.toLowerCase().includes(barcode.toLowerCase())
            );
        }

        console.log('API Debug - Missing products count:', filteredMissingProducts.length);
        if (filteredMissingProducts.length > 0) {
            console.log('API Debug - First missing product date:', filteredMissingProducts[0].revision.createdAt);
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
        }).catch(err => {
            console.error('API Debug - Refund products query error:', err);
            throw err;
        });

        // Filter refund products by barcode if specified
        let filteredRefundProducts = refundProducts;
        if (barcode) {
            filteredRefundProducts = refundProducts.filter(rp => 
                rp.product?.barcode?.toLowerCase().includes(barcode.toLowerCase())
            );
        }

        console.log('API Debug - Refund products count:', filteredRefundProducts.length);
        if (filteredRefundProducts.length > 0) {
            console.log('API Debug - First refund product date:', filteredRefundProducts[0].refund.createdAt);
        }

        // Fetch source information for refunds (stands and storages)
        const standIds = [...new Set(filteredRefundProducts
            .filter(rp => rp.refund.sourceType === 'STAND')
            .map(rp => rp.refund.sourceId)
        )];
        
        const storageIds = [...new Set(filteredRefundProducts
            .filter(rp => rp.refund.sourceType === 'STORAGE')
            .map(rp => rp.refund.sourceId)
        )];

        const stands = standIds.length > 0 ? await prisma.stand.findMany({
            where: { id: { in: standIds } },
            select: { id: true, name: true, storeId: true }
        }) : [];

        const storages = storageIds.length > 0 ? await prisma.storage.findMany({
            where: { id: { in: storageIds } },
            select: { id: true, name: true }
        }) : [];

        // Fetch stores and partners for stands to get partner information
        const storeIds = [...new Set(stands.map(stand => stand.storeId))];
        const stores = storeIds.length > 0 ? await prisma.store.findMany({
            where: { id: { in: storeIds } },
            include: {
                partner: true
            }
        }) : [];

        // Create lookup objects
        const standsLookup = Object.fromEntries(stands.map(s => [s.id, s]));
        const storagesLookup = Object.fromEntries(storages.map(s => [s.id, s]));
        const storesLookup = Object.fromEntries(stores.map(s => [s.id, s]));

        // Add source information to refund products
        const refundProductsWithSource = filteredRefundProducts.map(rp => {
            const sourceInfo = rp.refund.sourceType === 'STAND' 
                ? standsLookup[rp.refund.sourceId]
                : storagesLookup[rp.refund.sourceId];
            
            // Get partner information for stands
            let partner = null;
            if (rp.refund.sourceType === 'STAND' && sourceInfo) {
                const store = storesLookup[sourceInfo.storeId];
                if (store?.partner) {
                    partner = store.partner;
                }
            }
            
            return {
                ...rp,
                sourceInfo,
                partner
            };
        });

        // Filter refund products by partner if specified
        let refundProductsWithPartnerFilter = refundProductsWithSource;
        if (partnerId) {
            refundProductsWithPartnerFilter = refundProductsWithSource.filter(rp => {
                // Only stands have partners, storages don't
                if (rp.refund.sourceType === 'STAND' && rp.partner) {
                    return rp.partner.id === partnerId;
                }
                return false; // Storages don't have partners, so exclude them when filtering by partner
            });
        }

        // Combine data based on type filter
        let missingProductsWithType = filteredMissingProducts.map((item) => ({
            ...item,
            type: "missing",
        }));

        let refundProductsWithType = refundProductsWithPartnerFilter.map((item) => ({
            ...item,
            type: "refund",
        }));

        // Apply type filter if specified
        if (type === 'missing') {
            refundProductsWithType = [];
        } else if (type === 'refund') {
            missingProductsWithType = [];
        }

        const sales = [...missingProductsWithType, ...refundProductsWithType];

        return NextResponse.json({
            missingProducts: missingProductsWithType,
            refundProducts: refundProductsWithType,
            total: sales.length
        })



    } catch (err) {
        return NextResponse.json({error: "Failed to fetch missing products", err}, {status: 500})
    }
}