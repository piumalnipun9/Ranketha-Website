import { Router, Request, Response } from 'express';

type AuthenticatedRequest = Request;

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

export default function createAdminExpensesRoutes(prisma: any, authenticateToken: any) {
  const router = Router();

  // List expenses with filters and pagination
  router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { page = '1', limit = '20', search, category, startDate, endDate, minAmount, maxAmount } = req.query as Record<string, string | undefined>;
      const pageNum = Math.max(1, parseInt(String(page)) || 1);
      const take = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
      const skip = (pageNum - 1) * take;

      const where: any = {};
      if (search) {
        const s = String(search);
        where.OR = [
          { title: { contains: s, mode: 'insensitive' } },
          { description: { contains: s, mode: 'insensitive' } },
          { vendor: { contains: s, mode: 'insensitive' } },
          { category: { contains: s, mode: 'insensitive' } },
        ];
      }
      if (category) where.category = String(category);
      if (startDate || endDate) {
        where.date = {};
        if (startDate) (where.date as any).gte = new Date(String(startDate));
        if (endDate) (where.date as any).lte = new Date(String(endDate));
      }
      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) (where.amount as any).gte = parseFloat(String(minAmount));
        if (maxAmount) (where.amount as any).lte = parseFloat(String(maxAmount));
      }

      const [items, total, categories] = await Promise.all([
        prisma.expense.findMany({ where, orderBy: { date: 'desc' }, skip, take }),
        prisma.expense.count({ where }),
        prisma.expense.groupBy({ by: ['category'], _count: { _all: true } })
      ]);

      res.json({
        expenses: items,
        categories: categories.map((c: any) => c.category),
        pagination: { total, page: pageNum, limit: take, pages: Math.ceil(total / take) }
      });
    } catch (err) {
      console.error('Error listing expenses:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create expense
  router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { title, description, amount, category, paymentMethod, vendor, date, notes, receiptUrl } = req.body || {};
      if (!title || amount == null || isNaN(parseFloat(String(amount))) || !category) {
        return res.status(400).json({ message: 'title, amount, and category are required' });
      }
      const created = await prisma.expense.create({
        data: {
          title: String(title),
          description: description ? String(description) : null,
          amount: parseFloat(String(amount)),
          category: String(category),
          paymentMethod: paymentMethod ? String(paymentMethod) : null,
          vendor: vendor ? String(vendor) : null,
          date: date ? new Date(String(date)) : new Date(),
          notes: notes ? String(notes) : null,
          receiptUrl: receiptUrl ? String(receiptUrl) : null,
          createdById: req.user?.id || null,
        }
      });
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating expense:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get single expense
  router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { id } = req.params;
      const item = await prisma.expense.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ message: 'Expense not found' });
      res.json(item);
    } catch (err) {
      console.error('Error fetching expense:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update expense
  router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { id } = req.params;
      const { title, description, amount, category, paymentMethod, vendor, date, notes, receiptUrl } = req.body || {};

      const updateData: any = {};
      if (title !== undefined) updateData.title = String(title);
      if (description !== undefined) updateData.description = description ? String(description) : null;
      if (amount !== undefined) updateData.amount = parseFloat(String(amount));
      if (category !== undefined) updateData.category = String(category);
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod ? String(paymentMethod) : null;
      if (vendor !== undefined) updateData.vendor = vendor ? String(vendor) : null;
      if (date !== undefined) updateData.date = date ? new Date(String(date)) : new Date();
      if (notes !== undefined) updateData.notes = notes ? String(notes) : null;
      if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl ? String(receiptUrl) : null;

      const updated = await prisma.expense.update({ where: { id }, data: updateData });
      res.json(updated);
    } catch (err) {
      console.error('Error updating expense:', err);
      if ((err as any)?.code === 'P2025') return res.status(404).json({ message: 'Expense not found' });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete expense
  router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { id } = req.params;
      await prisma.expense.delete({ where: { id } });
      res.json({ message: 'Expense deleted' });
    } catch (err) {
      console.error('Error deleting expense:', err);
      if ((err as any)?.code === 'P2025') return res.status(404).json({ message: 'Expense not found' });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Summary endpoint: totals by period and category
  router.get('/summary/by', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;
      const { group = 'month', startDate, endDate } = req.query as Record<string, string | undefined>;
      const where: any = {};
      if (startDate || endDate) {
        where.date = {};
        if (startDate) (where.date as any).gte = new Date(String(startDate));
        if (endDate) (where.date as any).lte = new Date(String(endDate));
      }

      const items = await prisma.expense.findMany({ where, orderBy: { date: 'asc' } });
      const byTime: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      for (const e of items) {
        const d = new Date(e.date);
        const key = group === 'day' ? d.toISOString().slice(0, 10) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        byTime[key] = (byTime[key] || 0) + e.amount;
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      }
      const total = items.reduce((s: number, e: any) => s + e.amount, 0);
      res.json({ total, byTime, byCategory });
    } catch (err) {
      console.error('Error computing expense summary:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
