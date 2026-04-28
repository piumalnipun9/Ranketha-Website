import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID parameter is required' }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          id: userId,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      date: order.orderDate.toISOString().split('T')[0],
      status: order.status,
      total: order.totalAmount,
      trackingNumber: 'N/A', // Assuming no tracking number in schema for now
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.priceAtSale,
        image: item.product.imageUrl || '/placeholder.svg',
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
