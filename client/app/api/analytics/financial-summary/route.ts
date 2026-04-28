import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent automatic static generation at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if we're in build mode
    if (process.env.NEXT_PHASE === 'build') {
      console.log('Build mode detected, returning mock data for financial summary');
      return NextResponse.json({
        totalRevenue: 0,
        totalCostOfGoodsSold: 0,
        grossProfit: 0,
        profitMargin: 0,
        totalOrders: 0,
        totalItemsSold: 0
      });
    }
    
    const orderItems = await prisma.orderItem.findMany({
      select: {
        quantity: true,
        priceAtSale: true,
        product: {
          select: {
            buyingPrice: true,
          },
        },
      },
    });

    const totalRevenue = orderItems.reduce((acc: number, item: any) => acc + item.priceAtSale * item.quantity, 0);
    const totalCostOfGoodsSold = orderItems.reduce((acc: number, item: any) => acc + item.product.buyingPrice * item.quantity, 0);
    const grossProfit = totalRevenue - totalCostOfGoodsSold;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalOrders = await prisma.order.count();

    return NextResponse.json({
      totalRevenue,
      totalCostOfGoodsSold,
      grossProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      totalOrders,
      totalItemsSold: orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0),
    });

  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
