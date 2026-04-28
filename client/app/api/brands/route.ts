
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent automatic static generation at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if we're in build mode
    if (process.env.NEXT_PHASE === 'build') {
      console.log('Build mode detected, returning mock data for brands');
      return NextResponse.json([]);
    }
    
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
