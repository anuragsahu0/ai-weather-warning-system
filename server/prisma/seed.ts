/**
 * ERROR 404 — Prisma Seed Script
 * AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
 * Note: Strict No-Fake-Data policy observed.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing ERROR 404 Database Foundation (Phase 1)...');

  // Baseline system administrator definition (scaffold)
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@error404.weather' },
    update: {},
    create: {
      email: 'admin@error404.weather',
      name: 'ERROR 404 Lead Meteorologist',
      role: 'ADMIN',
      organization: 'ERROR 404 Nowcast Emergency Operations',
    },
  });

  console.log('System seed completed successfully. User ID:', systemAdmin.id);
  console.log('No fake weather observations, predictions, or alerts seeded in Phase 1.');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
