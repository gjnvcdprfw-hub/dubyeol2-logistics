-- AlterTable
ALTER TABLE "Order" ADD COLUMN "inspAppearanceOk" BOOLEAN;
ALTER TABLE "Order" ADD COLUMN "inspCountActual" INTEGER;
ALTER TABLE "Order" ADD COLUMN "inspDefectCount" INTEGER;
ALTER TABLE "Order" ADD COLUMN "inspNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "outerIssue" BOOLEAN;
ALTER TABLE "Order" ADD COLUMN "outerNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "receivedAt" DATETIME;

-- CreateTable
CREATE TABLE "InboundPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InboundPhoto_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("companyName", "contactName", "createdAt", "email", "id", "passwordHash", "phone") SELECT "companyName", "contactName", "createdAt", "email", "id", "passwordHash", "phone" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_inboundCode_key" ON "User"("inboundCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
