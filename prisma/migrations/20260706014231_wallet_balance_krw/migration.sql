-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SELLER',
    "inboundCode" TEXT,
    "walletBalanceKrw" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" (
    "companyName",
    "contactName",
    "createdAt",
    "email",
    "id",
    "inboundCode",
    "passwordHash",
    "phone",
    "role",
    "walletBalanceKrw"
)
SELECT
    "User"."companyName",
    "User"."contactName",
    "User"."createdAt",
    "User"."email",
    "User"."id",
    "User"."inboundCode",
    "User"."passwordHash",
    "User"."phone",
    "User"."role",
    COALESCE((
        SELECT SUM("WalletTransaction"."amountKrw")
        FROM "WalletTransaction"
        WHERE "WalletTransaction"."sellerId" = "User"."id"
    ), 0)
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_inboundCode_key" ON "User"("inboundCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
