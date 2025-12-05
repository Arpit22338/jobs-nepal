/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();
    console.log(JSON.stringify({ courseCount, enrollmentCount }));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
