"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { getRecentLeads, getTotalLeadCount, getLeadsThisWeek, type Lead } from "@/lib/leads";
import { getReceivedRfqs, getRfqCount, type ReceivedRfq } from "@/lib/rfq";
import { getSearchAppearances, getAppearancesByPort, type PortAppearance } from "@/lib/analytics";
import { NotificationBell } from "@/components/NotificationBell";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DashboardShare } from "@/components/providers/DashboardShare";

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
    <path d="M6.5 3h3l2 5-2.5 1.5a12 12 0 0 0 5.5 5.5L16 12.5l5 2v3a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 4.5 5a2 2 0 0 1 2-2Z" stroke="var(--acc)" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const EmailIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="var(--acc)" strokeWidth="1.6" />
    <path d="m4.5 7 7.5 6 7.5-6" stroke="var(--acc)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
  const [appearances, setAppearances] = useState(0);
  const [portBreakdown, setPortBreakdown] = useState<PortAppearance[]>([]);
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

        if (p.country && p.ports && p.ports.length > 0) {
          const [appear, breakdown] = await Promise.all([
            getSearchAppearances(p.country, p.ports),
            getAppearancesByPort(p.country, p.ports),
          ]);
          setAppearances(appear);
          setPortBreakdown(breakdown);
        }
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
      <>
        <SiteHeader />
        <main style={{ minHeight: "60vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "var(--ink2)" }}>Loading...</span>
        </main>
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <SiteHeader />
        <main style={{ minHeight: "60vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
          <span style={{ color: "var(--ink2)" }}>
            We couldn&apos;t find your listing. Please email <a href="mailto:contact@portservicefinder.com" style={{ color: "var(--acc)" }}>contact@portservicefinder.com</a>.
          </span>
        </main>
        <SiteFooter />
      </>
    );
  }

  const isPending = provider.status === "pending";
  const isActive = provider.status === "active";

  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: 14,
  };

  return (
    <>
    <SiteHeader />
    <main style={{ background: "var(--bg)" }}>
      {/* ACCOUNT BAR */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "10px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600 }}>Provider dashboard</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell providerId={provider.id} />
            <button
              onClick={handleLogout}
              style={{ color: "var(--ink2)", fontSize: 13, border: "1px solid var(--line)", borderRadius: 10, padding: "10px 16px", minHeight: 40, background: "transparent", cursor: "pointer" }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 60px" }}>
        {showWelcome && (
          <div style={{ ...cardStyle, background: "color-mix(in srgb, var(--ok) 10%, transparent)", borderColor: "color-mix(in srgb, var(--ok) 35%, transparent)", padding: "16px 20px", marginBottom: 18 }}>
            <span style={{ color: "var(--ok)", fontWeight: 700, fontSize: 15 }}>Your listing is live</span>
            <p style={{ color: "var(--ink2)", fontSize: 13, marginTop: 4 }}>
              Vessel operators searching your ports can now find and contact you directly. Listing is free during our launch period; we will email you before that changes.
            </p>
          </div>
        )}

        {isPending && (
          <div style={{ ...cardStyle, background: "color-mix(in srgb, var(--acc) 10%, transparent)", borderColor: "color-mix(in srgb, var(--acc) 40%, transparent)", padding: "16px 20px", marginBottom: 18 }}>
            <span style={{ color: "var(--acc)", fontWeight: 700, fontSize: 14 }}>Your listing isn&apos;t published yet</span>
            <p style={{ color: "var(--ink2)", fontSize: 13, marginTop: 4, marginBottom: 12 }}>
              Complete your profile so vessel operators can find you.
            </p>
            <Link
              href="/for-providers/complete-profile"
              style={{ display: "inline-block", background: "var(--acc)", color: "var(--on-acc)", fontWeight: 650, fontSize: 14, padding: "11px 18px", borderRadius: 10, textDecoration: "none" }}
            >
              Complete my listing
            </Link>
          </div>
        )}

        {!isPending && <DashboardShare providerId={provider.id} hideLive={showWelcome} />}

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>{provider.name}</h1>
          <p style={{ color: "var(--ink2)", fontSize: 13 }}>{provider.email}</p>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Search appearances</div>
            <div style={{ color: "var(--ink)", fontSize: 26, fontWeight: 700 }}>{appearances}</div>
            <div style={{ color: "var(--ink3)", fontSize: 12, marginTop: 2 }}>Last 30 days</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Quote requests</div>
            <div style={{ color: "var(--ink)", fontSize: 26, fontWeight: 700 }}>{rfqCount}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "var(--ink3)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Total leads</div>
            <div style={{ color: "var(--ink)", fontSize: 26, fontWeight: 700 }}>{totalLeads}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: "var(--ok)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>This week</div>
            <div style={{ color: "var(--ink)", fontSize: 26, fontWeight: 700 }}>{leadsThisWeek}</div>
          </div>
          <div style={{ ...cardStyle, padding: "18px 16px" }}>
            <div style={{ color: isActive ? "var(--ok)" : "var(--acc)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Status</div>
            <div style={{ color: "var(--ink)", fontSize: 15, fontWeight: 700, marginTop: 4 }}>{isActive ? "Published" : "Pending"}</div>
          </div>
        </div>

        {/* VISIBILITY BY PORT - gercek search_events verisinden */}
        {portBreakdown.length > 0 && (
          <div style={{ ...cardStyle, padding: "22px 20px", marginBottom: 20 }}>
            <h2 style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your visibility this month</h2>
            <p style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 16 }}>
              How many times each of your ports was searched in the last 30 days.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {portBreakdown.map((p) => {
                const maxCount = portBreakdown[0].count;
                const pct = Math.max(8, Math.round((p.count / maxCount) * 100));
                return (
                  <div key={p.port}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--ink)", fontSize: 12.5 }}>{p.port}</span>
                      <span style={{ color: "var(--acc)", fontSize: 12.5, fontWeight: 700 }}>{p.count}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--acc)", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECEIVED RFQs - en yuksek deger, en ustte */}
        <div style={{ ...cardStyle, padding: "22px 20px", marginBottom: 20 }}>
          <h2 style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Quote requests</h2>
          <p style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 16 }}>
            Operators requesting a quote for your port and service appear here with full details. Contact them
            directly.
          </p>

          {rfqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <p style={{ color: "var(--ink2)", fontSize: 13 }}>No quote requests yet. When an operator requests a quote for your port, it shows up here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rfqs.map((r) => (
                <div
                  key={r.distributionId}
                  style={{ background: "var(--bg)", border: r.urgency === "urgent" ? "1px solid color-mix(in srgb, var(--bad) 40%, transparent)" : "1px solid color-mix(in srgb, var(--ink) 8%, transparent)", borderRadius: 10, padding: 14 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span style={{ color: "var(--ink)", fontSize: 13.5, fontWeight: 700 }}>{r.port}, {r.country}</span>
                      {r.urgency === "urgent" && (
                        <span style={{ marginLeft: 8, background: "color-mix(in srgb, var(--bad) 15%, transparent)", color: "var(--bad)", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
                          Urgent
                        </span>
                      )}
                    </div>
                    <span style={{ color: "var(--ink3)", fontSize: 10.5, flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.vesselType && <div style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 3 }}><b style={{ color: "var(--acc)" }}>Vessel:</b> {r.vesselType}</div>}
                  {r.eta && <div style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 3 }}><b style={{ color: "var(--acc)" }}>ETA:</b> {r.eta}</div>}
                  <div style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 10 }}>{r.requirementDetails}</div>
                  <div style={{ borderTop: "1px solid color-mix(in srgb, var(--ink) 8%, transparent)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ color: "var(--ink)", fontSize: 12.5, fontWeight: 700 }}>{r.operatorName}</span>
                    <a href={`mailto:${r.operatorEmail}`} style={{ color: "var(--acc)", fontSize: 12 }}>{r.operatorEmail}</a>
                    {r.operatorPhone && <a href={`tel:${r.operatorPhone}`} style={{ color: "var(--acc)", fontSize: 12 }}>{r.operatorPhone}</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT LEADS */}
        <div id="recent-leads-section" style={{ ...cardStyle, padding: "22px 20px", marginBottom: 20 }}>
          <h2 style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Recent leads</h2>
          <p style={{ color: "var(--ink2)", fontSize: 12, marginBottom: 16 }}>
            Every time a vessel operator taps Call or Email on your listing, it shows up here.
          </p>

          {leads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <p style={{ color: "var(--ink2)", fontSize: 13 }}>No leads yet. Once operators start contacting you, they&apos;ll appear here.</p>
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
                    borderBottom: "1px solid color-mix(in srgb, var(--ink) 6%, transparent)",
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "color-mix(in srgb, var(--acc) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {lead.contact_method === "call" ? CallIcon : EmailIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--ink)", fontSize: 13, fontWeight: 600 }}>
                      Operator {lead.contact_method === "call" ? "called" : "emailed"} you
                    </div>
                    <div style={{ color: "var(--ink2)", fontSize: 11 }}>via PortServiceFinder</div>
                  </div>
                  <div style={{ color: "var(--ink3)", fontSize: 11, flexShrink: 0 }}>{timeAgo(lead.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LISTING INFO */}
        <div style={{ ...cardStyle, padding: "22px 20px" }}>
          <h2 style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Your listing</h2>
          {provider.country && (
            <p style={{ color: "var(--ink2)", fontSize: 13, marginBottom: 6 }}>
              <b style={{ color: "var(--ink)" }}>Country:</b> {provider.country}
            </p>
          )}
          {provider.ports && provider.ports.length > 0 && (
            <p style={{ color: "var(--ink2)", fontSize: 13, marginBottom: 14 }}>
              <b style={{ color: "var(--ink)" }}>Ports:</b> {provider.ports.join(", ")}
            </p>
          )}
          <Link
            href="/for-providers/complete-profile"
            style={{ display: "inline-block", color: "var(--acc)", fontSize: 13, fontWeight: 700, textDecoration: "underline" }}
          >
            Edit my listing
          </Link>
        </div>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
