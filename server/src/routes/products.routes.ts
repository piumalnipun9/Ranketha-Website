import { Router, Request, Response } from 'express';

export default function createProductsRoutes(prisma: any) {
  const router = Router();

  // GET /products
  router.get('/', async (req: Request, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        include: { categories: { include: { category: true } } }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: `Internal Server Error ${error}` });
    }
  });

  // GET /products/featured
  router.get('/featured', async (req: Request, res: Response) => {
    try {
      console.log("Fetching featured products...");
      
      // Check if database connection is working
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection is working");
      } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return res.status(500).json({ error: 'Database connection failed', details: dbError });
      }
      
      const featuredProducts = await prisma.product.findMany({
        where: { isFeatured: true },
        include: { categories: { include: { category: true } } }
      });
      
      console.log(`Found ${featuredProducts.length} featured products`);
      res.json(featuredProducts);
    } catch (error: any) {
      console.error("Error fetching featured products:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message, 
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });

  // GET /products/:slug
  router.get('/product/:slug', async (req: Request, res: Response) => {
    try {
      const raw = String(req.params.slug || '').trim();
      const slugLc = raw.toLowerCase();
      const slugNoHyphen = slugLc.replace(/-/g, '');

      const include = { categories: { include: { category: true } } };

      // 1) Try exact/insensitive slug match first
      let product = await prisma.product.findFirst({
        where: { slug: { equals: slugLc, mode: 'insensitive' } },
        include,
      });

      // 2) Try sanitized slug (strip non a-z0-9-)
      if (!product) {
        const sanitized = slugLc.replace(/[^a-z0-9-]/g, '');
        if (sanitized && sanitized !== slugLc) {
          product = await prisma.product.findFirst({
            where: { slug: { equals: sanitized, mode: 'insensitive' } },
            include,
          });
        }
      }

      // 3) Fuzzy: search by strongest name token and then resolve by slugify(name)
      if (!product) {
        const sanitized = slugLc.replace(/[^a-z0-9-]/g, '');
        const tokens = sanitized.split('-').filter(Boolean);
        if (tokens.length > 0) {
          // Pick the longest token to narrow results
          const primary = tokens.slice().sort((a, b) => b.length - a.length)[0];
          const candidates = await prisma.product.findMany({
            where: { name: { contains: primary, mode: 'insensitive' } },
            include,
            take: 50,
          });
          const slugify = (name: string) => name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          product = candidates.find((p: any) => {
            const pSlug = typeof p?.slug === 'string' ? p.slug.toLowerCase() : '';
            const pSlugNoHyphen = pSlug.replace(/-/g, '');
            if (pSlug && (pSlug === slugLc || pSlugNoHyphen === slugNoHyphen)) return true;
            const derived = slugify(p?.name || '');
            const derivedNoHyphen = derived.replace(/-/g, '');
            return derived === sanitized || derived === slugLc || derivedNoHyphen === slugNoHyphen;
          }) || null as any;
        }
      }

      if (product) {
        return res.json(product);
      }
      return res.status(404).json({ error: 'Product not found' });
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/categories', async (req: Request, res: Response) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/used-products', async (req: Request, res: Response) => {
    try {
      const usedProducts = await prisma.product.findMany({
        where: { isUsed: true },
        include: { categories: { include: { category: true } } }
      });
      res.json(usedProducts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
