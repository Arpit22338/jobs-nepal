import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password', 12)

  await prisma.user.upsert({
    where: { email: 'arpitkafle@gmail.com' },
    update: {},
    create: {
      email: 'arpitkafle@gmail.com',
      name: 'Arpit Kafle',
      password,
      role: 'ADMIN',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
