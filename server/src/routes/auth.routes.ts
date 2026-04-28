import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendMail } from '../lib/mailer.js';

export default function createAuthRoutes(prisma: any, JWT_SECRET: string) {
	const router = Router();

	// Authentication Middleware (for protected test route)
	type AuthenticatedRequest = Request;
	const authenticateToken = (req: AuthenticatedRequest, res: Response, next: any) => {
		const authHeader = (req.headers as any)['authorization'] as string | undefined;
		const token = authHeader && authHeader.split(' ')[1];
		if (token == null) return res.status(401).json({ message: 'Authentication token required' });
		if (!JWT_SECRET) return res.status(500).json({ message: 'Internal server error' });
		jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
			if (err) return res.status(403).json({ message: 'Invalid or expired token' });
			req.user = user as { id: string; role: string };
			next();
		});
	};

	// @route POST /auth/login
	router.post('/login', async (req: Request, res: Response) => {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
		try {
			const user = await prisma.user.findUnique({
				where: { email },
				select: { id: true, email: true, name: true, password: true, role: true, emailVerified: true },
			});
			if (!user) return res.status(401).json({ message: 'Invalid credentials' });
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });
			if (!user.emailVerified) {
				return res.status(403).json({ message: 'Email not verified. Please check your inbox for the OTP.' });
			}
			if (!JWT_SECRET) return res.status(500).json({ message: 'Internal server error' });
			const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
			res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
		} catch (error) {
			res.status(500).json({ message: 'Internal server error' });
		}
	});

	// @route POST /auth/register
	router.post('/register', async (req: Request, res: Response) => {
		const { name, email, password, phone } = req.body;
		if (!name || !email || !password || !phone) return res.status(400).json({ message: 'Name, email, phone and password are required' });
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}:;"'`~<>,.?/]{8,}$/;
		if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include a letter and a number' });
		try {
			const existing = await prisma.user.findUnique({ where: { email } });
			if (existing) return res.status(409).json({ message: 'Email already registered' });
			const hashed = await bcrypt.hash(password, 10);
			// Generate a 6-digit OTP and expiry (15 minutes)
			const code = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = new Date(Date.now() + 15 * 60 * 1000);

			const user = await prisma.user.create({
				data: { name, email, password: hashed, phone, emailVerified: false, emailVerificationCode: code, emailVerificationExpires: expires },
				select: { id: true, email: true, name: true, role: true }
			});

			// Send email with OTP (fire-and-forget)
			(async () => {
				try {
					const subject = 'Verify your RoboClub account';
					const html = `
							<p>Hi ${name || 'there'},</p>
							<p>Use the following One-Time Password (OTP) to verify your email address. It expires in 15 minutes.</p>
							<h2 style="letter-spacing:2px;">${code}</h2>
							<p>If you didn't sign up, please ignore this email.</p>
						`;
					await sendMail({ to: email, subject, html, text: `Your OTP is ${code}` });
				} catch (e) {
					console.warn('Failed to send verification email:', e);
				}
			})();

			return res.status(201).json({ message: 'Registered. Please verify the OTP sent to your email.' });
		} catch (error) {
			return res.status(500).json({ message: 'Failed to register user' });
		}
	});

	// @route POST /auth/verify-email
	// body: { email, code }
	router.post('/verify-email', async (req: Request, res: Response) => {
		const { email, code } = req.body as { email?: string; code?: string };
		if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
		try {
			const user = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerificationCode: true, emailVerificationExpires: true, emailVerified: true } });
			if (!user) return res.status(404).json({ message: 'User not found' });
			if (user.emailVerified) return res.status(200).json({ message: 'Email already verified' });
			if (!user.emailVerificationCode || !user.emailVerificationExpires) return res.status(400).json({ message: 'No active verification code. Please request a new one.' });
			if (new Date(user.emailVerificationExpires).getTime() < Date.now()) return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
			if (user.emailVerificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });

			await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerificationCode: null, emailVerificationExpires: null } });
			return res.json({ message: 'Email verified successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Failed to verify email' });
		}
	});

	// @route POST /auth/resend-otp
	router.post('/resend-otp', async (req: Request, res: Response) => {
		const { email } = req.body as { email?: string };
		if (!email) return res.status(400).json({ message: 'Email is required' });
		try {
			const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, emailVerified: true } });
			if (!user) return res.status(404).json({ message: 'User not found' });
			if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

			const code = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = new Date(Date.now() + 15 * 60 * 1000);
			await prisma.user.update({ where: { id: user.id }, data: { emailVerificationCode: code, emailVerificationExpires: expires } });

			// Send email
			try {
				const subject = 'Your new RoboClub verification code';
				const html = `
						<p>Hi ${user.name || 'there'},</p>
						<p>Your new OTP is below. It expires in 15 minutes.</p>
						<h2 style="letter-spacing:2px;">${code}</h2>
					`;
				await sendMail({ to: email, subject, html, text: `Your OTP is ${code}` });
			} catch (e) {
				console.warn('Failed to send OTP email:', e);
			}

			return res.json({ message: 'OTP resent successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Failed to resend OTP' });
		}
	});

	// Example of a protected route
	router.get('/protected', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
		if (!req.user) return res.status(500).json({ message: 'User not found in request' });
		res.json({ message: 'You accessed a protected route!', user: req.user });
	});

	return router;
}
