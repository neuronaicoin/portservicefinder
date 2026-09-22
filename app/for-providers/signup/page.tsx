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

const PROVIDER_TYPES = [
  { value: "agent", label: "Ship Agent" },
  { value: "chandler", label: "Shipchandler" },
  { value: "service", label: "Marine Services" },
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const [providerType, setProviderType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!providerType) {
      setError("Please select your provider type.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    // 1. Gercek Supabase Auth hesabi olustur
    const { data: authData, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Could not create account. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Minimal bir provider satiri olustur, yeni hesaba bagla.
    //    Kalan bilgiler (bio, ulke, limanlar, servisler vb.) sonraki adimda
    //    /for-providers/complete-profile sayfasinda doldurulacak.
    const { error: insertError } = await supabaseBrowser.from("providers").insert([
      {
        auth_user_id: authData.user.id,
        type: providerType,
        name: companyName,
        email,
        status: "pending", // profil tamamlanana kadar listede gorunmez (mevcut check constraint: pending/active/cancelled/expired)
        plan: "free_trial",
        plan_type: "free_trial",
        verified: false,
        display_icon: providerType === "agent" ? "🏢" : providerType === "chandler" ? "⚓" : "🔧",
      },
    ]);

    if (insertError) {
      setError(insertError.message || "Account created, but we couldn't save your listing. Please contact support.");
      setLoading(false);
      return;
    }

    router.push("/for-providers/complete-profile");
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
          <div
            className="inline-block px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.35)" }}
          >
            <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              ⚓ For Providers
            </span>
          </div>
          <h1 style={{ color: "#f5f0e8", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            List your business
          </h1>
          <p style={{ color: "#d4dcc8", fontSize: 14 }}>
            Free to list right now — no card required
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "#111c13", border: "1px solid rgba(200,168,75,.15)" }}
        >
          <div className="mb-4">
            <label style={{ display: "block", color: "#d4dcc8", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
              Provider Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setProviderType(t.value)}
                  style={{
                    padding: "10px 6px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    textAlign: "center",
                    border: providerType === t.value ? "1.5px solid #c8a84b" : "1px solid rgba(255,255,255,.1)",
                    background: providerType === t.value ? "rgba(200,168,75,.15)" : "#08100a",
                    color: providerType === t.value ? "#c8a84b" : "#d4dcc8",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="companyName" style={{ display: "block", color: "#d4dcc8", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Horizon Ship Agency"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "#08100a", border: "1px solid rgba(255,255,255,.1)", color: "#f5f0e8" }}
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            {loading ? "Creating account..." : "Create Free Account →"}
          </button>

          <p style={{ color: "rgba(212,220,200,.85)", fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
            By signing up, you agree to our{" "}
            <Link href="/terms" style={{ color: "#c8a84b" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "#c8a84b" }}>Privacy Policy</Link>
          </p>
        </form>

        <p style={{ textAlign: "center", color: "#d4dcc8", fontSize: 13, marginTop: 24 }}>
          Already have an account?{" "}
          <Link href="/for-providers/login" style={{ color: "#c8a84b", fontWeight: 700 }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
