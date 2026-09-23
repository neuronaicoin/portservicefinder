import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | PortServiceFinder",
  description:
    "PortServiceFinder is free for providers during our launch period. No commission, no hidden fees. See what's included.",
};

const rj = "'Rajdhani',sans-serif";
const lb = "'Libre Baskerville',serif";
const g = { color: "#c8a84b" };

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#08100a", padding: "80px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#c8a84b", marginBottom: 14, fontWeight: 700 }}>
          Pricing
        </div>
        <h1 style={{ fontFamily: lb, fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#f5f0e8", marginBottom: 16 }}>
          Free to List <em style={g}>Right Now</em>
        </h1>
        <p style={{ color: "#d4dcc8", fontSize: 15, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px" }}>
          PortServiceFinder is currently in its launch period. Ship agents, shipchandlers, and marine
          service providers can list their business at no cost — no card required, no commission on any
          inquiry you receive.
        </p>

        <div
          style={{
            background: "linear-gradient(180deg,rgba(76,175,118,.08),transparent)",
            border: "1px solid rgba(76,175,118,.4)",
            borderRadius: 14,
            padding: "36px 28px",
            marginBottom: 32,
          }}
        >
          <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#4caf76", marginBottom: 10, fontWeight: 700 }}>
            Launch Offer
          </div>
          <div style={{ fontFamily: lb, fontSize: 40, fontWeight: 700, color: "#4caf76", marginBottom: 18 }}>
            FREE
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 26, textAlign: "left", maxWidth: 320, margin: "0 auto 26px" }}>
            {[
              "Listed at all your ports",
              "Full company profile — bio, photos, services",
              "Phone, email & WhatsApp visible to operators",
              "Verified provider badge",
              "No commission on any inquiry, ever",
              "Cancel anytime",
            ].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "#d4dcc8", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
                <span style={{ color: "#4caf76", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/for-providers/signup"
            style={{
              display: "inline-block",
              background: "#c8a84b",
              color: "#08100a",
              fontFamily: rj,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "13px 32px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Create Free Account →
          </Link>
        </div>

        <p style={{ color: "#7a8a72", fontSize: 12.5, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
          When the launch period ends, we&apos;ll announce simple, transparent paid plans well in advance —
          and providers who join during the free period will keep a founding-member discount. We&apos;ll
          always email you before anything changes on your account.
        </p>

        <p style={{ marginTop: 40, fontSize: 13 }}>
          <Link href="/for-providers" style={{ color: "#c8a84b", textDecoration: "underline" }}>
            ← Back to For Providers
          </Link>
        </p>
      </div>
    </main>
  );
}
