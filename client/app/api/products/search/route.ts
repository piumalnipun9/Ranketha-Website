import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({error: 'Query parameter is missing'}, {status: 400});
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        brand: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        categories: {
                            some: {
                                category: {
                                    name: {
                                        contains: query,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    },
                ],
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
        console.error('Error searching products:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}