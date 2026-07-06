const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsertUser({ email, password, role, contactName, companyName }) {
  if (!email || !password) return false;
  if (password.length < 8) {
    throw new Error(`${role} demo password must be at least 8 characters`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, contactName, companyName },
    create: { email, passwordHash, role, contactName, companyName },
  });
  return true;
}

async function main() {
  const adminCreated = await upsertUser({
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
    role: "ADMIN",
    contactName: "시연 운영자",
  });

  const sellerCreated = await upsertUser({
    email: process.env.DEMO_SELLER_EMAIL,
    password: process.env.DEMO_SELLER_PASSWORD,
    role: "SELLER",
    contactName: "시연 고객",
    companyName: "시연 고객사",
  });

  if (adminCreated || sellerCreated) {
    console.log("시연 계정 준비 완료");
  } else {
    console.log("시연 계정 환경변수 없음: seed 건너뜀");
  }
}

main().finally(() => prisma.$disconnect());
