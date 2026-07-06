import { describe, expect, it } from "vitest";
import { getPublicHeaderActions } from "../src/components/public/header-auth";

describe("public site header", () => {
  it("로그인한 셀러에게 로그인·무료 가입 대신 마이페이지와 로그아웃을 보여준다", () => {
    const actions = getPublicHeaderActions({ role: "SELLER" });

    expect(actions.map((action) => action.label)).toEqual(["마이페이지", "로그아웃"]);
    expect(actions).not.toContainEqual(expect.objectContaining({ href: "/auth/login" }));
    expect(actions).not.toContainEqual(expect.objectContaining({ href: "/auth/register" }));
  });

  it("로그인한 운영자에게 운영자 화면과 로그아웃을 보여준다", () => {
    const actions = getPublicHeaderActions({ role: "ADMIN" });

    expect(actions.map((action) => action.label)).toEqual(["운영자", "로그아웃"]);
    expect(actions[0]).toEqual(expect.objectContaining({ href: "/admin/orders" }));
  });
});
