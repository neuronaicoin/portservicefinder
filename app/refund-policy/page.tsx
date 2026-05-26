import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | PortServiceFinder',
  description: 'PortServiceFinder refund policy for maritime service provider subscriptions. No refunds policy for monthly and annual subscriptions.',
  alternates: { canonical: 'https://www.portservicefinder.com/refund-policy' },
};

export default function RefundPolicyPage() {
  const g = { color: '#c8a84b' } as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <div style={{ background: '#08100a', color: '#f5f0e8', fontFamily: "'Outfit',sans-serif", minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 300, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(8,16,10,.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,168,75,.2)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f5f0e8' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5"/>
            <polygon points="50,15 56,50 50,50" fill="#f5f0e8"/>
            <polygon points="50,15 44,50 50,50" fill="#c8a84b"/>
            <polygon points="50,85 56,50 50,50" fill="#c8a84b"/>
            <polygon points="50,85 44,50 50,50" fill="#f5f0e8"/>
            <polygon points="85,50 50,44 50,50" fill="#c8a84b"/>
            <polygon points="85,50 50,56 50,50" fill="#f5f0e8"/>
            <polygon points="15,50 50,44 50,50" fill="#f5f0e8"/>
            <polygon points="15,50 50,56 50,50" fill="#c8a84b"/>
            <circle cx="50" cy="50" r="3.5" fill="#c8a84b"/>
          </svg>
          <span style={{ fontFamily: lb, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
            PortService<span style={g}>Finder</span>
          </span>
        </Link>
        <Link href="/" style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '7px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
          Back to Home
        </Link>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '120px 24px 80px' }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 14, fontWeight: 700 }}>
          Legal · Policy
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Refund <em style={g}>Policy</em>
        </h1>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#7a8a72', marginBottom: 40, fontWeight: 600 }}>
          Last updated: May 26, 2026
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.85, color: '#d4dcc8' }}>
          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            1. Overview
          </h2>
          <p style={{ marginBottom: 16 }}>
            This Refund Policy applies to all paid subscriptions on PortServiceFinder (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;). By subscribing to PortServiceFinder, you (&quot;the Subscriber&quot;) agree to the terms outlined below.
          </p>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            2. No Refunds Policy
          </h2>
          <p style={{ marginBottom: 16 }}>
            <strong style={g}>All sales are final.</strong> PortServiceFinder operates on a strict <strong>no-refund policy</strong> for all subscription purchases, including both monthly and annual plans.
          </p>
          <p style={{ marginBottom: 16 }}>
            Once a subscription payment is processed, the amount is non-refundable for any reason, including but not limited to:
          </p>
          <ul style={{ marginBottom: 20, paddingLeft: 24, color: '#b0c0a4' }}>
            <li style={{ marginBottom: 8 }}>Change of mind after subscription</li>
            <li style={{ marginBottom: 8 }}>Failure to use the directory listing services</li>
            <li style={{ marginBottom: 8 }}>Insufficient business inquiries received from the listing</li>
            <li style={{ marginBottom: 8 }}>Unused portions of the subscription period</li>
            <li style={{ marginBottom: 8 }}>Mid-cycle cancellation</li>
            <li style={{ marginBottom: 8 }}>Business closure or change of services</li>
          </ul>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            3. Cancellation Rights
          </h2>
          <p style={{ marginBottom: 16 }}>
            Subscribers may <strong>cancel their subscription at any time</strong> through their account dashboard. Upon cancellation:
          </p>
          <ul style={{ marginBottom: 20, paddingLeft: 24, color: '#b0c0a4' }}>
            <li style={{ marginBottom: 8 }}>Your subscription will remain active until the end of the current billing period</li>
            <li style={{ marginBottom: 8 }}>No further charges will be processed</li>
            <li style={{ marginBottom: 8 }}>No partial refund will be issued for the remaining time</li>
            <li style={{ marginBottom: 8 }}>You retain access to all features until subscription expires</li>
          </ul>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            4. Exceptions
          </h2>
          <p style={{ marginBottom: 16 }}>
            Refunds may be considered <strong>only in the following exceptional cases</strong>, at PortServiceFinder&apos;s sole discretion:
          </p>
          <ul style={{ marginBottom: 20, paddingLeft: 24, color: '#b0c0a4' }}>
            <li style={{ marginBottom: 8 }}><strong>Duplicate charges:</strong> If a Subscriber is accidentally charged multiple times for the same subscription period, the duplicate charge will be refunded.</li>
            <li style={{ marginBottom: 8 }}><strong>Technical errors:</strong> If a payment is processed due to a verified technical error on our part (not user error), the amount will be refunded.</li>
            <li style={{ marginBottom: 8 }}><strong>Unauthorized transactions:</strong> If a Subscriber can demonstrate that a transaction was made without their authorization, the matter will be investigated and refunded if confirmed.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            To request a refund under these exceptional cases, contact us within <strong>14 days</strong> of the charge at{' '}
            <a href="mailto:contact@portservicefinder.com" style={{ color: '#c8a84b', textDecoration: 'none' }}>
              contact@portservicefinder.com
            </a>
            {' '}with details and supporting evidence.
          </p>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            5. Chargebacks
          </h2>
          <p style={{ marginBottom: 16 }}>
            Subscribers are required to contact PortServiceFinder before initiating any chargeback with their bank or payment provider. Initiating a chargeback without first contacting us may result in:
          </p>
          <ul style={{ marginBottom: 20, paddingLeft: 24, color: '#b0c0a4' }}>
            <li style={{ marginBottom: 8 }}>Immediate termination of subscription and account suspension</li>
            <li style={{ marginBottom: 8 }}>Loss of access to all PortServiceFinder services</li>
            <li style={{ marginBottom: 8 }}>Removal of business listing from the directory</li>
            <li style={{ marginBottom: 8 }}>Ineligibility for future subscription with PortServiceFinder</li>
          </ul>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            6. Why No Refunds?
          </h2>
          <p style={{ marginBottom: 16 }}>
            PortServiceFinder is a digital service that provides immediate access to our maritime services directory upon subscription. Subscribers gain:
          </p>
          <ul style={{ marginBottom: 20, paddingLeft: 24, color: '#b0c0a4' }}>
            <li style={{ marginBottom: 8 }}>Immediate listing in our directory</li>
            <li style={{ marginBottom: 8 }}>Visibility to vessel operators worldwide</li>
            <li style={{ marginBottom: 8 }}>Access to all platform features</li>
            <li style={{ marginBottom: 8 }}>Use of our verified provider badge</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            Once these services are activated, the value has been delivered. Our no-refund policy allows us to maintain transparent, sustainable pricing without commission fees and to invest continuously in platform improvements that benefit all subscribers.
          </p>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            7. Free Trial
          </h2>
          <p style={{ marginBottom: 16 }}>
            PortServiceFinder does <strong>not offer free trials</strong>. All subscriptions are paid from the first billing cycle. We recommend reviewing our directory, features, and pricing thoroughly before subscribing.
          </p>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            8. Changes to This Policy
          </h2>
          <p style={{ marginBottom: 16 }}>
            We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to this page. The &quot;Last updated&quot; date at the top of this page indicates when changes were made. Continued use of the Platform after changes constitutes acceptance of the updated policy.
          </p>

          <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14, color: '#f5f0e8' }}>
            9. Contact
          </h2>
          <p style={{ marginBottom: 16 }}>
            For any questions about this Refund Policy or to submit a refund request under exceptional cases, please contact us:
          </p>
          <div style={{ padding: '18px 20px', background: 'rgba(200,168,75,.06)', border: '1px solid rgba(200,168,75,.25)', marginBottom: 20 }}>
            <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 8, fontWeight: 700 }}>
              📧 Contact Email
            </div>
            <a href="mailto:contact@portservicefinder.com" style={{ color: '#f5f0e8', fontSize: 14, textDecoration: 'none' }}>
              contact@portservicefinder.com
            </a>
          </div>

          <div style={{ marginTop: 40, padding: '20px 24px', background: 'rgba(200,168,75,.04)', border: '1px solid rgba(200,168,75,.18)' }}>
            <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 10, fontWeight: 700 }}>
              📋 Summary
            </div>
            <p style={{ fontSize: 13, color: '#d4dcc8', lineHeight: 1.7, marginBottom: 0 }}>
              <strong style={g}>No refunds.</strong> All subscription sales are final. You can cancel anytime to stop future billing, but no refunds are issued for past or current billing periods. Exceptions apply only for duplicate charges, technical errors, or unauthorized transactions.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(200,168,75,.15)', padding: '30px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: rj, fontSize: 10, color: '#3a3a2a', letterSpacing: 1, fontWeight: 600 }}>
          © 2026 PortServiceFinder. All rights reserved.
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: '#7a8a72', textDecoration: 'none', fontSize: 11, fontFamily: 'Rajdhani' }}>Terms</Link>
          <Link href="/privacy" style={{ color: '#7a8a72', textDecoration: 'none', fontSize: 11, fontFamily: 'Rajdhani' }}>Privacy</Link>
          <Link href="/refund-policy" style={{ color: '#c8a84b', textDecoration: 'none', fontSize: 11, fontFamily: 'Rajdhani' }}>Refund Policy</Link>
          <Link href="/contact" style={{ color: '#7a8a72', textDecoration: 'none', fontSize: 11, fontFamily: 'Rajdhani' }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
