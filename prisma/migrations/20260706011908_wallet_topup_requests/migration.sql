-- CreateTable
CREATE TABLE "WalletTopUpRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "amountKrw" INTEGER NOT NULL,
    "depositorName" TEXT NOT NULL,
    "memo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminMemo" TEXT,
    "processedById" TEXT,
    "walletTransactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "WalletTopUpRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WalletTopUpRequest_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WalletTopUpRequest_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTopUpRequest_walletTransactionId_key" ON "WalletTopUpRequest"("walletTransactionId");

-- CreateIndex
CREATE INDEX "WalletTopUpRequest_sellerId_idx" ON "WalletTopUpRequest"("sellerId");

-- CreateIndex
CREATE INDEX "WalletTopUpRequest_status_idx" ON "WalletTopUpRequest"("status");

-- CreateIndex
CREATE INDEX "WalletTopUpRequest_processedById_idx" ON "WalletTopUpRequest"("processedById");
