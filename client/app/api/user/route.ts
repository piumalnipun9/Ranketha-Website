import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mark as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check if we're in build mode
    if (process.env.NEXT_PHASE === 'build') {
      console.log('Build mode detected, returning mock data for user');
      return NextResponse.json({
        id: 'mock-id',
        name: 'Mock User',
        email: 'mock@example.com',
        role: 'CUSTOMER'
      });
    }
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name || 'User',
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
