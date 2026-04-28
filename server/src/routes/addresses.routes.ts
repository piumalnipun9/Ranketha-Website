import { Router, Request, Response } from 'express';

export default function createAddressesRoutes(prisma: any, authenticateToken: any) {
	const router = Router();

	// @route GET /addresses
	router.get('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
			res.json(addresses);
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch addresses' });
		}
	});

	// @route POST /addresses
	router.post('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const { fullName, addressLine1, addressLine2, city, district, zipCode, phoneNumber, isDefault } = req.body;
			if (!fullName || !addressLine1 || !city || !district || !zipCode) return res.status(400).json({ message: 'Missing required fields' });
			if (isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
			const newAddress = await prisma.address.create({
				data: { userId, fullName, addressLine1, addressLine2: addressLine2 || null, city, district, zipCode, phoneNumber: phoneNumber || null, isDefault: isDefault || false }
			});
			res.json(newAddress);
		} catch (error) {
			res.status(500).json({ error: 'Failed to create address' });
		}
	});

	// @route PUT /addresses/:id
	router.put('/:id', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const addressId = req.params.id;
			const { fullName, addressLine1, addressLine2, city, district, zipCode, phoneNumber } = req.body;
			if (!fullName || !addressLine1 || !city || !district || !zipCode) return res.status(400).json({ message: 'Missing required fields' });
			const existingAddress = await prisma.address.findFirst({ where: { id: addressId, userId } });
			if (!existingAddress) return res.status(404).json({ message: 'Address not found or does not belong to user' });
			const updatedAddress = await prisma.address.update({
				where: { id: addressId },
				data: { fullName, addressLine1, addressLine2: addressLine2 || null, city, district, zipCode, phoneNumber: phoneNumber || null }
			});
			res.json(updatedAddress);
		} catch (error) {
			res.status(500).json({ error: 'Failed to update address' });
		}
	});

	// @route DELETE /addresses/:id
	router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const addressId = req.params.id;
			const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
			if (!address) return res.status(404).json({ message: 'Address not found or does not belong to user' });
			if (address.isDefault) return res.status(400).json({ message: 'Cannot delete default address' });
			await prisma.address.delete({ where: { id: addressId } });
			res.json({ message: 'Address deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to delete address' });
		}
	});

	// @route PUT /addresses/:id/default
	router.put('/:id/default', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const addressId = req.params.id;
			const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
			if (!address) return res.status(404).json({ message: 'Address not found or does not belong to user' });
			await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
			await prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
			res.json({ message: 'Default address updated successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to set default address' });
		}
	});

	return router;
}
