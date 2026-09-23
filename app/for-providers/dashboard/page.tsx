"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { getRecentLeads, getTotalLeadCount, getLeadsThisWeek, type Lead } from "@/lib/leads";
import { getReceivedRfqs, getRfqCount, type ReceivedRfq } from "@/lib/rfq";
import { NotificationBell } from "@/components/NotificationBell";

interface ProviderRow {
  id: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  country: string | null;
  ports: string[] | null;
  email: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CallIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M6.5 3h3l2 5-2.5 1.5a12 12 0 0 0 5.5 5.5L16 12.5l5 2v3a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 4.5 5a2 2 0 0 1 2-2Z" stroke="#c8a84b" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const EmailIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="#c8a84b" strokeWidth="1.6" />
    <path d="m4.5 7 7.5 6 7.5-6" stroke="#c8a84b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsThisWeek, setLeadsThisWeek] = useState(0);
  const [rfqs, setRfqs] = useState<ReceivedRfq[]>([]);
  const [rfqCount, setRfqCount] = useState(0);
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
        .select("id, name, type, status, plan, country, ports, email")
        .eq("auth_user_id", userData.user.id)
        .single();

      if (data) {
        const p = data as ProviderRow;
        setProvider(p);
        const [recentLeads, total, thisWeek, receivedRfqs, rfqTotal] = await Promise.all([
          getRecentLeads(p.id),
          getTotalLeadCount(p.id),
          getLeadsThisWeek(p.id),
          getReceivedRfqs(p.id),
          getRfqCount(p.id),
        ]);
        setLeads(recentLeads);
        setTotalLeads(total);
        setLeadsThisWeek(thisWeek);
        setRfqs(receivedRfqs);
        setRfqCount(rfqTotal);
      }

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
      <main style={{ minHeight: "100vh", background: "#08100a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#d4dcc8" }}>Loading...</span>
      </main>
    );
  }

  if (!provider) {
    return (
      <main style={{ minHeight: "100vh", background: "#08100a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#d4dcc8" }}>We couldn&apos;t find your listing. Please contact support.</span>
      </main>
    );
  }

  const isPending = provider.status === "pending";
  const isActive = provider.status === "active";

  const cardStyle: React.CSSProperties = {
    background: "#111c13",
    border: "1px solid rgba(200,168,75,.15)",
    borderRadius: 14,
  };

  return (
    <main style={{ minHeight: "100vh", background: "#08100a" }}>
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid rgba(200,168,75,.12)", padding: "16px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
            Port<span style={{ color: "#c8a84b" }}>Service</span>Finder
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell providerId={provider.id} />
            <button
              onClick={handleLogout}
              style={{ color: "#d4dcc8", fontSize: 12, border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: "10px 16px", background: "transparent", cursor: "pointer" }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 60px" }}>
        {showWelcome && (
          <div style={{ ...cardStyle, background: "rgba(76,175,118,.1)", borderColor: "rgba(76,175,118,.35)", padding: "16px 20px", marginBottom: 18 }}>
            <span style={{ color: "#4caf76", fontWeight: 700, fontSize: 14 }}>🎉 Your listing is live!</span>
            <p style={{ color: "#d4dcc8", fontSize: 13, marginTop: 4 }}>
              Vessel operators searching your ports can now find and contact you directly.
            </p>
          </div>
        )}

        {isPending && (
          <div style={{ ...cardStyle, background: "rgba(200,168,75,.1)", borderColor: "rgba(200,168,75,.4)", padding: "16px 20px", marginBottom: 18 }}>
            <span style={{ color: "#c8a84b", fontWeight: 700, fontSize: 14 }}>Your listing isn&apos;t published yet</span>
            <p style={{ color: "#d4dcc8", fontSize: 13, marginTop: 4, marginBottom: 12 }}>
              Complete your profile so vessel operators can find you.
            </p>
            <Link
              href="/for-providers/complete-profile"
              style={{ display: "inline-block", background: "#c8a84b", color: "#08100a", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 10, textDecoration: "none" }}
            >
              Complete My Listing →
            </Link>
          </div>
        )}

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>{provider.name}</h1>
          <p style={{ color: "#d4dcc8", fontSize: 13 }}>{provider.email}</p>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "#c8a84b", fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RFQs Received</div>
            <div style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>{rfqCount}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "#c8a84b", fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>Total Leads</div>
            <div style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>{totalLeads}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "#4caf76", fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>This Week</div>
            <div style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>{leadsThisWeek}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: isActive ? "#4caf76" : "#c8a84b", fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>Status</div>
            <div style={{ color: "#f5f0e8", fontSize: 15, fontWeight: 700, marginTop: 4 }}>{isActive ? "Published" : "Pending"}</div>
          </div>
        </div>

        {/* RECEIVED RFQs - en yuksek deger, en ustte */}
        <div style={{ ...cardStyle, padding: "22px 20px", marginBottom: 20 }}>
          <h2 style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Quote Requests</h2>
          <p style={{ color: "#d4dcc8", fontSize: 12, marginBottom: 16 }}>
            Operators requesting a quote for your port and service appear here with full details — contact them
            directly.
          </p>

          {rfqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
              <p style={{ color: "#d4dcc8", fontSize: 13 }}>No quote requests yet. When an operator requests a quote for your port, it shows up here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rfqs.map((r) => (
                <div
                  key={r.distributionId}
                  style={{ background: "#08100a", border: r.urgency === "urgent" ? "1px solid rgba(224,85,85,.4)" : "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 14 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span style={{ color: "#f5f0e8", fontSize: 13.5, fontWeight: 700 }}>{r.port}, {r.country}</span>
                      {r.urgency === "urgent" && (
                        <span style={{ marginLeft: 8, background: "rgba(224,85,85,.15)", color: "#e88", fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999, textTransform: "uppercase" }}>
                          ⚡ Urgent
                        </span>
                      )}
                    </div>
                    <span style={{ color: "#7a8a72", fontSize: 10.5, flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.vesselType && <div style={{ color: "#d4dcc8", fontSize: 12, marginBottom: 3 }}><b style={{ color: "#c8a84b" }}>Vessel:</b> {r.vesselType}</div>}
                  {r.eta && <div style={{ color: "#d4dcc8", fontSize: 12, marginBottom: 3 }}><b style={{ color: "#c8a84b" }}>ETA:</b> {r.eta}</div>}
                  <div style={{ color: "#d4dcc8", fontSize: 12, marginBottom: 10 }}>{r.requirementDetails}</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ color: "#f5f0e8", fontSize: 12.5, fontWeight: 700 }}>{r.operatorName}</span>
                    <a href={`mailto:${r.operatorEmail}`} style={{ color: "#c8a84b", fontSize: 12 }}>{r.operatorEmail}</a>
                    {r.operatorPhone && <a href={`tel:${r.operatorPhone}`} style={{ color: "#c8a84b", fontSize: 12 }}>{r.operatorPhone}</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT LEADS */}
        <div id="recent-leads-section" style={{ ...cardStyle, padding: "22px 20px", marginBottom: 20 }}>
          <h2 style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Recent Leads</h2>
          <p style={{ color: "#d4dcc8", fontSize: 12, marginBottom: 16 }}>
            Every time a vessel operator taps Call or Email on your listing, it shows up here.
          </p>

          {leads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <p style={{ color: "#d4dcc8", fontSize: 13 }}>No leads yet. Once operators start contacting you, they&apos;ll appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 8px",
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(200,168,75,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {lead.contact_method === "call" ? CallIcon : EmailIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f5f0e8", fontSize: 13, fontWeight: 600 }}>
                      Operator {lead.contact_method === "call" ? "called" : "emailed"} you
                    </div>
                    <div style={{ color: "#d4dcc8", fontSize: 11 }}>via PortServiceFinder</div>
                  </div>
                  <div style={{ color: "#7a8a72", fontSize: 11, flexShrink: 0 }}>{timeAgo(lead.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LISTING INFO */}
        <div style={{ ...cardStyle, padding: "22px 20px" }}>
          <h2 style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Your Listing</h2>
          {provider.country && (
            <p style={{ color: "#d4dcc8", fontSize: 13, marginBottom: 6 }}>
              <b style={{ color: "#f5f0e8" }}>Country:</b> {provider.country}
            </p>
          )}
          {provider.ports && provider.ports.length > 0 && (
            <p style={{ color: "#d4dcc8", fontSize: 13, marginBottom: 14 }}>
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
