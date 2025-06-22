const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(() => {
  execSync('npx prisma db push --force-reset', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
});

afterEach(async () => {
  await prisma.lessonPlan.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
}); 