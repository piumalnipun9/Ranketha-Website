
import { NextResponse } from 'next/server';

const cart = {
  items: [],
  total: 0,
};

export async function GET() {
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const { product, quantity } = await request.json();
  const existingItem = cart.items.find((item) => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }

  cart.total = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const { productId } = await request.json();
  cart.items = cart.items.filter((item) => item.product.id !== productId);
  cart.total = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return NextResponse.json(cart);
}
