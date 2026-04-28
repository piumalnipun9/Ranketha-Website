import { Router, Request, Response } from 'express';

export default function createCartRoutes(prisma: any, authenticateToken: any) {
	const router = Router();

	// Add item to cart
	router.post('/add', authenticateToken, async (req: any, res: Response) => {
		const { productId, quantity = 1 } = req.body;
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
		if (!productId) return res.status(400).json({ message: 'Product ID is required.' });
		try {
			let cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) cart = await prisma.order.create({ data: { userId, status: 'CART', totalAmount: 0 } });
			const existingCartItem = await prisma.orderItem.findFirst({ where: { orderId: cart.id, productId } });
			const productDetails = await prisma.product.findUnique({ where: { id: productId }, select: { price: true, stockQuantity: true } });
			if (!productDetails) return res.status(404).json({ message: 'Product not found.' });
			if (existingCartItem) {
				const newQuantity = existingCartItem.quantity + quantity;
				await prisma.orderItem.update({ where: { id: existingCartItem.id }, data: { quantity: newQuantity } });
			} else {
				await prisma.orderItem.create({ data: { orderId: cart.id, productId, quantity, price: productDetails.price } });
			}
			const updatedCartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const newTotalAmount = updatedCartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: newTotalAmount } });
			res.status(200).json({ message: 'Product added to cart successfully!' });
		} catch (error) {
			res.status(500).json({ message: 'Internal server error.' });
		}
	});

	// Update cart item quantity
	router.put('/update', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const { productId, quantity } = req.body;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) return res.status(404).json({ message: 'Cart not found' });
			await prisma.orderItem.updateMany({ where: { orderId: cart.id, productId }, data: { quantity } });
			const updatedCartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const newTotalAmount = updatedCartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: newTotalAmount } });
			res.json({ message: 'Cart updated successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to update cart' });
		}
	});

	// Remove item from cart
	router.delete('/remove/:productId', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const productId = req.params.productId;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) return res.status(404).json({ message: 'Cart not found' });
			await prisma.orderItem.deleteMany({ where: { orderId: cart.id, productId } });
			const updatedCartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const newTotalAmount = updatedCartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: newTotalAmount } });
			res.json({ message: 'Item removed from cart successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to remove item from cart' });
		}
	});

	// Clear cart
	router.delete('/clear', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (cart) {
				await prisma.orderItem.deleteMany({ where: { orderId: cart.id } });
				await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: 0 } });
			}
			res.json({ message: 'Cart cleared successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to clear cart' });
		}
	});

	// Merge local cart with server cart
	router.post('/merge', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const { items } = req.body;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			let cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) cart = await prisma.order.create({ data: { userId, status: 'CART', totalAmount: 0 } });
			for (const item of items) {
				const existingItem = await prisma.orderItem.findFirst({ where: { orderId: cart.id, productId: item.id } });
				if (existingItem) {
					await prisma.orderItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + item.quantity } });
				} else {
					await prisma.orderItem.create({ data: { orderId: cart.id, productId: item.id, quantity: item.quantity, price: item.price } });
				}
			}
			const cartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount } });
			res.json({ message: 'Cart merged successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Failed to merge cart' });
		}
	});

	// Get user cart
	router.get('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({
				where: { userId, status: 'CART' },
				include: {
					items: {
						include: {
							product: {
								include: {
									categories: { include: { category: true } }
								}
							}
						}
					}
				}
			});
			if (!cart) return res.json({ items: [], totalAmount: 0 });
			const formattedCart = {
				id: cart.id,
				items: cart.items.map((item: any) => ({
					id: item.product.id,
					name: item.product.name,
					price: item.price,
					quantity: item.quantity,
					image: item.product.imageUrls?.[0] || '/placeholder.svg',
					category: item.product.categories?.[0]?.category?.name || 'Unknown',
					inStock: item.product.stockQuantity > 0
				})),
				totalAmount: cart.totalAmount
			};
			res.json(formattedCart);
		} catch (error) {
            console.error(error);
			res.status(500).json({ error: 'Failed to fetch cart' });
		}
	});

	// Update cart item quantity
	router.put('/item/:productId', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const productId = req.params.productId;
			const { quantity } = req.body;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			if (quantity < 0) return res.status(400).json({ message: 'Quantity must be positive' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) return res.status(404).json({ message: 'Cart not found' });
			if (quantity === 0) {
				await prisma.orderItem.deleteMany({ where: { orderId: cart.id, productId } });
			} else {
				const product = await prisma.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } });
				if (!product) return res.status(404).json({ message: 'Product not found' });
				if (quantity > product.stockQuantity) return res.status(400).json({ message: 'Not enough stock available' });
				await prisma.orderItem.updateMany({ where: { orderId: cart.id, productId }, data: { quantity } });
			}
			const updatedCartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const newTotalAmount = updatedCartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: newTotalAmount } });
			res.json({ message: 'Cart updated successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to update cart' });
		}
	});

	// Remove item from cart
	router.delete('/item/:productId', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const productId = req.params.productId;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (!cart) return res.status(404).json({ message: 'Cart not found' });
			await prisma.orderItem.deleteMany({ where: { orderId: cart.id, productId } });
			const updatedCartItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
			const newTotalAmount = updatedCartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
			await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: newTotalAmount } });
			res.json({ message: 'Item removed from cart successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to remove item from cart' });
		}
	});

	// Clear cart
	router.delete('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const cart = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
			if (cart) {
				await prisma.orderItem.deleteMany({ where: { orderId: cart.id } });
				await prisma.order.delete({ where: { id: cart.id } });
			}
			res.json({ message: 'Cart cleared successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to clear cart' });
		}
	});

	return router;
}
