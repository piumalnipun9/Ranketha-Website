import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID parameter is required' }, { status: 400 });
  }

  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, type, last4, expiryMonth, expiryYear, isDefault } = await request.json();

  if (!userId || !type || !last4 || !expiryMonth || !expiryYear) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault: isDefault || false,
      },
    });
    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, userId, type, last4, expiryMonth, expiryYear, isDefault } = await request.json();

  if (!id || !userId || !type || !last4 || !expiryMonth || !expiryYear) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: userId,
          isDefault: true,
          NOT: {
            id: id,
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: {
        id: id,
      },
      data: {
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault,
      },
    });
    return NextResponse.json(updatedPaymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Payment method ID parameter is required' }, { status: 400 });
  }

  try {
    await prisma.paymentMethod.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
