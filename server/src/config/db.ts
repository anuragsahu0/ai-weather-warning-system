import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export async function checkDatabaseConnection(): Promise<{ isConnected: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    // Attempt a lightweight ping query
    await prisma.$queryRaw`SELECT 1`;
    return {
      isConnected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      isConnected: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Database connection unavailable',
    };
  }
}
