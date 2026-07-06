import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach } from "vitest";
import { afterEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder, listOrdersBySeller } from "../src/lib/orders";
import { recordInbound } from "../src/lib/inbound";

let sellerA: { id: string }, sellerB: { id: string };

type ReactNodeLike =
  | string
  | number
  | boolean
  | null
  | undefined
  | { type?: unknown; props?: { children?: ReactNodeLike | ReactNodeLike[]; [key: string]: unknown } }
  | ReactNodeLike[];

function flattenElements(node: ReactNodeLike): Array<{ type?: unknown; props?: Record<string, unknown> }> {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => flattenElements(child));
  return [node, ...flattenElements(node.props?.children as ReactNodeLike)];
}

function textContent(node: ReactNodeLike): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child) => textContent(child)).join("");
  return textContent(node.props?.children as ReactNodeLike);
}

function findByText(
  node: ReactNodeLike,
  type: string,
  text: string,
  occurrence = 0,
): { type?: unknown; props?: Record<string, unknown> } {
  const matches = flattenElements(node).filter(
    (element) => element.type === type && textContent(element).replace(/\s+/g, " ").trim() === text,
  );
  if (!matches[occurrence]) throw new Error(`${type} "${text}" not found`);
  return matches[occurrence];
}

function findRegion(
  node: ReactNodeLike,
  label: string,
): { type?: unknown; props?: Record<string, unknown> } {
  const match = flattenElements(node).find(
    (element) => element.type === "section" && element.props?.role === "region" && element.props?.["aria-label"] === label,
  );
  if (!match) throw new Error(`region "${label}" not found`);
  return match;
}

function findControlsByLabel(
  node: ReactNodeLike,
  labelText: string,
): Array<{ type?: unknown; props?: Record<string, unknown> }> {
  return flattenElements(node)
    .filter((element) => element.type === "label" && textContent(element).replace(/\s+/g, " ").trim().startsWith(labelText))
    .map((label) => {
      const control = flattenElements(label.props?.children as ReactNodeLike).find(
        (element) => element.type === "input" || element.type === "textarea",
      );
      if (!control) throw new Error(`control for label "${labelText}" not found`);
      return control;
    });
}

beforeEach(async () => {
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.orderSkuLine.deleteMany();
  await prisma.orderProductLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "a@a.com", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "b@b.com", password: "password1", contactName: "B" });
});

afterEach(() => {
  vi.doUnmock("next/navigation");
  vi.doUnmock("next/link");
  vi.doUnmock("@/lib/session");
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("createOrder", () => {
  it("링크·상품명·수량·구분·검수 선택으로 접수되고 상태는 REQUESTED", async () => {
    const o = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전", optionText: "화이트", quantity: 100,
      serviceType: "PURCHASE", inspectionRequested: true,
    });
    expect(o.status).toBe("REQUESTED");
    expect(o.inspectionRequested).toBe(true);
  });
  it("수량 1 미만은 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "https://x.com", productName: "x", quantity: 0, serviceType: "PURCHASE", inspectionRequested: false,
    })).rejects.toThrow("수량");
  });
  it("URL 형식이 아니면 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "not-a-url", productName: "x", quantity: 1, serviceType: "SHIPPING", inspectionRequested: false,
    })).rejects.toThrow("상품 링크");
  });
});

describe("createOrder — 입력 화이트리스트", () => {
  it("body로 status를 주입해도 무시되고 REQUESTED로 저장된다", async () => {
    const o = await createOrder(sellerA.id, {
      productUrl: "https://a.com", productName: "x", quantity: 1,
      serviceType: "PURCHASE", inspectionRequested: false,
      status: "DELIVERED", id: "hacked", createdAt: new Date(0),
    } as never);
    expect(o.status).toBe("REQUESTED");
    expect(o.id).not.toBe("hacked");
  });
  it("serviceType이 PURCHASE/SHIPPING 외면 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "https://a.com", productName: "x", quantity: 1,
      serviceType: "XYZ" as never, inspectionRequested: false,
    })).rejects.toThrow("서비스 유형");
  });
});

