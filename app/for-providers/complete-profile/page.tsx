"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PORT_DATA, MARINE_SERVICES } from "@/lib/port-data";

const MAX_PORTS = 10;
const countries = Object.keys(PORT_DATA).sort();

// Hesap oluşturulduktan (signup) hemen sonra provider'ın yönlendirildiği
// sayfa — geri kalan iş bilgilerini (ülke, limanlar, servisler, iletişim)
// burada tamamlar. Tamamlanınca status 'incomplete' -> 'active' olur ve
// listede görünür hale gelir.
export default function CompleteProfilePage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [providerType, setProviderType] = useState<string | null>(null);

  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [ports, setPorts] = useState<string[]>([]);
  const [svc, setSvc] = useState<Set<string>>(new Set());
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [portWarning, setPortWarning] = useState("");

  const availablePorts = country ? PORT_DATA[country] || [] : [];

  useEffect(() => {
    async function loadExisting() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        router.push("/for-providers/login");
        return;
      }
      const { data } = await supabaseBrowser
        .from("providers")
        .select("type, country, ports, svc, phone, whatsapp, website, address, contact_person, bio")
        .eq("auth_user_id", userData.user.id)
        .single();

      if (data) {
        setProviderType(data.type ?? null);
        setBio(data.bio ?? "");
        setCountry(data.country ?? "");
        setPorts(data.ports ?? []);
        setSvc(new Set(data.svc ?? []));
        setPhone(data.phone ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setWebsite(data.website ?? "");
        setAddress(data.address ?? "");
        setContactPerson(data.contact_person ?? "");
      }
      setLoadingUser(false);
    }
    loadExisting();
  }, [router]);

  function togglePort(p: string) {
    setPortWarning("");
    if (ports.includes(p)) {
      setPorts(ports.filter((x) => x !== p));
    } else {
      if (ports.length >= MAX_PORTS) {
        setPortWarning(`You can select up to ${MAX_PORTS} ports. Remove one to add another.`);
        return;
      }
      setPorts([...ports, p]);
    }
  }

  function toggleSvc(key: string) {
    const next = new Set(svc);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSvc(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!country || ports.length === 0 || !phone || !contactPerson) {
      setError("Please fill in country, at least one port, phone, and contact person.");
      return;
    }
    if (providerType === "service" && svc.size === 0) {
      setError("Please select at least one service you offer.");
      return;
    }

    setSaving(true);

    const { data: userData } = await supabaseBrowser.auth.getUser();
    if (!userData.user) {
      router.push("/for-providers/login");
      return;
    }

    const { error: updateError } = await supabaseBrowser
      .from("providers")
      .update({
        bio,
        country,
        ports,
        svc: providerType === "service" ? Array.from(svc) : [providerType],
        phone,
        whatsapp: whatsapp || phone,
        website,
        address,
        contact_person: contactPerson,
        status: "active", // profil tamamlandi, listede gorunur
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("auth_user_id", userData.user.id);

    if (updateError) {
      setError(updateError.message || "Could not save your profile. Please try again.");
      setSaving(false);
      return;
    }

    // "Your listing is live" email with the share buttons (sent once; never blocks the redirect)
    try {
      const { data: sess } = await supabaseBrowser.auth.getSession();
      const token = sess.session?.access_token;
      if (token) {
        await Promise.race([
          fetch("/api/provider/share-email", { method: "POST", headers: { Authorization: `Bearer ${token}` }, keepalive: true }),
          new Promise((ok) => setTimeout(ok, 4000)),
        ]);
      }
    } catch {}

    router.push("/for-providers/dashboard?welcome=1");
  }

  if (loadingUser) {
    return (
      <>
        <SiteHeader />
        <main className="flex items-center justify-center" style={{ background: "var(--bg)", minHeight: "60vh" }}>
          <span style={{ color: "var(--ink2)" }}>Loading...</span>
        </main>
      </>
    );
  }

  return (
    <>
    <SiteHeader />
    <main className="px-4 py-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto">

        <h1 style={{ color: "var(--ink)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Complete your listing
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: 14, marginBottom: 28 }}>
          This is what vessel operators will see on your port pages and your company page. Fields marked * are required.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8 space-y-5"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div>
            <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              About your company
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Briefly describe your services, experience, and what makes you reliable."
              rows={3}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Country *
            </label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPorts([]); }}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            >
              <option value="">Select country</option>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {country && (
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Ports you operate at * (max {MAX_PORTS}, {ports.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePorts.map((p) => {
                  const selected = ports.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePort(p)}
                      style={{
                        padding: "8px 12px",
                        minHeight: 40,
                        borderRadius: 999,
                        fontSize: 12.5,
                        border: selected ? "1px solid var(--acc)" : "1px solid color-mix(in srgb, var(--ink) 15%, transparent)",
                        background: selected ? "color-mix(in srgb, var(--acc) 15%, transparent)" : "transparent",
                        color: selected ? "var(--acc)" : "var(--ink2)",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              {portWarning && <p style={{ color: "var(--bad)", fontSize: 12, marginTop: 8 }}>{portWarning}</p>}
            </div>
          )}

          {providerType === "service" && (
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Services you offer *
              </label>
              <div className="flex flex-wrap gap-2">
                {MARINE_SERVICES.map((s) => {
                  const selected = svc.has(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => toggleSvc(s.key)}
                      style={{
                        padding: "8px 12px",
                        minHeight: 40,
                        borderRadius: 999,
                        fontSize: 12.5,
                        border: selected ? "1px solid var(--acc)" : "1px solid color-mix(in srgb, var(--ink) 15%, transparent)",
                        background: selected ? "color-mix(in srgb, var(--acc) 15%, transparent)" : "transparent",
                        color: selected ? "var(--acc)" : "var(--ink2)",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Contact person *
              </label>
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Phone *
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                WhatsApp (if different)
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Website
              </label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "var(--ink2)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <div className="rounded-lg p-3" style={{ background: "color-mix(in srgb, var(--bad) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--bad) 30%, transparent)" }}>
              <span style={{ color: "var(--bad)", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg"
            style={{
              background: "var(--acc)",
              color: "var(--on-acc)",
              fontWeight: 700,
              fontSize: 14,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Publishing..." : "Publish my listing"}
          </button>
        </form>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
