const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin', 10);
  const user = await prisma.user.create({
    data: {
      nim: '00000000',
      name: 'Admin',
      email: 'admin@admin.com',
      passwordHash: hash,
      role: 'admin'
    }
  });
  console.log('Admin dibuat:', user.email);
  await prisma.$disconnect();
}

main();