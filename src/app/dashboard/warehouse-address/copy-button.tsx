"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); }}
      className="bg-accent text-white text-sm font-semibold rounded-[12px] px-4 py-2">
      {copied ? "복사됨 ✓" : "원클릭 복사"}
    </button>
  );
}
