import { Router, Request, Response } from 'express';

export default function createOrdersRoutes(prisma: any, authenticateToken: any) {
	const router = Router();

	// @route GET /orders
	router.get('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const skip = (page - 1) * limit;

			const [orders, total] = await Promise.all([
				prisma.order.findMany({
					where: { userId, NOT: { status: 'CART' } },
					include: { items: { include: { product: true } } },
					orderBy: { createdAt: 'desc' },
					skip,
					take: limit
				}),
				prisma.order.count({
					where: { userId, NOT: { status: 'CART' } }
				})
			]);

			const formattedOrders = orders.map((order: any) => ({
				id: order.id,
				date: order.createdAt.toISOString().split('T')[0],
				status: order.status,
				total: order.totalAmount,
				trackingNumber: order.trackingNumber || `TRK${order.id.substring(0, 8)}`.toUpperCase(),
				items: order.items.map((item: any) => ({
					name: item.product.name,
					quantity: item.quantity,
					price: item.price,
					image: item.product.imageUrls?.[0] || null
				}))
			}));

			res.json({
				orders: formattedOrders,
				pagination: {
					total,
					page,
					limit,
					pages: Math.ceil(total / limit)
				}
			});
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch orders' });
		}
	});

	return router;
}
