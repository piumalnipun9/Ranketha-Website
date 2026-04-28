import { Router, Request, Response } from 'express';
import { sendMail } from '../lib/mailer.js';
//import { sendWhatsApp } from '../lib/whatsapp';

export default function createCheckoutRoutes(prisma: any, authenticateToken: any) {
	const router = Router();

	// Checkout - Create order from cart
	router.post('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			const { shippingAddressId, shippingMethod, notes } = req.body;
			console.log('Checkout request with shipping method:', shippingMethod);
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

			// Only require shipping address for non-pickup methods
			if (shippingMethod !== 'pickup' && !shippingAddressId) {
				return res.status(400).json({ message: 'Shipping address is required for delivery' });
			}

			const cart = await prisma.order.findFirst({
				where: { userId, status: 'CART' },
				include: { items: { include: { product: true } } }
			});
			if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

			// Only validate address for non-pickup methods
			let address = null;
			if (shippingMethod !== 'pickup') {
				address = await prisma.address.findFirst({ where: { id: shippingAddressId, userId } });
				if (!address) return res.status(404).json({ message: 'Invalid shipping address' });
			}

			// Pre-validate against obviously insufficient stock (best-effort; final guard is inside tx)
			for (const item of cart.items) {
				if (item.quantity > item.product.stockQuantity) {
					return res.status(400).json({ message: `Not enough stock for ${item.product.name}. Available: ${item.product.stockQuantity}, Requested: ${item.quantity}` });
				}
			}

			// Perform order status update and stock decrements atomically
			const { order, updatedStocks } = await prisma.$transaction(async (tx: any) => {
				// Recalculate total from items to be safe
				const recalculatedTotal = cart.items.reduce((sum: number, it: any) => sum + (it.quantity * it.price), 0);

				const updatedOrder = await tx.order.update({
					where: { id: cart.id },
					data: {
						status: 'ORDERED',
						shippingAddressId: shippingMethod === 'pickup' ? null : shippingAddressId,
						totalAmount: recalculatedTotal,
						// Temporarily store shipping method in trackingNumber
						trackingNumber: shippingMethod ? `SHIPPING_METHOD:${shippingMethod}` : null,
						notes: notes ? String(notes).trim() : null
					}
				});

				// BULK VALIDATE AND DECREMENT STOCKS IN ONE GO TO AVOID MANY QUERIES
				const items = cart.items.map((it: any) => ({ id: it.productId, qty: Number(it.quantity), name: it.product?.name || it.productId }));
				if (items.length === 0) {
					return { order: updatedOrder, updatedStocks: [] };
				}

				// Build VALUES list for (productId, qty)
				// Use parameterization for quantities and escape ids defensively
				const valuesTuples = items
					.map((it: any, idx: number) => `($${idx * 2 + 1}::text, $${idx * 2 + 2}::int)`)
					.join(',');
				const valuesParams: any[] = [];
				for (const it of items) {
					valuesParams.push(String(it.id));
					valuesParams.push(Number(it.qty));
				}

				// 1) Validate all rows have sufficient stock
				const insufficient = await tx.$queryRawUnsafe(
					`SELECT p.id, p."name" as name, p."stockQuantity" as stock, v.qty
					 FROM "Product" p
					 JOIN (VALUES ${valuesTuples}) AS v(id, qty) ON p.id = v.id
					 WHERE p."stockQuantity" < v.qty`,
					...valuesParams
				);
				if (insufficient && insufficient.length > 0) {
					const first = insufficient[0];
					throw new Error(`Not enough stock for ${first.name || first.id}. Available: ${first.stock}, Requested: ${first.qty}`);
				}

				// 2) Perform a single guarded UPDATE for all items
				const updatedCount = await tx.$executeRawUnsafe(
					`UPDATE "Product" AS p
					 SET "stockQuantity" = p."stockQuantity" - v.qty
					 FROM (VALUES ${valuesTuples}) AS v(id, qty)
					 WHERE p.id = v.id AND p."stockQuantity" >= v.qty`,
					...valuesParams
				);
				if (Number(updatedCount) !== items.length) {
					// As a safety net, if not all rows updated, rollback
					throw new Error('One or more items could not be updated due to stock changes.');
				}

				// 3) Fetch updated stocks to return/inspect
				const stocks = await tx.product.findMany({
					where: { id: { in: items.map((i: any) => i.id) } },
					select: { id: true, stockQuantity: true }
				});

				return { order: updatedOrder, updatedStocks: stocks };
			});

			console.log('Order saved. Tracking number:', shippingMethod ? `SHIPPING_METHOD:${shippingMethod}` : null);

			// Send emails (fire-and-forget)
			(async () => {
				try {
					// Fetch user for email
					const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
					const orderItems = cart.items.map((it: any) => `• ${it.product.name} x ${it.quantity} — LKR ${(it.price * it.quantity).toFixed(2)}`).join('<br/>');

					// Extract shipping method from tracking number
					const shippingMethodMatch = order.trackingNumber?.match(/^SHIPPING_METHOD:(.+)$/);
					let actualShippingMethod = shippingMethodMatch ? shippingMethodMatch[1] : 'standard';
					console.log('Order tracking number:', order.trackingNumber);
					console.log('Extracted shipping method:', actualShippingMethod);

					// Ensure we have a valid shipping method
					if (!['standard', 'pickup', 'pickmeflash'].includes(actualShippingMethod)) {
						console.log('Invalid shipping method, defaulting to standard:', actualShippingMethod);
						actualShippingMethod = 'standard';
					}

					// Calculate shipping based on method and subtotal
					const subtotal = order.totalAmount?.toFixed(2) ?? '0.00';
					let shippingCost = 0;
					if (actualShippingMethod === 'standard') {
						shippingCost = parseFloat(subtotal) >= 10000 ? 0 : 500;
					}
					// No shipping cost for pickup or pickmeflash (paid by customer separately)

					const finalTotal = (parseFloat(subtotal) + shippingCost).toFixed(2);
					const subject = `Order Confirmation #${order.id.substring(0, 8)}`;

					// Add shipping method info
					let shippingInfo = '';
					if (actualShippingMethod === 'pickup') {
						shippingInfo = `<p><strong>Shipping Method:</strong> Store Pickup (Free)</p>
			      <p><strong>Opening Hours:</strong> Monday-Saturday, 9:00 AM - 6:00 PM</p>`;
					} else if (actualShippingMethod === 'pickmeflash') {
						shippingInfo = `<p><strong>Shipping Method:</strong> Pick Me Flash (Paid by customer on delivery)</p>`;
					} else {
						shippingInfo = `<p><strong>Shipping Method:</strong> Standard Delivery ${shippingCost > 0 ? `(LKR ${shippingCost.toFixed(2)})` : '(Free)'}</p>`;
					}
					console.log('Shipping method in email:', actualShippingMethod);

					const html = `
			      <p>Hi ${user?.name || 'Customer'},</p>
			      <p>Thank you for your order.</p>
                  <p><strong>Important:</strong> You need to pay the total amount before we can ship your order.</p>
                  <p>Bank Details:</p>
                  <p>Account Name: Imansha Manuka</p>
                  <p>Account Number: 019020341693</p>
                  <p>Bank: Hatton National Bank</p>
                  <p>Branch: Kurunegala</p>
                  <p>Remark: Payment for Order #${order.id.substring(0, 8)}</p>
                  <p><strong>After payment, please send the payment slip to:</strong></p>
                  <p>- Email: roboclub.main@gmail.com</p>
                  <p>- WhatsApp: 0729557537</p>
			      <p>Here are your order details:</p>
			      <p><strong>Order ID:</strong> ${order.id}</p>
			      ${shippingInfo}
			      <p><strong>Items:</strong><br/>${orderItems}</p>
			      <p><strong>Subtotal:</strong> LKR ${subtotal}</p>
			      ${shippingCost > 0 ? `<p><strong>Shipping:</strong> LKR ${shippingCost.toFixed(2)}</p>` : ''}
			      <p><strong>Total Amount Due:</strong> LKR ${finalTotal}</p>
			      <p>We will notify you once your order ships.</p>
			    `;
					if (user?.email) {
						console.log('Sending email to:', user.email);
						await sendMail({ to: user.email, subject, html, text: `Order ${order.id} total LKR ${finalTotal}` });
					}
					const adminEmail = process.env.ADMIN_EMAIL;
					if (adminEmail) {
						await sendMail({ to: adminEmail, subject: `New Order #${order.id.substring(0, 8)}`, html, text: `New order ${order.id}` });
					}

				} catch (e) {
					console.warn('Email send failed:', e);
				}
			})();

			res.json({ message: 'Order placed successfully!', orderId: order.id, totalAmount: order.totalAmount, updatedStocks });
		} catch (error: any) {
			console.error('Checkout error:', error);
			const msg = typeof error?.message === 'string' ? error.message : 'Failed to process checkout';
			if (msg.toLowerCase().includes('not enough stock')) {
				return res.status(400).json({ message: msg });
			}
			res.status(500).json({ error: 'Failed to process checkout' });
		}
	});

	return router;
}
