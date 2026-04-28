
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const fileContent = await file.text();

  try {
    const parseResult = Papa.parse(fileContent, { header: true });
    interface ProductCsvRow {
      name: string;
      price: string;
      cost: string;
      stock: string;
      category: string;
      brand: string;
      description?: string;
      imageUrl?: string;
    }
    const products = parseResult.data as ProductCsvRow[];

    let createdCount = 0;
    let updatedCount = 0;

    for (const productData of products) {
      if (!productData.name || !productData.price || !productData.cost || !productData.stock || !productData.category || !productData.brand) {
        console.warn('Skipping invalid row:', productData);
        continue;
      }

      const category = await prisma.category.upsert({
        where: { name: productData.category },
        update: {},
        create: { 
          name: productData.category,
          slug: productData.category.toLowerCase().replace(/\s+/g, '-')
        },
      });

      const brand = await prisma.brand.upsert({
        where: { name: productData.brand },
        update: {},
        create: { 
          name: productData.brand,
          slug: productData.brand.toLowerCase().replace(/\s+/g, '-')
        },
      });

      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: parseFloat(productData.price),
            buyingPrice: parseFloat(productData.cost),
            stockQuantity: parseInt(productData.stock, 10),
            description: productData.description,
            imageUrl: productData.imageUrl,
            brandId: brand.id,
          },
        });
        updatedCount++;
      } else {
        const newProduct = await prisma.product.create({
          data: {
            name: productData.name,
            price: parseFloat(productData.price),
            buyingPrice: parseFloat(productData.cost),
            stockQuantity: parseInt(productData.stock, 10),
            description: productData.description,
            imageUrl: productData.imageUrl,
            sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            brandId: brand.id,
          },
        });

        // Create product-category relationship
        await prisma.productCategory.create({
          data: {
            productId: newProduct.id,
            categoryId: category.id,
          },
        });

        createdCount++;
      }
    }

    return NextResponse.json({ message: 'Upload successful', created: createdCount, updated: updatedCount });

  } catch (error) {
    console.error('CSV parsing or database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process CSV file' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
