"use client";

import { useState } from "react";
import Link from "next/link";
import { SyntheticBanner } from "@/components/common/SyntheticBanner";
import { useAppData } from "@/lib/appdata/provider";
import { apiPost } from "@/lib/api/client";
import { Input } from "@/components/ui/input";

export function LoginClient() {
  const { mode } = useAppData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/api/auth/login", { email, password });
      // Full navigation so the httpOnly session cookie is picked up before
      // any protected route is rendered.
      window.location.assign("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login gagal.");
      setBusy(false);
    }
  };

  return (
    <>
      <SyntheticBanner />
      <main className="mx-auto mt-16 max-w-sm rounded-fib5 border border-line bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md">
        <h1 className="text-2xl font-extrabold">Coordinator login</h1>

        {mode === "api" ? (
          <>
            <p className="mt-2 text-sm text-muted">
              Masuk dengan akun koordinator, advisor, atau admin. Data yang ditampilkan tetap sintetis.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <label className="block text-xs font-bold text-ink">
                Email
                <Input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 rounded-fib3"
                />
              </label>
              <label className="block text-xs font-bold text-ink">
                Kata sandi
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 rounded-fib3"
                />
              </label>
              {error && (
                <p role="alert" className="rounded-fib3 border border-un/40 bg-un-bg px-3 py-2 text-sm font-semibold text-un">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-fib3 bg-brand px-4 py-3 text-center font-bold text-white transition-all duration-200 hover:-translate-y-[3px] hover:bg-green-dark hover:shadow-md disabled:opacity-60"
              >
                {busy ? "Memeriksa…" : "Masuk"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Mode prototipe tanpa database: lanjut sebagai koordinator demo untuk Kecamatan Gunungpati.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 block rounded-fib3 bg-brand px-4 py-3 text-center font-bold text-white transition-all duration-200 hover:-translate-y-[3px] hover:bg-green-dark hover:shadow-md"
            >
              Continue as demo coordinator
            </Link>
          </>
        )}
      </main>
    </>
  );
}
