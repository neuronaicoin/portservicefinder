"use client";

import Link from "next/link";
import { useState } from "react";
import { submitRfq } from "@/lib/rfq";
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

  if (result) {
    return (
      <main style={{ minHeight: "100vh", background: "#08100a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h1 style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Request sent</h1>
          {result.distributedCount > 0 ? (
            <p style={{ color: "#d4dcc8", fontSize: 14, lineHeight: 1.7 }}>
              Your request was sent to <b style={{ color: "#c8a84b" }}>{result.distributedCount}</b> verified{" "}
              {result.distributedCount === 1 ? "provider" : "providers"} matching your port and service. They&apos;ll
              contact you directly at the email or phone you provided.
            </p>
          ) : (
            <p style={{ color: "#d4dcc8", fontSize: 14, lineHeight: 1.7 }}>
              We don&apos;t have a verified provider matching that exact port and service yet. Your request has
              been logged — in the meantime, try{" "}
              <Link href="/ports" style={{ color: "#c8a84b" }}>browsing providers directly</Link>.
            </p>
          )}
          <Link href="/" style={{ display: "inline-block", marginTop: 24, color: "#c8a84b", fontSize: 13, fontWeight: 700, textDecoration: "underline" }}>
            ← Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#08100a", padding: "40px 16px 60px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#c8a84b", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          ← PortServiceFinder
        </Link>

        <div style={{ textAlign: "center", margin: "24px 0 28px" }}>
          <h1 style={{ color: "#f5f0e8", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Request a Quote</h1>
          <p style={{ color: "#d4dcc8", fontSize: 14, lineHeight: 1.6 }}>
            Send one request. It goes directly to verified providers matching your port and service — no signup
            needed, they&apos;ll contact you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: "#111c13", border: "1px solid rgba(200,168,75,.15)", borderRadius: 14, padding: 24 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPort(""); }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              >
                <option value="">Select</option>
                {countries.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                Port *
              </label>
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                disabled={!country}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              >
                <option value="">Select</option>
                {availablePorts.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Service Needed *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
            >
              <option value="">Select a service</option>
              <option value="agent">Ship Agency</option>
              <option value="chandler">Shipchandler</option>
              {MARINE_SERVICES.map((s: any) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                Vessel Type
              </label>
              <input
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value)}
                placeholder="e.g. Bulk Carrier"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                ETA
              </label>
              <input
                type="date"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Requirement Details *
            </label>
            <textarea
              value={requirementDetails}
              onChange={(e) => setRequirementDetails(e.target.value)}
              placeholder="Describe what you need — e.g. husbandry + crew change, 2 crew signing off"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", color: "#c8a84b", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Urgency
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["standard", "urgent"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  style={{
                    flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, textTransform: "capitalize",
                    border: urgency === u ? "1.5px solid #c8a84b" : "1px solid rgba(255,255,255,.12)",
                    background: urgency === u ? "rgba(200,168,75,.15)" : "transparent",
                    color: urgency === u ? "#c8a84b" : "#d4dcc8",
                  }}
                >
                  {u === "urgent" ? "⚡ Urgent" : u}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 16, marginBottom: 14 }}>
            <div style={{ color: "#7a8a72", fontSize: 11, marginBottom: 12 }}>Your contact details (so providers can reach you)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <input
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Your name / company *"
                style={{ padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              />
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                placeholder="Email *"
                style={{ padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
              />
            </div>
            <input
              value={operatorPhone}
              onChange={(e) => setOperatorPhone(e.target.value)}
              placeholder="Phone / WhatsApp (optional)"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#08100a", border: "1px solid rgba(255,255,255,.12)", color: "#f5f0e8", fontSize: 13 }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(224,85,85,.1)", border: "1px solid rgba(224,85,85,.3)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
              <span style={{ color: "#e88", fontSize: 12.5 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: "#c8a84b", color: "#08100a", fontWeight: 700, fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Sending..." : "Send Request →"}
          </button>
        </form>
      </div>
    </main>
  );
}
