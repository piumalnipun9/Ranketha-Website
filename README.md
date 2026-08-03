"# Ranketha Website

Ranketha is a full-stack e-commerce website with a Next.js frontend and an Express/Prisma backend. It includes product browsing, cart and checkout flows, an admin area, and email-based order notifications.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Express.js, TypeScript
- Database: Prisma + PostgreSQL
- Auth: JWT-based authentication
- Mail: Nodemailer

## Project Structure

- client/: Next.js frontend application
- server/: Express API and Prisma setup
- server/prisma/: Prisma schema, migrations, and seed script
- .env: shared environment file used by both client and server

## Getting Started

1. Install dependencies
   ```bash
   npm install
   npm install --prefix client
   ```

2. Configure environment variables
   - Create or update the root .env file with your local values.
   - Make sure DATABASE_URL and JWT_SECRET are set before running the app.

3. Generate the Prisma client
   ```bash
   npm run prisma:generate
   ```

4. Start the development servers
   ```bash
   npm run dev
   ```

This starts both the backend and the frontend concurrently.

## Useful Commands

```bash
npm run dev
npm run build
npm run build:server
npm run dev:server
npm run dev:client
npx tsx server/prisma/seed.ts
```

## Deployment Notes

- The app uses a shared root .env file for runtime configuration.
- In production, set the same variables in your hosting platform config vars.
- Prisma migrations and local seed data should be kept out of version control if they are local-only.
" 
