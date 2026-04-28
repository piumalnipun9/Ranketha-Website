import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent automatic static generation at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if we're in build mode (environment variable set in next.config.js)
    if (process.env.NEXT_PHASE === 'build') {
      console.log('Build mode detected, returning mock data for featured products');
      return NextResponse.json([]);
    }
    
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
