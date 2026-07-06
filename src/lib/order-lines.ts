import { ValidationError } from "./auth";

export type NewOrderSkuLine = {
  optionText?: string;
  quantity: number;
};

export type NewOrderProductLine = {
  productUrl: string;
  productName: string;
  skus: NewOrderSkuLine[];
};

export const orderWithLinesInclude = {
  productLines: {
    include: { skuLines: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { sortOrder: "asc" as const },
  },
};

export function normalizeOrderLines(input: {
  productUrl?: string;
  productName?: string;
  optionText?: string;
  quantity?: number;
  items?: NewOrderProductLine[];
}) {
  const items =
    input.items ??
    [
      {
        productUrl: input.productUrl ?? "",
        productName: input.productName ?? "",
        skus: [{ optionText: input.optionText ?? "기본", quantity: Number(input.quantity) }],
      },
    ];

  if (!Array.isArray(items)) throw new ValidationError("상품 입력 형식이 올바르지 않습니다");
  if (items.length < 1) throw new ValidationError("상품을 1개 이상 입력해 주세요");

  return items.map((item, productIndex) => {
    if (!item || typeof item !== "object") throw new ValidationError("상품 입력 형식이 올바르지 않습니다");
    if (!Array.isArray(item.skus)) throw new ValidationError("SKU 입력 형식이 올바르지 않습니다");
    if (typeof item.productUrl !== "string" || typeof item.productName !== "string") {
      throw new ValidationError("상품 입력 형식이 올바르지 않습니다");
    }
    if (!/^https?:\/\/.+/.test(item.productUrl)) throw new ValidationError("상품 링크 형식이 올바르지 않습니다");
    if (!item.productName.trim()) throw new ValidationError("상품명을 입력해 주세요");
    if (!item.skus.length) throw new ValidationError("SKU를 1개 이상 입력해 주세요");

    return {
      productUrl: item.productUrl.trim(),
      productName: item.productName.trim(),
      sortOrder: productIndex,
      skuLines: item.skus.map((sku, skuIndex) => {
        if (!sku || typeof sku !== "object") throw new ValidationError("SKU 입력 형식이 올바르지 않습니다");
        if (sku.optionText !== undefined && typeof sku.optionText !== "string") {
          throw new ValidationError("SKU 입력 형식이 올바르지 않습니다");
        }
        if (!Number.isInteger(sku.quantity) || sku.quantity < 1) {
          throw new ValidationError("수량은 1 이상이어야 합니다");
        }

        const optionText = sku.optionText?.trim() || "기본";

        return {
          optionText,
          quantity: sku.quantity,
          sortOrder: skuIndex,
        };
      }),
    };
  });
}

export function getTotalQuantity(lines: ReturnType<typeof normalizeOrderLines>) {
  return lines.reduce((sum, item) => sum + item.skuLines.reduce((skuSum, sku) => skuSum + sku.quantity, 0), 0);
}

export function getSkuCount(lines: ReturnType<typeof normalizeOrderLines>) {
  return lines.reduce((sum, item) => sum + item.skuLines.length, 0);
}
