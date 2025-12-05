import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('Arpit@2065', 12)
  
  await prisma.user.upsert({
    where: { email: 'rojgaarnepall@gmail.com' },
    update: {},
    create: {
      email: 'rojgaarnepall@gmail.com',
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
