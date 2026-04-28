import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';

export default function createUserRoutes(prisma: any, authenticateToken: any) {
	const router = Router();

	// @route GET /user
	router.get('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, name: true, email: true, phone: true, role: true },
			});
			if (!user) return res.status(404).json({ message: 'User not found' });
			res.json(user);
		} catch (error) {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

	// @route PUT /user
	router.put('/', authenticateToken, async (req: any, res: Response) => {
		try {
			const { name, email, phone } = req.body;
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { name, email, phone },
				select: { id: true, name: true, email: true, phone: true, role: true },
			});
			res.json(updatedUser);
		} catch (error) {
			res.status(500).json({ error: 'Failed to update profile' });
		}
	});

	// @route PUT /user/password
	router.put('/password', authenticateToken, async (req: any, res: Response) => {
		try {
			const { currentPassword, newPassword } = req.body;
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
			const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, password: true } });
			if (!user) return res.status(404).json({ message: 'User not found' });
			const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
			if (!isPasswordValid) return res.status(400).json({ message: 'Current password is incorrect' });
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
			res.json({ message: 'Password updated successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Failed to update password' });
		}
	});

	return router;
}
