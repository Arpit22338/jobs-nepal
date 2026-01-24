const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.course.count().then(c => console.log('Count:', c))
