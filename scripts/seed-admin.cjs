const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const email = process.argv[2];
const password = process.argv[3];

async function main() {
  if (!email || !password || password.length < 8) {
    console.error("사용법: npm run seed:admin -- <email> <password(8자+)>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash, contactName: "운영자", role: "ADMIN" },
  });
  console.log(`운영자 준비 완료: ${email}`);
}

main().finally(() => prisma.$disconnect());
