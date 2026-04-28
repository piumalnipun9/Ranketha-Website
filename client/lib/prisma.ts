
import { PrismaClient } from '@prisma/client';

declare global {
  let prisma: PrismaClient | undefined;
}

// This ensures Prisma Client can be safely used in development environments
// and handles initialization in production builds
function getPrismaClient() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return new PrismaClient();
    } else {
      if (!global.prisma) {
        global.prisma = new PrismaClient();
      }
      return global.prisma;
    }
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    // Return a mock client for build-time to avoid breaking the build
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
      return createMockPrismaClient();
    }
    throw error;
  }
}

// Create a mock Prisma client for build time
function createMockPrismaClient() {
  const handler = {
    get: (target: any, prop: string) => {
      if (prop === 'then') {
        return undefined; // Not a promise
      }
      return new Proxy(() => {}, {
        get: () => handler.get,
        apply: () => new Proxy({}, handler)
      });
    }
  };
  
  return new Proxy({}, handler);
}

const prisma = getPrismaClient();

export default prisma;
