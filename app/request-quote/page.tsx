"use client";

import Link from "next/link";
import { useState } from "react";
import { submitRfq } from "@/lib/rfq";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PORT_DATA, MARINE_SERVICES } from "@/lib/port-data";

const countries = Object.keys(PORT_DATA).sort();

export default function RequestQuotePage() {
  const [country, setCountry] = useState("");
  const [port, setPort] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [eta, setEta] = useState("");
  const [requirementDetails, setRequirementDetails] = useState("");
  const [urgency, setUrgency] = useState<"standard" | "urgent">("standard");
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [operatorPhone, setOperatorPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ distributedCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availablePorts = country ? PORT_DATA[country] || [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!country || !port || !serviceType || !requirementDetails || !operatorName || !operatorEmail) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const res = await submitRfq({
      country,
      port,
      serviceType,
      vesselType,
      eta,
      requirementDetails,
      urgency,
      operatorName,
      operatorEmail,
      operatorPhone,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError("Something went wrong submitting your request. Please try again.");
      return;
    }
    setResult({ distributedCount: res.distributedCount });
  }

  const css = `
    .rq{max-width:600px;margin:0 auto;padding:40px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
    .rq .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
    .rq h1{font-size:clamp(28px,6vw,38px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 10px}
    .rq .lede{font-size:16px;line-height:1.65;color:var(--ink2);margin:0 0 24px}
    .rq form{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px}
    .rq .row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
    .rq .field{margin-bottom:14px}
    .rq .row .field{margin-bottom:0}
    .rq label{display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px}
    .rq input,.rq select,.rq textarea{width:100%;box-sizing:border-box;min-height:44px;padding:10px 12px;border-radius:10px;background:var(--bg);border:1px solid var(--line);color:var(--ink);font-size:15px;font-family:var(--font-ui)}
    .rq input:focus,.rq select:focus,.rq textarea:focus{outline:none;border-color:var(--acc)}
    .rq .seg{display:flex;gap:8px}
    .rq .seg button{flex:1;min-height:44px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font-ui)}
    .rq .sep{border-top:1px solid var(--line);padding-top:16px;margin-top:4px}
    .rq .hint{font-size:13px;color:var(--ink3);margin:0 0 12px}
    .rq .err{background:color-mix(in srgb, var(--bad) 10%, transparent);border:1px solid color-mix(in srgb, var(--bad) 30%, transparent);border-radius:10px;padding:10px 12px;margin-bottom:14px;color:var(--bad);font-size:14px}
    .rq .submit{width:100%;min-height:48px;border-radius:10px;border:none;background:var(--acc);color:var(--on-acc);font-weight:650;font-size:15px;font-family:var(--font-ui)}
    .rq .submit:hover{background:var(--acc-h)}
    .rq .done{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:26px;text-align:center}
    .rq .done p{color:var(--ink2);font-size:15px;line-height:1.7;margin:0}
    .rq .done a{color:var(--acc)}
    @media (max-width:480px){.rq .row{grid-template-columns:1fr}}
  `;

  if (result) {
    return (
      <>
        <style>{css}</style>
        <SiteHeader />
        <main className="rq">
          <div className="done" role="status">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 10 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M7.5 12.5l3 3 6-6.5" />
            </svg>
            <h1>Request sent</h1>
            {result.distributedCount > 0 ? (
              <p>
                Your request went to <b style={{ color: "var(--ink)" }}>{result.distributedCount}</b>{" "}
                {result.distributedCount === 1 ? "provider" : "providers"} listed for that port and service. They will contact you
                directly by email or phone.
              </p>
            ) : (
              <p>
                No listed provider matches that exact port and service yet. We have logged your request; in the meantime you can{" "}
                <Link href="/ports">browse providers by port</Link>.
              </p>
            )}
            <p style={{ marginTop: 18 }}>
              <Link href="/">Back to the homepage</Link>
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <SiteHeader />
      <main className="rq">
        <p className="eyebrow">For vessel operators</p>
        <h1>Request a quote</h1>
        <p className="lede">
          Send one request and it goes to the providers listed for your port and service. No sign-up needed; they contact you directly.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="rq-country">Country *</label>
              <select id="rq-country" value={country} onChange={(e) => { setCountry(e.target.value); setPort(""); }}>
                <option value="">Select</option>
                {countries.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="rq-port">Port *</label>
              <select id="rq-port" value={port} onChange={(e) => setPort(e.target.value)} disabled={!country}>
                <option value="">Select</option>
                {availablePorts.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="rq-service">Service needed *</label>
            <select id="rq-service" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="">Select a service</option>
              <option value="agent">Ship agency</option>
              <option value="chandler">Shipchandler</option>
              {MARINE_SERVICES.map((s: any) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="rq-vessel">Vessel type</label>
              <input id="rq-vessel" value={vesselType} onChange={(e) => setVesselType(e.target.value)} placeholder="e.g. Bulk carrier" />
            </div>
            <div className="field">
              <label htmlFor="rq-eta">ETA</label>
              <input id="rq-eta" type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="rq-details">Requirement details *</label>
            <textarea
              id="rq-details"
              value={requirementDetails}
              onChange={(e) => setRequirementDetails(e.target.value)}
              placeholder="What you need, e.g. husbandry and crew change, 2 crew signing off"
              rows={3}
            />
          </div>

          <div className="field">
            <label>Urgency</label>
            <div className="seg">
              {(["standard", "urgent"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  aria-pressed={urgency === u}
                  style={{
                    border: urgency === u ? "1.5px solid var(--acc)" : "1px solid var(--line)",
                    background: urgency === u ? "color-mix(in srgb, var(--acc) 12%, transparent)" : "var(--bg)",
                    color: urgency === u ? "var(--ink)" : "var(--ink2)",
                  }}
                >
                  {u === "urgent" ? "Urgent" : "Standard"}
                </button>
              ))}
            </div>
          </div>

          <div className="sep">
            <p className="hint">Your contact details, so providers can reach you</p>
            <div className="row">
              <div className="field">
                <label htmlFor="rq-name">Name or company *</label>
                <input id="rq-name" autoComplete="organization" value={operatorName} onChange={(e) => setOperatorName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="rq-email">Email *</label>
                <input id="rq-email" type="email" autoComplete="email" value={operatorEmail} onChange={(e) => setOperatorEmail(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="rq-phone">Phone or WhatsApp (optional)</label>
              <input id="rq-phone" type="tel" autoComplete="tel" value={operatorPhone} onChange={(e) => setOperatorPhone(e.target.value)} />
            </div>
          </div>

          {error && <div className="err" role="alert">{error}</div>}

          <button type="submit" className="submit" disabled={submitting} style={{ cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Sending..." : "Send request"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
