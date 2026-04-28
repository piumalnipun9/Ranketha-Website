import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

import createAuthRoutes from './routes/auth.routes.js';
import createProductsRoutes from './routes/products.routes.js';
import createUserRoutes from './routes/user.routes.js';
import createAddressesRoutes from './routes/addresses.routes.js';
import createCartRoutes from './routes/cart.routes.js';
import createOrdersRoutes from './routes/orders.routes.js';
import createCheckoutRoutes from './routes/checkout.routes.js';
import createAdminRoutes from './routes/admin.routes.js';
import createAdminProjectsRoutes from './routes/admin.projects.js';
import createNewsletterRoutes from './routes/newsletter.routes.js';
import createProjectsRoutes from './routes/projects.routes.js';
import createAdminExpensesRoutes from './routes/admin.expenses.js';
import createSellerRoutes from './routes/seller.routes.js';

import jwt from 'jsonwebtoken';

import { fileURLToPath } from "url";

const envPath = process.env.SERVER_ENV_PATH || path.resolve(process.cwd(), 'server', '.env');
dotenv.config({ path: envPath });

console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

// Authentication Middleware (shared)
interface AuthenticatedRequest extends express.Request {
  user?: { id: string; role: string };
}
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_development';
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = (req.headers as any)['authorization'] as string | undefined;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ message: 'Authentication token required' });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user as { id: string; role: string };
    next();
  });
};

// Initialize Prisma client with Prisma Accelerate
const prisma = new PrismaClient({
  // Prisma Accelerate configuration is handled through the DATABASE_URL
  // with the prisma+postgres:// protocol
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5000;
const dev = process.env.NODE_ENV !== 'production';
const nextDir = path.resolve(__dirname, '../../client');

async function startServer() {
  // Dynamic import to avoid TS callable type issues
  // @ts-ignore Next default export is callable at runtime
  const next = (await import('next')).default as any;
  // @ts-ignore invoke Next app factory
  const nextApp = next({ dev, dir: nextDir });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());

  // Use modular routes under /api to avoid clashing with Next pages
  app.use('/api/auth', createAuthRoutes(prisma, JWT_SECRET));
  app.use('/api/products', createProductsRoutes(prisma));
  app.use('/api/user', createUserRoutes(prisma, authenticateToken));
  app.use('/api/addresses', createAddressesRoutes(prisma, authenticateToken));
  app.use('/api/cart', createCartRoutes(prisma, authenticateToken));
  app.use('/api/orders', createOrdersRoutes(prisma, authenticateToken));
  app.use('/api/checkout', createCheckoutRoutes(prisma, authenticateToken));
  app.use('/api/admin', createAdminRoutes(prisma, authenticateToken));
  // Mount admin projects routes AFTER main admin routes to avoid conflicts
  app.use('/api/admin/projects', createAdminProjectsRoutes(prisma, authenticateToken));
  app.use('/api/admin/expenses', createAdminExpensesRoutes(prisma, authenticateToken));
  app.use('/api/newsletter', createNewsletterRoutes(prisma));
  app.use('/api/projects', createProjectsRoutes(prisma));
  app.use('/api/seller', createSellerRoutes(prisma, authenticateToken));

  // Let Next.js handle everything else (SSR/frontend)
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});