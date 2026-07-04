"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", contactName: "", companyName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else setError(data.error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="w-full max-w-md bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-heading">회원가입</h1>
        <input type="email" required placeholder="이메일" value={form.email} onChange={set("email")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input type="password" required placeholder="비밀번호 (8자 이상)" value={form.password} onChange={set("password")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input required placeholder="담당자명" value={form.contactName} onChange={set("contactName")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input placeholder="회사명 (선택)" value={form.companyName} onChange={set("companyName")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input placeholder="연락처 (선택)" value={form.phone} onChange={set("phone")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-[12px] py-3">가입하기</button>
        <p className="text-sm text-secondary">이미 회원이신가요? <Link href="/auth/login" className="text-accent font-medium">로그인</Link></p>
      </form>
    </main>
  );
}
