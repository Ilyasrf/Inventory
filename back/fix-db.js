const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Demote all users to MEMBER except the hardcoded admin
  await prisma.user.updateMany({
    where: { login: { not: 'admin' } },
    data: { role: 'MEMBER' },
  });
  console.log('Demoted all 42 users to MEMBER.');

  // 2. Update the admin user's email if it exists
  const smtpUser = process.env.SMTP_USER || 'admin@makina-masters.local';
  const admin = await prisma.user.findFirst({ where: { login: 'admin' } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { email: smtpUser },
    });
    console.log(`Updated admin email to ${smtpUser}`);
  } else {
    console.log('Admin user not found yet. It will be created correctly on first login.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