describe("createOrder — SKU 라인 구조", () => {
  it("주문 묶음 1건에 상품 라인과 SKU 라인을 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      memo: "묶음 주문",
      items: [
        {
          productUrl: "https://detail.1688.com/offer/100.html",
          productName: "상품 A",
          skus: [
            { optionText: "빨강", quantity: 50 },
            { optionText: "파랑", quantity: 50 },
          ],
        },
        {
          productUrl: "https://detail.1688.com/offer/200.html",
          productName: "상품 B",
          skus: [{ optionText: "L", quantity: 30 }],
        },
      ],
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });

    expect(saved.quantity).toBe(130);
    expect(saved.productLines).toHaveLength(2);
    expect(saved.productLines[0].skuLines.map((sku) => sku.optionText)).toEqual(["빨강", "파랑"]);
    expect(saved.productLines[1].skuLines[0].quantity).toBe(30);
  });

  it("기존 단건 주문 입력은 SKU 1개짜리 주문으로 호환 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전",
      optionText: "화이트",
      quantity: 100,
      serviceType: "PURCHASE",
      inspectionRequested: true,
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });

    expect(saved.productLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines[0].optionText).toBe("화이트");
    expect(saved.productLines[0].skuLines[0].quantity).toBe(100);
  });

  it("items가 빈 배열이면 레거시 fallback 대신 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [],
      }),
    ).rejects.toThrow("상품을 1개 이상 입력해 주세요");
  });

  it("items가 배열이 아니면 400 경계용 ValidationError로 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: { productUrl: "https://detail.1688.com/offer/300.html" } as never,
      }),
    ).rejects.toThrow("상품 입력 형식이 올바르지 않습니다");
  });

  it("items 안의 상품이 객체가 아니면 400 경계용 ValidationError로 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [null] as never,
      }),
    ).rejects.toThrow("상품 입력 형식이 올바르지 않습니다");
  });

  it("item.skus가 배열이 아니면 400 경계용 ValidationError로 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [
          {
            productUrl: "https://detail.1688.com/offer/300.html",
            productName: "상품 C",
            skus: { optionText: "빨강", quantity: 5 } as never,
          },
        ],
      }),
    ).rejects.toThrow("SKU 입력 형식이 올바르지 않습니다");
  });

  it("SKU 항목이 객체가 아니면 400 경계용 ValidationError로 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [
          {
            productUrl: "https://detail.1688.com/offer/300.html",
            productName: "상품 C",
            skus: [null] as never,
          },
        ],
      }),
    ).rejects.toThrow("SKU 입력 형식이 올바르지 않습니다");
  });

  it("SKU 옵션명이 문자열이 아니면 400 경계용 ValidationError로 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [
          {
            productUrl: "https://detail.1688.com/offer/300.html",
            productName: "상품 C",
            skus: [{ optionText: 123, quantity: 5 }] as never,
          },
        ],
      }),
    ).rejects.toThrow("SKU 입력 형식이 올바르지 않습니다");
  });

  it("SKU 옵션명이 공백뿐이면 기본값으로 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [
        {
          productUrl: "https://detail.1688.com/offer/300.html",
          productName: "상품 C",
          skus: [{ optionText: "   ", quantity: 5 }],
        },
      ],
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });

    expect(saved.productLines[0].skuLines[0].optionText).toBe("기본");
  });
});

describe("listOrdersBySeller — sellerId 가드", () => {
  it("sellerId가 없으면 전체 반환 대신 오류를 던진다", async () => {
    await createOrder(sellerA.id, { productUrl: "https://a.com", productName: "A상품", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false });
    await expect(listOrdersBySeller(undefined as unknown as string)).rejects.toThrow("로그인");
    await expect(listOrdersBySeller("")).rejects.toThrow("로그인");
  });
});

describe("listOrdersBySeller — 데이터 격리(절대 실패 금지)", () => {
  it("셀러 A는 자기 주문만 본다", async () => {
    await createOrder(sellerA.id, { productUrl: "https://a.com", productName: "A상품", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false });
    await createOrder(sellerB.id, { productUrl: "https://b.com", productName: "B상품", quantity: 2, serviceType: "SHIPPING", inspectionRequested: false });
    const listA = await listOrdersBySeller(sellerA.id);
    expect(listA).toHaveLength(1);
    expect(listA[0].productName).toBe("A상품");
  });
});

