export type PublicHeaderUser = { role?: string | null } | null;

export type PublicHeaderAction =
  | { kind: "link"; href: string; label: string; variant: "plain" | "primary" }
  | { kind: "logout"; label: string; variant: "plain" };

export function getPublicHeaderActions(user: PublicHeaderUser): PublicHeaderAction[] {
  if (!user) {
    return [
      { kind: "link", href: "/auth/login", label: "로그인", variant: "plain" },
      { kind: "link", href: "/auth/register", label: "무료 가입하기", variant: "primary" },
    ];
  }
  if (user.role === "ADMIN") {
    return [
      { kind: "link", href: "/admin/orders", label: "운영자", variant: "primary" },
      { kind: "logout", label: "로그아웃", variant: "plain" },
    ];
  }
  return [
    { kind: "link", href: "/dashboard", label: "마이페이지", variant: "primary" },
    { kind: "logout", label: "로그아웃", variant: "plain" },
  ];
}

export function publicHeaderActionClassName(variant: PublicHeaderAction["variant"]) {
  if (variant === "primary") return "bg-accent text-white font-semibold rounded-[12px] px-4 py-2";
  return "text-secondary hover:text-heading";
}
