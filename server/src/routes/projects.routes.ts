import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { sendMail } from '../lib/mailer.js';

export default function createProjectsRoutes(prisma: PrismaClient) {
  const router = express.Router();

  // GET /projects - list all projects (ordered)
  router.get('/', async (_req, res) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });
      res.json(projects);
    } catch (err: any) {
      console.error('Failed to list projects', err);
      // If table doesn't exist (migration pending), return empty list gracefully
      if (err?.code === 'P2021' || /does not exist/i.test(String(err?.message))) {
        return res.json([]);
      }
      res.status(500).json({ message: 'Failed to list projects' });
    }
  });

  // GET /projects/:id - get one project by id
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      res.json(project);
    } catch (err: any) {
      console.error('Failed to fetch project', err);
      if (err?.code === 'P2021' || /does not exist/i.test(String(err?.message))) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  // POST /projects/submit - receive a public project submission and email admins
  router.post('/submit', async (req, res) => {
    try {
      const {
        title,
        description,
        tags,
        imageUrl,
        name,
        email,
        whatsapp,
      } = req.body || {};

      if (!title || !description || !name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const adminTo = process.env.PROJECTS_EMAIL || process.env.ADMIN_EMAIL || 'roboclub.main@gmail.com';
      const subject = `Project Submission: ${title}`;
      const text = `Title: ${title}\nBy: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp || '-'}\nTags: ${tags || '-'}\nImage: ${imageUrl || '-'}\n\nDescription:\n${description}`;
      const html = `
        <h2>New Project Submission</h2>
        <p><strong>Title:</strong> ${String(title)}</p>
        <p><strong>By:</strong> ${String(name)}</p>
        <p><strong>Email:</strong> ${String(email)}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp ? String(whatsapp) : '-'}</p>
        <p><strong>Tags:</strong> ${tags ? String(tags) : '-'}</p>
        <p><strong>Image:</strong> ${imageUrl ? `<a href="${String(imageUrl)}">${String(imageUrl)}</a>` : '-'}</p>
        <hr />
        <p><strong>Description:</strong></p>
        <p>${String(description).replace(/\n/g, '<br/>')}</p>
      `;

      await sendMail({ to: adminTo, subject, text, html, replyTo: String(email) });
      return res.json({ ok: true });
    } catch (err) {
      console.error('Failed to submit project', err);
      return res.status(500).json({ message: 'Failed to submit project' });
    }
  });

  return router;
}
