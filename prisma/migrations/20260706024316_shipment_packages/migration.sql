-- CreateTable
CREATE TABLE "ShipmentPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "marker" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PACKING',
    "weightGrams" INTEGER NOT NULL,
    "volumeCm3" INTEGER NOT NULL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShipmentPackage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShipmentPackageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packageId" TEXT NOT NULL,
    "skuLineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentPackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ShipmentPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShipmentPackageItem_skuLineId_fkey" FOREIGN KEY ("skuLineId") REFERENCES "OrderSkuLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ShipmentPackage_orderId_idx" ON "ShipmentPackage"("orderId");

-- CreateIndex
CREATE INDEX "ShipmentPackage_status_idx" ON "ShipmentPackage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentPackage_orderId_marker_key" ON "ShipmentPackage"("orderId", "marker");

-- CreateIndex
CREATE INDEX "ShipmentPackageItem_skuLineId_idx" ON "ShipmentPackageItem"("skuLineId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentPackageItem_packageId_skuLineId_key" ON "ShipmentPackageItem"("packageId", "skuLineId");
