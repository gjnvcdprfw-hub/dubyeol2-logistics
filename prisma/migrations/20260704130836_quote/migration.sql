-- AlterTable
ALTER TABLE "Order" ADD COLUMN "quoteCnShippingFen" INTEGER;
ALTER TABLE "Order" ADD COLUMN "quoteExchangeRateX100" INTEGER;
ALTER TABLE "Order" ADD COLUMN "quoteShippingMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN "quoteUnitPriceFen" INTEGER;
ALTER TABLE "Order" ADD COLUMN "quoteVolumeCm3" INTEGER;
ALTER TABLE "Order" ADD COLUMN "quoteWeightGrams" INTEGER;
ALTER TABLE "Order" ADD COLUMN "quotedAt" DATETIME;
