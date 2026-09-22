"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const anchorSvg = (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#08100a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.4" />
    <line x1="12" y1="7.4" x2="12" y2="20.5" />
    <line x1="7.5" y1="10.4" x2="16.5" y2="10.4" />
    <path d="M4.5 14.8c0 3.7 3.3 5.7 7.5 5.7s7.5-2 7.5-5.7" />
    <path d="M4.5 14.8l-1.6-1.2M4.5 14.8l2-.4" />
    <path d="M19.5 14.8l1.6-1.2M19.5 14.8l-2-.4" />
  </svg>
);

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
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#08100a" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: 480, height: 480, top: -160, right: -100, borderRadius: "50%",
          filter: "blur(90px)", opacity: 0.18,
          background: "radial-gradient(circle, #c8a84b, transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span
            className="grid place-items-center"
            style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(145deg,#e2c06a,#c8a84b)" }}
          >
            {anchorSvg}
          </span>
          <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
            Port<span style={{ color: "#c8a84b" }}>Service</span>Finder
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1 style={{ color: "#f5f0e8", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: "#d4dcc8", fontSize: 14 }}>Log in to manage your listing</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "#111c13", border: "1px solid rgba(200,168,75,.15)" }}
        >
          <div className="mb-4">
            <label htmlFor="email" style={{ display: "block", color: "#d4dcc8", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
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
              style={{ background: "#08100a", border: "1px solid rgba(255,255,255,.1)", color: "#f5f0e8" }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{ display: "block", color: "#d4dcc8", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
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
              style={{ background: "#08100a", border: "1px solid rgba(255,255,255,.1)", color: "#f5f0e8" }}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg p-3" style={{ background: "rgba(255,138,138,.1)", border: "1px solid rgba(255,138,138,.3)" }}>
              <span style={{ color: "#ff8a8a", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg,#e2c06a,#c8a84b)",
              color: "#08100a",
              fontWeight: 700,
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#d4dcc8", fontSize: 13, marginTop: 24 }}>
          Don&apos;t have an account?{" "}
          <Link href="/for-providers/signup" style={{ color: "#c8a84b", fontWeight: 700 }}>
            List your business
          </Link>
        </p>
      </div>
    </main>
  );
}
