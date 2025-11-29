import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('Arpit@2065', 12)
  const user = await prisma.user.upsert({
    where: { email: 'arpitkaflee@gmail.com' },
    update: {
      role: 'ADMIN', // Ensure role is ADMIN even if user exists
      password: password // Update password to ensure it matches
    },
    create: {
      email: 'arpitkaflee@gmail.com',
      name: 'Arpit Kafle',
      password,
      role: 'ADMIN',
    },
  })
  console.log({ user })
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
