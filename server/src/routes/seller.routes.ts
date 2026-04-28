import express, { Response } from "express";
// Authorization interface
interface AuthenticatedRequest extends express.Request {
    user?: { id: string; role: string };
}

export default function createSellerRoutes(prisma: any, authenticateToken: any) {
    const router = express.Router();

    const isSeller = (req: AuthenticatedRequest, res: Response) => {
        if (req.user?.role !== "SELLER" && req.user?.role !== "ADMIN") {
            res.status(403).json({ message: "Access denied. Seller role required." });
            return false;
        }
        return true;
    };

    // @route   GET /seller/dashboard
    // @desc    Get seller dashboard statistics (orders placed by this seller/user)
    // @access  Private (Seller)
    router.get("/dashboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!isSeller(req, res)) return;

            const userId = req.user!.id;
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Get all orders placed BY this user (not CART status)
            const allOrders = await prisma.order.findMany({
                where: {
                    userId: userId,
                    status: { not: 'CART' }
                },
                select: { totalAmount: true, createdAt: true }
            });

            const totalSales = allOrders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);
            const totalOrdersCount = allOrders.length;

            // Monthly orders
            const monthlyOrders = allOrders.filter((order: any) => new Date(order.createdAt) >= firstDayOfMonth);
            const monthlySales = monthlyOrders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);
            const monthlyOrdersCount = monthlyOrders.length;

            res.json({
                totalSales,
                totalOrders: totalOrdersCount,
                monthlySales,
                monthlyOrders: monthlyOrdersCount
            });

        } catch (error) {
            console.error("Error fetching seller dashboard:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // @route   GET /seller/orders
    // @desc    Get orders placed BY this seller/user
    // @access  Private (Seller)
    router.get("/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!isSeller(req, res)) return;

            const userId = req.user!.id;
            const { page = 1, limit = 20, search } = req.query as any;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {
                userId: userId,
                status: { not: 'CART' }
            };

            if (search) {
                where.OR = [
                    { id: { contains: search as string } }
                ];
            }

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    include: {
                        user: { select: { name: true, email: true } },
                        items: {
                            include: { product: true }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.order.count({ where })
            ]);

            const formattedOrders = orders.map((order: any) => ({
                ...order,
                totalAmount: order.totalAmount
            }));

            res.json({
                orders: formattedOrders,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            });

        } catch (error) {
            console.error("Error fetching seller orders:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}
