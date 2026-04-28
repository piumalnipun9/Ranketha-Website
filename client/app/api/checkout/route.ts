
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { cart, shippingInfo } = await request.json();

  try {
    // In a real application, you would also handle payment processing here.

    const totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        totalAmount,
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        shippingAddress: shippingInfo.address,
        status: 'PENDING',
        items: {
          create: cart.items.map(item => ({
            quantity: item.quantity,
            priceAtSale: item.product.price,
            costAtSale: item.product.cost, // Assumes product object includes cost
            productId: item.product.id,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // After creating the order, update the stock for each product
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
