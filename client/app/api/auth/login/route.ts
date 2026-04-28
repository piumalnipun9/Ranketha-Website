
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // For demo purposes, we'll accept the hardcoded credentials
  // In a real application, you would hash and verify passwords properly
  if (email === 'test@example.com' && password === 'password') {
    try {
      // Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { email: email }
      });

      // If user doesn't exist, create them
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email,
            name: 'Test User',
            role: 'CUSTOMER'
          }
        });
      }

      return NextResponse.json({ 
        success: true, 
        user: { 
          id: user.id,
          name: user.name || 'Test User', 
          email: user.email,
          role: user.role
        } 
      });
    } catch (error) {
      console.error('Database error during login:', error);
      return new Response('Internal server error', { status: 500 });
    }
  } else {
    return new Response('Invalid credentials', { status: 401 });
  }
}
