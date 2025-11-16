import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prices } = await req.json();
    
    console.log('[UPDATE-PRICES] Received request with prices:', prices);
    
    if (!prices || typeof prices !== 'object') {
      console.log('[UPDATE-PRICES] Invalid prices data:', prices);
      return NextResponse.json({ error: 'Invalid prices data' }, { status: 400 });
    }

    const updates = [];
    const errors = [];

    // Update each product's clientPrice
    for (const [barcode, price] of Object.entries(prices)) {
      console.log(`[UPDATE-PRICES] Processing barcode ${barcode} with price ${price} (type: ${typeof price})`);
      
      if (typeof price !== 'number' || price < 0) {
        console.log(`[UPDATE-PRICES] Invalid price for barcode ${barcode}: ${price}`);
        errors.push(`Invalid price for barcode ${barcode}: ${price}`);
        continue;
      }

      try {
        const updatedProduct = await prisma.product.update({
          where: { barcode: String(barcode) },
          data: { clientPrice: price },
          select: { barcode: true, name: true, clientPrice: true }
        });
        
        updates.push(updatedProduct);
        console.log(`[UPDATE-PRICES] Successfully updated product ${barcode} with price ${price}`);
      } catch (error) {
        console.log(`[UPDATE-PRICES] Error updating product ${barcode}:`, error);
        if (error.code === 'P2025') {
          errors.push(`Product with barcode ${barcode} not found`);
        } else {
          errors.push(`Failed to update product ${barcode}: ${error.message}`);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some products could not be updated', 
        details: errors,
        updated: updates 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updates.length} products`,
      updated: updates 
    });

  } catch (error) {
    console.error('[UPDATE-PRICES-ERROR]', error);
    return NextResponse.json({ error: 'Failed to update product prices' }, { status: 500 });
  }
} 