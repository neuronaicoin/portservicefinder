"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ProviderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push("/for-providers/dashboard");
  }

  return (
    <>
    <SiteHeader />
    <main className="flex justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ color: "var(--ink)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--ink2)", fontSize: 15 }}>Log in to manage your listing</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="mb-4">
            <label htmlFor="email" style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg p-3" style={{ background: "color-mix(in srgb, var(--bad) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--bad) 30%, transparent)" }}>
              <span style={{ color: "var(--bad)", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg"
            style={{
              background: "var(--acc)",
              color: "var(--on-acc)",
              fontWeight: 700,
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--ink2)", fontSize: 14, marginTop: 24 }}>
          Don&apos;t have an account?{" "}
          <Link href="/for-providers/signup" style={{ color: "var(--acc)", fontWeight: 700 }}>
            List your company free
          </Link>
        </p>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
