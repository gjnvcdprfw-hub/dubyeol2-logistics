import { prisma } from "../src/lib/db";
import { recordWalletCredit } from "../src/lib/wallet";

const email = process.argv[2];
const amount = Number(process.argv[3]);

async function main() {
  if (!email || !Number.isInteger(amount) || amount <= 0) {
    console.error("사용법: npx tsx scripts/seed-wallet.ts <seller-email> <amountKrw>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`셀러를 찾을 수 없습니다: ${email}`);
    process.exit(1);
  }

  await recordWalletCredit(user.id, amount, "로컬 QA 예치금");
  console.log(`예치금 준비 완료: ${email} +₩${amount.toLocaleString("ko-KR")}`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
