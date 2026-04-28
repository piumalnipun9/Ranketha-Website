import { PrismaClient } from '@prisma/client';
import express from 'express';
import { sendMail } from '../lib/mailer.js';

export default function createNewsletterRoutes(prisma: PrismaClient) {
  const router = express.Router();

  router.post('/subscribe', async (req, res) => {
    try {
      const { email, source = 'site', hp = '' } = req.body || {};
      if (!email || !/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }
      if (hp) {
        return res.json({ ok: true });
      }

      // Upsert to avoid duplicates (using any to avoid TS mismatch if client isn't regenerated in IDE)
      const clientAny: any = prisma as any;
      try {
        const sub = await clientAny.newsletterSubscription.upsert({
          where: { email: email.toLowerCase() },
          update: { source },
          create: { email: email.toLowerCase(), source },
        });
        return res.json({ ok: true, id: sub.id });
      } catch (dbErr: any) {
        console.warn('DB write failed for newsletter subscribe:', dbErr?.code || dbErr?.message || dbErr);
        // Fallback: optionally email the admin to capture the lead without DB persistence
        const notify = process.env.NEWSLETTER_NOTIFY_EMAIL;
        if (notify) {
          try {
            await sendMail({
              to: notify,
              subject: 'New newsletter subscriber',
              text: `Email: ${email}\nSource: ${source}\nTime: ${new Date().toISOString()}`,
            });
          } catch (mailErr) {
            console.warn('Newsletter notification email failed:', mailErr);
          }
        }
        // Do not fail user flow even if DB/mail fails
        return res.json({ ok: true });
      }
    } catch (err) {
      console.error('Subscribe error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/', async (_req, res) => {
    try {
      const clientAny: any = prisma as any;
      try {
        const list = await clientAny.newsletterSubscription.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        return res.json(list);
      } catch (err) {
        // If table doesn't exist or permissions missing, return empty list gracefully
        return res.json([]);
      }
    } catch (err) {
      console.error('List subs error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
