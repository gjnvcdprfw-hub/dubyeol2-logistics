"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicHeaderActions, publicHeaderActionClassName, type PublicHeaderAction } from "./header-auth";

type AuthStatus =
  | { authenticated: false }
  | { authenticated: true; role: string };

function renderAction(action: PublicHeaderAction) {
  if (action.kind === "logout") {
    return (
      <form key={action.label} action="/api/auth/logout" method="post">
        <button type="submit" className={publicHeaderActionClassName(action.variant)}>{action.label}</button>
      </form>
    );
  }
  return (
    <Link key={action.href} href={action.href} className={publicHeaderActionClassName(action.variant)}>
      {action.label}
    </Link>
  );
}

export default function HeaderAuthActions() {
  const [actions, setActions] = useState<PublicHeaderAction[]>(() => getPublicHeaderActions(null));

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((status: AuthStatus | null) => {
        if (!mounted) return;
        if (status?.authenticated) {
          setActions(getPublicHeaderActions({ role: status.role }));
          return;
        }
        setActions(getPublicHeaderActions(null));
      })
      .catch(() => {
        if (mounted) setActions(getPublicHeaderActions(null));
      });

    return () => {
      mounted = false;
    };
  }, []);

  return <>{actions.map(renderAction)}</>;
}
