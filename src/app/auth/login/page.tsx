"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else setError(data.error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="w-full max-w-md bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-heading">고객 로그인</h1>
        <p className="text-sm text-secondary">서비스를 이용하시려면 로그인해주세요</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일" className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호" className="w-full border border-black/10 rounded-lg px-3 py-2" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-[12px] py-3">로그인</button>
        <p className="text-sm text-secondary">처음이신가요? <Link href="/auth/register" className="text-accent font-medium">회원가입</Link></p>
      </form>
    </main>
  );
}
