import { Router, Request, Response } from 'express';
import { sendMail } from '../lib/mailer.js';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import path from 'node:path';
import fs from 'node:fs';

type AuthenticatedRequest = Request;

const ORDER_STATUS = ['CART', 'ORDERED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
type OrderStatus = (typeof ORDER_STATUS)[number];

const USER_ROLES = ['CUSTOMER', 'ADMIN', 'SELLER'] as const;
type UserRole = (typeof USER_ROLES)[number];

// Helper function to check admin role
const isAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'User not authenticated.' });
    return false;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden: Admins only.' });
    return false;
  }

  return true;
};

export default function createAdminRoutes(prisma: any, authenticateToken: any) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // process.cwd() is expected to be the root of the Ranketha-Website project
      const dest = path.resolve(process.cwd(), 'client/public/images/products');
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '-');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${name}${ext}`);
    }
  });
  const imageUpload = multer({ 
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  // ==============================
  // DASHBOARD & ANALYTICS ROUTES
  // ==============================

  // @route   GET /admin/
  // @desc    Get admin dashboard data
  // @access  Private (Admin only)
  router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      // Get summary counts
      const [
        totalSales,
        totalUsers,
        totalProducts,
        totalOrders,
        lowStockProducts,
        recentOrders
      ] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          _count: { id: true }
        }),
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count({ where: { NOT: { status: 'CART' } } }),
        prisma.product.findMany({
          where: { stockQuantity: { lt: 10 } },
          select: { id: true, name: true, stockQuantity: true }
        }),
        prisma.order.findMany({
          where: { NOT: { status: 'CART' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, email: true } },
          }
        })
      ]);

      // Monthly sales data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const salesData = await prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: sixMonthsAgo },
          NOT: { status: 'CART' }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      // Compute inventory value (sum of price * stockQuantity)
      const productValueList = await prisma.product.findMany({
        select: { price: true, stockQuantity: true }
      });
      const inventoryValue = productValueList.reduce((sum: number, p: { price: number; stockQuantity: number }) => sum + (p.price * (p.stockQuantity || 0)), 0);

      res.json({
        counts: {
          sales: totalSales,
          users: totalUsers,
          products: totalProducts,
          orders: totalOrders
        },
        lowStockProducts,
        recentOrders,
        salesData,
        inventoryValue
      });

    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/analytics/sales
  // @desc    Get sales analytics
  // @access  Private (Admin only)
  router.get("/analytics/sales", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { period = 'monthly', start, end } = req.query;
      const periodValue = typeof period === 'string' ? period : 'monthly';

      let startDate = start ? new Date(start as string) : new Date();
      let endDate = end ? new Date(end as string) : new Date();

      // Default to last 6 months if no dates provided
      if (!start) {
        startDate.setMonth(startDate.getMonth() - 6);
      }

      const salesData = await prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          NOT: { status: 'CART' }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      // Get sales by month
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          NOT: { status: 'CART' }
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Format data by month or day based on period
      const timeSeriesData: Record<string, { count: number, revenue: number, products: Record<string, { name: string, quantity: number, revenue: number, image: string }> }> = {};

      orders.forEach((order: any) => {
        const key: string = periodValue === 'daily'
          ? new Date(order.createdAt).toISOString().slice(0, 10)
          : `${new Date(order.createdAt).getFullYear()}-${new Date(order.createdAt).getMonth() + 1}`;

        if (!timeSeriesData[key]) {
          timeSeriesData[key] = { count: 0, revenue: 0, products: {} };
        }

        const dayStats = timeSeriesData[key];
        dayStats.count += 1;
        dayStats.revenue += order.totalAmount;

        // Process items for this order
        order.items.forEach((item: any) => {
          if (item.product) {
            const prodId = item.product.id;
            if (!dayStats.products[prodId]) {
              dayStats.products[prodId] = {
                name: item.product.name,
                image: item.product.imageUrls?.[0] || '',
                quantity: 0,
                revenue: 0
              };
            }
            dayStats.products[prodId].quantity += item.quantity;
            dayStats.products[prodId].revenue += item.price * item.quantity;
          }
        });
      });

      // Transform products map to sorted array
      const finalTimeSeries = Object.entries(timeSeriesData).reduce((acc: any, [key, data]) => {
        const topProducts = Object.values(data.products)
          .sort((a: any, b: any) => b.quantity - a.quantity)
          .slice(0, 5);

        acc[key] = {
          count: data.count,
          revenue: data.revenue,
          topProducts
        };
        return acc;
      }, {});

      res.json({
        summary: salesData,
        timeSeries: finalTimeSeries
      });

    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/analytics/products
  // @desc    Get product analytics
  // @access  Private (Admin only)
  router.get("/analytics/products", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      // Get top selling products
      const topSellingProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      });

      // Fetch product details for each top seller
      const productsWithDetails = await Promise.all(
        topSellingProducts.map(async (item: { productId: string; _sum: { quantity: number; price: number } }) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrls: true,
              price: true,
              stockQuantity: true
            }
          });

          return {
            ...product,
            soldQuantity: item._sum.quantity,
            revenue: item._sum.price
          };
        })
      );

      // Products by category
      const productsByCategory = await prisma.productCategory.groupBy({
        by: ['categoryId'],
        _count: {
          productId: true
        }
      });

      // Get category names
      const categoriesWithCounts = await Promise.all(
        productsByCategory.map(async (item: { categoryId: string; _count: { productId: number } }) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId },
            select: { id: true, name: true, slug: true }
          });

          return {
            ...category,
            productCount: item._count.productId
          };
        })
      );

      res.json({
        topSellingProducts: productsWithDetails,
        productsByCategory: categoriesWithCounts
      });

    } catch (error) {
      console.error("Error fetching product analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/analytics/users
  // @desc    Get user analytics
  // @access  Private (Admin only)
  router.get("/analytics/users", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      // User registration over time
      const userSignups = await prisma.user.findMany({
        select: {
          id: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // Top spending customers
      const topCustomers = await prisma.order.groupBy({
        by: ['userId'],
        where: { NOT: { status: 'CART' } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: {
          _sum: { totalAmount: 'desc' }
        },
        take: 10
      });

      // Fetch user details for top customers
      const customersWithDetails = await Promise.all(
        topCustomers.map(async (item: { userId: string; _sum: { totalAmount: number }; _count: { id: number } }) => {
          const user = await prisma.user.findUnique({
            where: { id: item.userId },
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          });

          return {
            ...user,
            totalSpent: item._sum.totalAmount,
            orderCount: item._count.id
          };
        })
      );

      // Group user signups by month
      const signupsByMonth: Record<string, number> = {};
      userSignups.forEach((user: { id: string; createdAt: Date }) => {
        const month = `${user.createdAt.getFullYear()}-${user.createdAt.getMonth() + 1}`;
        if (!signupsByMonth[month]) {
          signupsByMonth[month] = 0;
        }
        signupsByMonth[month]++;
      });

      res.json({
        topCustomers: customersWithDetails,
        signupsByMonth
      });

    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==============================
  // PRODUCT MANAGEMENT ROUTES
  // ==============================

  // @route   POST /admin/upload-image
  // @desc    Upload an image for a product
  // @access  Private (Admin only)
  router.post("/upload-image", authenticateToken, imageUpload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // The URL path starts from the public folder, so we just return the relative path
      const imageUrl = `/images/products/${req.file.filename}`;
      
      res.status(200).json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/products
  // @desc    Get all products (admin version with more details)
  // @access  Private (Admin only)
  router.get("/products", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { page = 1, limit = 20, search, category, featured } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause based on filters
      const where: any = {};

      if (search) {
        where.name = { contains: search as string, mode: 'insensitive' };
      }

      if (featured === 'true') {
        where.isFeatured = true;
      } else if (featured === 'false') {
        where.isFeatured = false;
      }

      if (category) {
        where.categories = {
          some: {
            category: {
              slug: category as string
            }
          }
        };
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            categories: {
              include: { category: true }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.product.count({ where })
      ]);

      res.json({
        products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/products/:id
  // @desc    Get product by ID
  // @access  Private (Admin only)
  router.get("/products/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          categories: {
            include: { category: true }
          },
          reviews: {
            include: { user: { select: { name: true, email: true } } }
          },
          orderItems: {
            include: { order: true }
          }
        }
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   POST /admin/products
  // @desc    Create a new product
  // @access  Private (Admin only)
  router.post("/products", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const {
        name,
        description,
        price,
        stockQuantity,
        categories,
        imageUrls,
        isFeatured,
        isUsed,
        itemCode
      } = req.body;

      // Validate required fields
      if (!name || !description || !price || stockQuantity === undefined || !itemCode) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      // Enforce exactly one category
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ message: "Category is required" });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if slug or itemCode already exists
      const existing = await prisma.product.findFirst({
        where: { OR: [{ slug }, { itemCode }] }
      });

      if (existing) {
        return res.status(400).json({ message: "A product with this name or item code already exists" });
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price: parseFloat(price.toString()),
          stockQuantity: parseInt(stockQuantity.toString()),
          imageUrls: imageUrls || [],
          isFeatured: isFeatured || false,
          isUsed: isUsed || false,
          itemCode
        }
      });

      // Add exactly one category (first provided)
      if (categories && categories.length > 0) {
        const categoryId = categories[0];
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId }
        });
      }

      // Get the product with categories
      const productWithCategories = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          categories: {
            include: { category: true }
          }
        }
      });

      res.status(201).json(productWithCategories);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   POST /admin/products/bulk
  // @desc    Bulk create products via CSV upload
  // @access  Private (Admin only)
  router.post("/products/bulk", authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: 'CSV file is required (field name: file).' });
      }

      const csv = req.file.buffer.toString('utf-8');
      let records: any[] = [];
      try {
        records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (e) {
        return res.status(400).json({ message: 'Invalid CSV format' });
      }

      const results: { created: number; skipped: number; errors: Array<{ row: number; reason: string }> } = {
        created: 0,
        skipped: 0,
        errors: [],
      };

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        try {
          const name = row.name?.toString().trim();
          const description = row.description?.toString().trim();
          const price = parseFloat(row.price);
          const stockQuantity = parseInt(row.stockQuantity);
          const itemCode = row.itemCode?.toString().trim();
          const imageUrl = row.imageUrl?.toString().trim();
          const imageUrls = row.imageUrls ? String(row.imageUrls).split(/[,;\s]+/).filter(Boolean) : (imageUrl ? [imageUrl] : []);
          const isFeatured = row.isFeatured?.toString().toLowerCase() === 'true';
          const isUsed = row.isUsed?.toString().toLowerCase() === 'true';
          const categoriesField = row.categories ? String(row.categories) : '';
          const categoryTokens = categoriesField ? categoriesField.split(/[,;]+/).map((s: string) => s.trim()).filter(Boolean) : [];

          if (!name || !description || isNaN(price) || isNaN(stockQuantity) || !itemCode) {
            results.skipped++; results.errors.push({ row: i + 1, reason: 'Missing required fields' }); continue;
          }

          // Build slug and check uniqueness by slug or itemCode
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { itemCode }] } });
          if (existing) { results.skipped++; results.errors.push({ row: i + 1, reason: 'Duplicate slug or itemCode' }); continue; }

          const product = await prisma.product.create({
            data: {
              name,
              slug,
              description,
              price,
              stockQuantity,
              imageUrls,
              isFeatured,
              isUsed,
              itemCode,
            }
          });

          if (categoryTokens.length > 0) {
            // Map categories by slug or name; create if missing
            const rawToken = categoryTokens[0];
            const token = rawToken?.trim();
            if (token) {
              const slugToken = token.toLowerCase().replace(/[^a-z0-9]+/g, '-');

              let cat = await prisma.category.findFirst({
                where: { OR: [{ slug: slugToken }, { name: token }] },
                select: { id: true }
              });

              if (!cat) {
                try {
                  const created = await prisma.category.create({ data: { name: token, slug: slugToken } });
                  cat = { id: created.id };
                } catch (e) {
                  cat = await prisma.category.findFirst({ where: { slug: slugToken }, select: { id: true } });
                }
              }

              if (cat) {
                await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
              }
            }
          }

          results.created++;
        } catch (err: any) {
          results.skipped++;
          results.errors.push({ row: i + 1, reason: err?.message || 'Unknown error' });
        }
      }

      res.json(results);
    } catch (error) {
      console.error('Bulk import failed:', error);
      res.status(500).json({ message: 'Failed to import products' });
    }
  });

  // @route   PUT /admin/products/:id
  // @desc    Update a product
  // @access  Private (Admin only)
  router.put("/products/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const {
        name,
        description,
        price,
        stockQuantity,
        categories,
        imageUrls,
        isFeatured,
        isUsed,
        itemCode
      } = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        include: { categories: true }
      });

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Prepare update data
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name;
        // Only update slug if name changes
        if (name !== existingProduct.name) {
          updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
      }

      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price.toString());
      if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity.toString());
      if (imageUrls !== undefined) updateData.imageUrls = imageUrls;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
      if (isUsed !== undefined) updateData.isUsed = isUsed;
      if (itemCode !== undefined) updateData.itemCode = itemCode;

      // Check if slug or itemCode would conflict
      if (updateData.slug || updateData.itemCode) {
        const conflict = await prisma.product.findFirst({
          where: {
            OR: [
              updateData.slug ? { slug: updateData.slug } : {},
              updateData.itemCode ? { itemCode: updateData.itemCode } : {}
            ],
            NOT: { id }
          }
        });

        if (conflict) {
          return res.status(400).json({ message: "A product with this name or item code already exists" });
        }
      }

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData
      });

      // Update categories if provided (enforce single category)
      if (categories && categories.length > 0) {
        // Delete existing categories
        await prisma.productCategory.deleteMany({ where: { productId: id } });
        // Add only the first category
        const categoryId = categories[0];
        await prisma.productCategory.create({ data: { productId: id, categoryId } });
      }

      // Get the updated product with categories
      const productWithCategories = await prisma.product.findUnique({
        where: { id },
        include: {
          categories: {
            include: { category: true }
          }
        }
      });

      res.json(productWithCategories);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   DELETE /admin/products/:id
  // @desc    Delete a product
  // @access  Private (Admin only)
  router.delete("/products/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id },
        include: { orderItems: true }
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if product is referenced in orders
      if (product.orderItems.length > 0) {
        return res.status(400).json({
          message: "Cannot delete product that has been ordered. Consider updating stockQuantity to 0 instead."
        });
      }

      // Delete product categories
      await prisma.productCategory.deleteMany({
        where: { productId: id }
      });

      // Delete product reviews
      await prisma.review.deleteMany({
        where: { productId: id }
      });

      // Delete product
      await prisma.product.delete({
        where: { id }
      });

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/products/:id/featured
  // @desc    Toggle featured status
  // @access  Private (Admin only)
  router.put("/products/:id/featured", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const { isFeatured } = req.body;

      // Update featured status
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { isFeatured: isFeatured === true }
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating featured status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==============================
  // CATEGORY MANAGEMENT ROUTES
  // ==============================

  // @route   GET /admin/categories
  // @desc    Get all categories
  // @access  Private (Admin only)
  router.get("/categories", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   POST /admin/categories
  // @desc    Create a new category
  // @access  Private (Admin only)
  router.post("/categories", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Generate slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if category exists
      const existingCategory = await prisma.category.findFirst({
        where: { OR: [{ name }, { slug }] }
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }

      // Create category
      const category = await prisma.category.create({
        data: { name, slug }
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/categories/:id
  // @desc    Update a category
  // @access  Private (Admin only)
  router.put("/categories/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Generate slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if category exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [{ name }, { slug }],
          NOT: { id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" });
      }

      // Update category
      const category = await prisma.category.update({
        where: { id },
        data: { name, slug }
      });

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   DELETE /admin/categories/:id
  // @desc    Delete a category
  // @access  Private (Admin only)
  router.delete("/categories/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check if category has products
      if (category._count.products > 0) {
        return res.status(400).json({ message: "Cannot delete category with associated products" });
      }

      // Delete category
      await prisma.category.delete({
        where: { id }
      });

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==============================
  // ORDER MANAGEMENT ROUTES
  // ==============================

  // @route   GET /admin/orders
  // @desc    Get all orders
  // @access  Private (Admin only)
  router.get("/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { page = 1, limit = 20, status, search, userId, productId } = req.query as Record<string, string>;
      // Support both startDate/endDate and start/end query names
      const startDateParam = (req.query as any).startDate || (req.query as any).start || "";
      const endDateParam = (req.query as any).endDate || (req.query as any).end || "";
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause based on filters
      const where: any = {
        NOT: { status: 'CART' }
      };

      // Filter by userId if provided
      if (userId) {
        where.userId = userId;
      }

      // Filter by productId if provided
      if (productId) {
        where.items = {
          some: {
            productId: productId
          }
        };
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { id: { contains: search as string } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
          { user: { name: { contains: search as string, mode: 'insensitive' } } }
        ];
      }

      // Date range filter (inclusive of full end date)
      if (startDateParam || endDateParam) {
        const createdAt: any = {};
        let s: Date | null = null;
        let e: Date | null = null;
        if (typeof startDateParam === 'string' && startDateParam.trim() !== '') {
          const d = new Date(startDateParam);
          if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid startDate' });
          s = d;
        }
        if (typeof endDateParam === 'string' && endDateParam.trim() !== '') {
          const d = new Date(endDateParam);
          if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid endDate' });
          // Set to end of the day UTC to be inclusive
          e = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        }
        // If both provided and reversed, swap
        if (s && e && s.getTime() > e.getTime()) {
          const tmp = s; s = e; e = tmp;
        }
        if (s) createdAt.gte = s;
        if (e) createdAt.lte = e;
        if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            items: {
              include: {
                product: {
                  select: { id: true, name: true, imageUrls: true }
                }
              }
            },
            shippingAddress: true
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/orders/:id
  // @desc    Get order by ID
  // @access  Private (Admin only)
  router.get("/orders/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          items: {
            include: {
              product: true
            }
          },
          shippingAddress: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/orders/:id/status
  // @desc    Update order status
  // @access  Private (Admin only)
  router.put("/orders/:id/status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const { status } = req.body;

      if (!status || !ORDER_STATUS.includes(status as OrderStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Check if order exists with its items
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // If changing to CANCELLED status, restock items
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        console.log(`Restocking items for cancelled order ${id}`);

        // Restock each item
        for (const item of order.items) {
          if (item.product) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  increment: item.quantity
                }
              }
            });
            console.log(`Restocked ${item.quantity} of product ${item.product.name} (ID: ${item.productId})`);
          }
        }
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: status as OrderStatus }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/orders/:id/tracking
  // @desc    Update order tracking number
  // @access  Private (Admin only)
  router.put("/orders/:id/tracking", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id: orderId } = req.params;
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      const { trackingNumber } = req.body as { trackingNumber?: string };

      // Load order with user to send notification
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { email: true, name: true } } }
      });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const normalizedTracking = trackingNumber && trackingNumber.trim() !== "" ? trackingNumber.trim() : null;

      // Prepare update: set tracking number, and auto-set status to SHIPPED if applicable
      const updateData: any = { trackingNumber: normalizedTracking };
      if (normalizedTracking && order.status !== 'CANCELLED' && order.status !== 'DELIVERED') {
        updateData.status = 'SHIPPED';
      }

      const updated = await prisma.order.update({ where: { id: orderId }, data: updateData });

      // Fire-and-forget email notification (don't fail request if email fails)
      if (normalizedTracking && order.user?.email) {
        const to = order.user.email;
        const customerName = order.user.name || 'Customer';
        const subject = `Your RoboClub order has shipped – Tracking #${normalizedTracking}`;
        const trackUrl = `https://promptxpress.lk/TrackItem.aspx#`;
        const shortId = orderId.slice(0, 8);
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin:0 0 12px;">Good news, ${customerName}!</h2>
            <p>Your RoboClub order <strong>#${shortId}</strong> has been shipped.</p>
            <p>
              <strong>Tracking number:</strong> <code>${normalizedTracking}</code>
            </p>
            <p>
              Track your parcel on Prompt Xpress:
              <a href="${trackUrl}" target="_blank" rel="noopener noreferrer">${trackUrl}</a>
            </p>
            <p style="font-size: 12px; color: #555;">Tip: If the tracking number isn't auto-filled, paste <code>${normalizedTracking}</code> on the tracking page.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
            <p>Thanks for shopping with RoboClub.</p>
          </div>
        `;
        const text = `Good news, ${customerName}!
