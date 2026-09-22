"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface ProviderRow {
  name: string;
  type: string;
  status: string;
  plan: string;
  country: string | null;
  ports: string[] | null;
  email: string;
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        router.push("/for-providers/login");
        return;
      }
      const { data } = await supabaseBrowser
        .from("providers")
        .select("name, type, status, plan, country, ports, email")
        .eq("auth_user_id", userData.user.id)
        .single();

      if (data) setProvider(data as ProviderRow);

      const params = new URLSearchParams(window.location.search);
      if (params.get("welcome") === "1") setShowWelcome(true);

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#08100a" }}>
        <span style={{ color: "#b0c0a4" }}>Loading...</span>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#08100a" }}>
        <span style={{ color: "#b0c0a4" }}>We couldn&apos;t find your listing. Please contact support.</span>
      </main>
    );
  }

  const isIncomplete = provider.status === "pending";

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: "#08100a" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" style={{ color: "#c8a84b", fontSize: 14, fontWeight: 700 }}>
            PortServiceFinder
          </Link>
          <button
            onClick={handleLogout}
            style={{ color: "#b0c0a4", fontSize: 12, border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 14px" }}
          >
            Log out
          </button>
        </div>

        {showWelcome && (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(76,175,118,.12)", border: "1px solid rgba(76,175,118,.35)" }}>
            <span style={{ color: "#4caf76", fontWeight: 700, fontSize: 14 }}>🎉 Your listing is live!</span>
            <p style={{ color: "#b0c0a4", fontSize: 13, marginTop: 4 }}>
              Vessel operators searching your ports can now find and contact you directly.
            </p>
          </div>
        )}

        {isIncomplete && (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.35)" }}>
            <span style={{ color: "#c8a84b", fontWeight: 700, fontSize: 14 }}>Your listing isn&apos;t published yet</span>
            <p style={{ color: "#b0c0a4", fontSize: 13, marginTop: 4, marginBottom: 10 }}>
              Complete your profile so vessel operators can find you.
            </p>
            <Link
              href="/for-providers/complete-profile"
              style={{ display: "inline-block", background: "#c8a84b", color: "#08100a", fontWeight: 700, fontSize: 13, padding: "9px 16px", borderRadius: 8 }}
            >
              Complete My Listing →
            </Link>
          </div>
        )}

        <div className="rounded-2xl p-6" style={{ background: "#111c13", border: "1px solid rgba(200,168,75,.15)" }}>
          <h1 style={{ color: "#f5f0e8", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{provider.name}</h1>
          <p style={{ color: "#b0c0a4", fontSize: 13, marginBottom: 20 }}>{provider.email}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-lg p-3" style={{ background: "#08100a", border: "1px solid rgba(200,168,75,.2)" }}>
              <div style={{ color: "#c8a84b", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Plan</div>
              <div style={{ color: "#f5f0e8", fontSize: 14, fontWeight: 600, marginTop: 2 }}>Free (launch period)</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#08100a", border: "1px solid rgba(76,175,118,.3)" }}>
              <div style={{ color: "#4caf76", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Status</div>
              <div style={{ color: "#f5f0e8", fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {isIncomplete ? "Incomplete" : "Published"}
              </div>
            </div>
          </div>

          {provider.country && (
            <p style={{ color: "#b0c0a4", fontSize: 13, marginBottom: 4 }}>
              <b style={{ color: "#f5f0e8" }}>Country:</b> {provider.country}
            </p>
          )}
          {provider.ports && provider.ports.length > 0 && (
            <p style={{ color: "#b0c0a4", fontSize: 13, marginBottom: 12 }}>
              <b style={{ color: "#f5f0e8" }}>Ports:</b> {provider.ports.join(", ")}
            </p>
          )}

          <Link
            href="/for-providers/complete-profile"
            style={{ display: "inline-block", color: "#c8a84b", fontSize: 13, fontWeight: 700, textDecoration: "underline" }}
          >
            Edit my listing
          </Link>
        </div>
      </div>
    </main>
  );
}