describe("seller order UI", () => {
  it("주문 접수 폼은 여러 상품과 SKU를 입력해 숫자 수량 payload로 전송한다", async () => {
    const push = vi.fn();
    const fetchMock = vi.fn(async () => ({
      json: async () => ({ ok: true }),
    }));
    const hookState: unknown[] = [];
    let hookCursor = 0;

    function useStateMock<T>(initial: T) {
      const stateIndex = hookCursor++;
      if (!(stateIndex in hookState)) hookState[stateIndex] = initial;
      const setState = (value: T | ((current: T) => T)) => {
        hookState[stateIndex] =
          typeof value === "function" ? (value as (current: T) => T)(hookState[stateIndex] as T) : value;
      };
      return [hookState[stateIndex] as T, setState] as const;
    }

    vi.resetModules();
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return { ...actual, useState: useStateMock };
    });
    vi.doMock("next/navigation", () => ({
      useRouter: () => ({ push }),
    }));
    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    const { default: NewOrderPage } = await import("../src/app/dashboard/orders/new/page");

    const renderTree = () => {
      hookCursor = 0;
      return NewOrderPage();
    };

    let tree = renderTree();
    (findByText(tree, "button", "상품 추가").props?.onClick as () => void)();
    tree = renderTree();
    (findByText(tree, "button", "SKU 추가").props?.onClick as () => void)();
    tree = renderTree();

    const product1 = findRegion(tree, "상품 1");
    const product2 = findRegion(tree, "상품 2");

    (findControlsByLabel(product1, "상품 링크")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "https://detail.1688.com/offer/100.html" },
    });
    tree = renderTree();
    (findControlsByLabel(findRegion(tree, "상품 1"), "상품명")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "상품 A" },
    });
    tree = renderTree();
    const product1AfterName = findRegion(tree, "상품 1");
    (findControlsByLabel(product1AfterName, "옵션")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "빨강" },
    });
    (findControlsByLabel(product1AfterName, "수량")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "2" },
    });
    tree = renderTree();
    const product1AfterFirstSku = findRegion(tree, "상품 1");
    (findControlsByLabel(product1AfterFirstSku, "옵션")[1].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "파랑" },
    });
    (findControlsByLabel(product1AfterFirstSku, "수량")[1].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "3" },
    });
    tree = renderTree();
    const product2AfterSku = findRegion(tree, "상품 2");
    (findControlsByLabel(product2AfterSku, "상품 링크")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "https://detail.1688.com/offer/200.html" },
    });
    (findControlsByLabel(product2AfterSku, "상품명")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "상품 B" },
    });
    (findControlsByLabel(product2AfterSku, "옵션")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "L" },
    });
    (findControlsByLabel(product2AfterSku, "수량")[0].props?.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "4" },
    });
    tree = renderTree();

    await (flattenElements(tree).find((element) => element.type === "form")?.props?.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({
      preventDefault() {},
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(body.items).toEqual([
      {
        productUrl: "https://detail.1688.com/offer/100.html",
        productName: "상품 A",
        skus: [
          { optionText: "빨강", quantity: 2 },
          { optionText: "파랑", quantity: 3 },
        ],
      },
      {
        productUrl: "https://detail.1688.com/offer/200.html",
        productName: "상품 B",
        skus: [{ optionText: "L", quantity: 4 }],
      },
    ]);
    expect(body.items[0].skus.every((sku: { quantity: unknown }) => typeof sku.quantity === "number")).toBe(true);
    expect(body.items[1].skus.every((sku: { quantity: unknown }) => typeof sku.quantity === "number")).toBe(true);
    expect(push).toHaveBeenCalledWith("/dashboard/orders");
  });

  it("주문 목록은 SKU 라인이 있으면 SKU 요약을, 없으면 기존 수량 표기를 유지한다", () => {
    const source = readFileSync("src/app/dashboard/orders/page.tsx", "utf8");

    expect(source).toContain("productLines.reduce");
    expect(source).toContain("SKU");
    expect(source).toContain("× ${order.quantity}");
  });

  it("주문 상세는 SKU별 검수 상태·메모와 SKU 근거 합계 문구를 보여준다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [
        {
          productUrl: "https://detail.1688.com/offer/900.html",
          productName: "상세 상품",
          skus: [
            { optionText: "빨강", quantity: 2 },
            { optionText: "파랑", quantity: 3 },
          ],
        },
      ],
    });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });
    const [red, blue] = saved.productLines[0].skuLines;
    await recordInbound(order.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      skuResults: [
        { skuLineId: red.id, inboundQuantity: 2, defectCount: 0, inspectionPassed: true, inspectionNote: "정상 통과" },
        { skuLineId: blue.id, inboundQuantity: 2, defectCount: 1, inspectionPassed: false, inspectionNote: "1개 하자" },
      ],
    });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        quoteUnitPriceFen: 81,
        quoteCnShippingFen: 350,
        quoteWeightGrams: 1000,
        quoteVolumeCm3: 0,
        quoteExchangeRateX100: 19000,
        quoteShippingMethod: "SEA",
        quotedAt: new Date("2026-07-06T00:00:00.000Z"),
      },
    });
    await prisma.orderSkuLine.update({ where: { id: red.id }, data: { quoteUnitPriceFen: 101, quoteCnShippingFen: 100 } });
    await prisma.orderSkuLine.update({ where: { id: blue.id }, data: { quoteUnitPriceFen: 67, quoteCnShippingFen: 250 } });

    vi.resetModules();
    vi.doMock("next/navigation", () => ({
      redirect: vi.fn((path: string) => {
        throw new Error(`redirect:${path}`);
      }),
      notFound: vi.fn(() => {
        throw new Error("notFound");
      }),
    }));
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ userId: sellerA.id })),
    }));

    const { default: OrderDetailPage } = await import("../src/app/dashboard/orders/[id]/page");
    const html = renderToStaticMarkup(await OrderDetailPage({
      params: Promise.resolve({ id: order.id }),
      searchParams: Promise.resolve({}),
    }));

    expect(html).toContain("검수 합격");
    expect(html).toContain("검수 보류");
    expect(html).toContain("정상 통과");
    expect(html).toContain("1개 하자");
    expect(html).toContain("SKU 근거 합계");
  });
});
