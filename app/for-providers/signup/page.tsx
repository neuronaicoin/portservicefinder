"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const PROVIDER_TYPES = [
  { value: "agent", label: "Ship agent" },
  { value: "chandler", label: "Shipchandler" },
  { value: "service", label: "Marine services" },
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
    <>
    <SiteHeader />
    <main className="flex justify-center px-4 py-10" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>For providers</p>
          <h1 style={{ color: "var(--ink)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            List your company free
          </h1>
          <p style={{ color: "var(--ink2)", fontSize: 15, lineHeight: 1.6 }}>
            Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year. No card
            needed now.
          </p>
        </div>

        {/* Real benefits only, no invented numbers */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Shown on every port page you serve",
              "Your own company page to share on LinkedIn",
              "Direct phone, email and WhatsApp contact",
              "No commission on any job",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                <span style={{ color: "var(--ink2)", fontSize: 14, lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="mb-4">
            <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Provider type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setProviderType(t.value)}
                  style={{
                    padding: "10px 6px",
                    minHeight: 44,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    textAlign: "center",
                    border: providerType === t.value ? "1.5px solid var(--acc)" : "1px solid color-mix(in srgb, var(--ink) 10%, transparent)",
                    background: providerType === t.value ? "color-mix(in srgb, var(--acc) 15%, transparent)" : "var(--bg)",
                    color: providerType === t.value ? "var(--ink)" : "var(--ink2)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="companyName" style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Horizon Ship Agency"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            {loading ? "Creating account..." : "Create free account"}
          </button>

          <p style={{ color: "var(--ink3)", fontSize: 13, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
            By signing up, you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--acc)" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "var(--acc)" }}>Privacy Policy</Link>
          </p>
        </form>

        {/* What happens next, matching the real flow */}
        <div className="mt-5 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
          <div style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            What happens next
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["1", "Create your account", "Company name, email and password"],
              ["2", "Complete your profile", "Ports, services and contact details"],
              ["3", "Go live", "Your listing appears on your port pages straight away"],
            ].map(([n, title, desc]) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "color-mix(in srgb, var(--acc) 15%, transparent)", color: "var(--acc)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {n}
                </span>
                <div>
                  <div style={{ color: "var(--ink)", fontSize: 14, fontWeight: 600 }}>{title}</div>
                  <div style={{ color: "var(--ink2)", fontSize: 13.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--ink2)", fontSize: 14, marginTop: 24 }}>
          Already have an account?{" "}
          <Link href="/for-providers/login" style={{ color: "var(--acc)", fontWeight: 700 }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
