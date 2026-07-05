-- CreateTable
CREATE TABLE "OrderProductLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderProductLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderSkuLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productLineId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "inboundQuantity" INTEGER,
    "missingQuantity" INTEGER,
    "defectCount" INTEGER,
    "inspectionPassed" BOOLEAN,
    "inspectionNote" TEXT,
    "quoteUnitPriceFen" INTEGER,
    "quoteCnShippingFen" INTEGER,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderSkuLine_productLineId_fkey" FOREIGN KEY ("productLineId") REFERENCES "OrderProductLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OrderProductLine_orderId_idx" ON "OrderProductLine"("orderId");

-- CreateIndex
CREATE INDEX "OrderSkuLine_productLineId_idx" ON "OrderSkuLine"("productLineId");
