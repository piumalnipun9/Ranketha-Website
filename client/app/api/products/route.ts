import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

// Prevent automatic static generation at build time
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Check if we're in build mode
        if (process.env.NEXT_PHASE === 'build') {
            console.log('Build mode detected, returning mock data for products');
            return NextResponse.json([]);
        }
        
        const products = await prisma.product.findMany({
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
        console.error('Error fetching products:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}