Your RoboClub order #${shortId} has been shipped.

Tracking number: ${normalizedTracking}
Track on Prompt Xpress: ${trackUrl}

If it's not auto-filled, paste the tracking number on the page.`;

        sendMail({ to, subject, html, text }).catch((err: any) => {
          console.warn('Order tracking email failed:', err);
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating order tracking number:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   DELETE /admin/orders/:id/items/:itemId
  // @desc    Remove an item from an order and restock it (unless order is CANCELLED)
  // @access  Private (Admin only)
  router.delete("/orders/:id/items/:itemId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id, itemId } = req.params;

      // Load order with item and product
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } }
        }
      });
      if (!order) return res.status(404).json({ message: "Order not found" });

      const item = order.items.find((it: any) => it.id === itemId);
      if (!item) return res.status(404).json({ message: "Order item not found" });

      // Prevent double-restock for CANCELLED orders
      const shouldRestock = order.status !== 'CANCELLED';

      await prisma.$transaction(async (tx: any) => {
        // Delete the item
        await tx.orderItem.delete({ where: { id: itemId } });

        // Restock product if applicable
        if (shouldRestock) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } }
          });
        }

        // Recalculate total
        const remaining = await tx.orderItem.findMany({ where: { orderId: id } });
        const newTotal = remaining.reduce((sum: number, it: any) => sum + it.quantity * it.price, 0);
        await tx.order.update({ where: { id }, data: { totalAmount: newTotal } });
      });

      // Return updated order summary
      const updated = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } }
      });
      res.json(updated);
    } catch (error) {
      console.error("Error removing order item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/orders/:id/items/:itemId/price
  // @desc    Update an order item's unit price and recalc order total
  // @access  Private (Admin only)
  router.put("/orders/:id/items/:itemId/price", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id, itemId } = req.params;
      const { price } = req.body as { price?: number };
      const newPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (newPrice == null || isNaN(newPrice) || newPrice < 0) {
        return res.status(400).json({ message: 'Invalid price' });
      }

      // Ensure order and item exist
      const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
      if (!item || item.orderId !== id) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.orderItem.update({ where: { id: itemId }, data: { price: newPrice } });
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        const newTotal = items.reduce((sum: number, it: any) => sum + it.quantity * it.price, 0);
        await tx.order.update({ where: { id }, data: { totalAmount: newTotal } });
      });

      const updated = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } }
      });
      res.json(updated);
    } catch (error) {
      console.error('Error updating order item price:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // @route   DELETE /admin/orders/:id
  // @desc    Delete an order (only if CANCELLED)
  // @access  Private (Admin only)
  router.delete("/orders/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      // Find order and validate status
      const order = await prisma.order.findUnique({
        where: { id },
        select: { id: true, status: true }
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status !== 'CANCELLED') {
        return res.status(400).json({ message: "Only cancelled orders can be deleted. Change status to CANCELLED first." });
      }

      // Delete order items first due to relational constraints
      await prisma.orderItem.deleteMany({ where: { orderId: id } });

      // Delete the order
      await prisma.order.delete({ where: { id } });

      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==============================
  // USER MANAGEMENT ROUTES
  // ==============================

  // @route   GET /admin/users
  // @desc    Get all users
  // @access  Private (Admin only)
  router.get("/users", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { page = 1, limit = 20, role, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause based on filters
      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            _count: {
              select: { orders: true, addresses: true }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/users/:id
  // @desc    Get user by ID
  // @access  Private (Admin only)
  router.get("/users/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          addresses: true,
          orders: {
            where: { NOT: { status: 'CART' } },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/users/:id/role
  // @desc    Update user role
  // @access  Private (Admin only)
  router.put("/users/:id/role", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const { role } = req.body;

      if (!role || !USER_ROLES.includes(role as UserRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow changing own role if admin
      if (id === req.user?.id && role !== 'ADMIN') {
        return res.status(400).json({ message: "Cannot change your own admin status" });
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: role as UserRole },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
}
