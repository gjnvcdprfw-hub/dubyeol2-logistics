import { ValidationError } from "./auth";
import { prisma } from "./db";
import { orderWithLinesAndPackagesInclude, orderWithLinesInclude } from "./order-lines";

export type ShipmentPackageInput = {
  marker: string;
  status?: string;
  weightKg: number;
  volumeCbm: number;
  memo?: string | null;
  items: Array<{ skuLineId: string; quantity: number }>;
};

export const SHIPMENT_PACKAGE_STATUSES = ["PACKING", "PACKED", "READY"] as const;

export function getShipmentPackageStatusLabel(status: string) {
  switch (status) {
    case "PACKING":
      return "포장중";
    case "PACKED":
      return "포장완료";
    case "READY":
      return "출고대기";
    default:
      return status;
  }
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveMeasurement(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${label} 값이 올바르지 않습니다`);
  }
  return value;
}

function shippableQuantity(sku: { quantity: number; inboundQuantity: number | null; defectCount: number | null }) {
  return Math.max(0, (sku.inboundQuantity ?? sku.quantity) - (sku.defectCount ?? 0));
}

function normalizeInput(input: ShipmentPackageInput) {
  const marker = cleanText(input.marker).toUpperCase();
  if (!/^BOX-[A-Z0-9-]+$/.test(marker)) {
    throw new ValidationError("포장단위 마커는 BOX-1 형식으로 입력해 주세요");
  }

  const status = cleanText(input.status || "PACKING").toUpperCase();
  if (!SHIPMENT_PACKAGE_STATUSES.includes(status as (typeof SHIPMENT_PACKAGE_STATUSES)[number])) {
    throw new ValidationError("포장 상태가 올바르지 않습니다");
  }

  const weightGrams = Math.round(toPositiveMeasurement(Number(input.weightKg), "무게") * 1000);
  const volumeCm3 = Math.round(toPositiveMeasurement(Number(input.volumeCbm), "CBM") * 1_000_000);

  if (!Array.isArray(input.items) || input.items.length < 1) {
    throw new ValidationError("박스에 담을 SKU를 1개 이상 입력해 주세요");
  }

  const items = input.items.map((item) => {
    const quantity = Number(item.quantity);
    if (!item.skuLineId || !Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError("박스 SKU 수량이 올바르지 않습니다");
    }

    return {
      skuLineId: item.skuLineId,
      quantity,
    };
  });

  const ids = items.map((item) => item.skuLineId);
  if (new Set(ids).size !== ids.length) {
    throw new ValidationError("같은 SKU가 한 박스에 중복되었습니다");
  }

  return {
    marker,
    status,
    weightGrams,
    volumeCm3,
    memo: cleanText(input.memo ?? "") || null,
    items,
  };
}

export async function saveShipmentPackage(orderId: string, input: ShipmentPackageInput) {
  if (!orderId) throw new ValidationError("주문을 선택해 주세요");
  const data = normalizeInput(input);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: orderWithLinesInclude,
    });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "SHIPMENT_REQUESTED") {
      throw new ValidationError("출고 요청된 주문만 포장단위를 배정할 수 있습니다");
    }

    const orderSkuLines = order.productLines.flatMap((line) => line.skuLines);
    const skuById = new Map(orderSkuLines.map((sku) => [sku.id, sku]));
    for (const item of data.items) {
      if (!skuById.has(item.skuLineId)) {
        throw new ValidationError("주문에 속한 SKU만 포장할 수 있습니다");
      }
    }

    const existingPackages = await tx.shipmentPackage.findMany({
      where: { orderId },
      include: { items: true },
    });
    const packageIdForSameMarker = existingPackages.find((pkg) => pkg.marker === data.marker)?.id;
    const totals = new Map<string, number>();

    for (const pkg of existingPackages) {
      if (pkg.id === packageIdForSameMarker) continue;
      for (const item of pkg.items) {
        totals.set(item.skuLineId, (totals.get(item.skuLineId) ?? 0) + item.quantity);
      }
    }

    for (const item of data.items) {
      totals.set(item.skuLineId, (totals.get(item.skuLineId) ?? 0) + item.quantity);
    }

    for (const [skuLineId, total] of totals) {
      const sku = skuById.get(skuLineId);
      if (!sku || total > shippableQuantity(sku)) {
        throw new ValidationError("SKU 출고 가능 수량을 초과했습니다");
      }
    }

    const saved = await tx.shipmentPackage.upsert({
      where: { orderId_marker: { orderId, marker: data.marker } },
      create: {
        orderId,
        marker: data.marker,
        status: data.status,
        weightGrams: data.weightGrams,
        volumeCm3: data.volumeCm3,
        memo: data.memo,
      },
      update: {
        status: data.status,
        weightGrams: data.weightGrams,
        volumeCm3: data.volumeCm3,
        memo: data.memo,
      },
    });

    await tx.shipmentPackageItem.deleteMany({ where: { packageId: saved.id } });
    await tx.shipmentPackageItem.createMany({
      data: data.items.map((item) => ({
        packageId: saved.id,
        skuLineId: item.skuLineId,
        quantity: item.quantity,
      })),
    });

    return tx.shipmentPackage.findUniqueOrThrow({
      where: { id: saved.id },
      include: {
        items: {
          include: { skuLine: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });
}

export async function listSellerShipmentPackages(sellerId: string, orderId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  const order = await prisma.order.findFirst({
    where: { id: orderId, sellerId },
    select: { id: true },
  });
  if (!order) throw new ValidationError("주문을 찾을 수 없습니다");

  return prisma.shipmentPackage.findMany({
    where: { orderId },
    include: {
      items: {
        include: { skuLine: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { marker: "asc" },
  });
}

export async function listAdminShipmentOrders() {
  return prisma.order.findMany({
    where: { status: "SHIPMENT_REQUESTED" },
    orderBy: { shipmentRequestedAt: "desc" },
    include: {
      seller: {
        select: {
          email: true,
          contactName: true,
          companyName: true,
        },
      },
      shipmentPackages: {
        include: { items: true },
      },
    },
  });
}

export async function getAdminShipmentOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: {
        select: {
          email: true,
          contactName: true,
          companyName: true,
        },
      },
      ...orderWithLinesAndPackagesInclude,
    },
  });
}
