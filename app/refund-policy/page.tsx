import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Refund rules for PortServiceFinder provider subscriptions after the launch period: cancellation, duplicate or mistaken charges, chargebacks and how to ask.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <>
      <style>{`
        .legal{max-width:820px;margin:0 auto;padding:40px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .legal .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .legal h1{font-size:clamp(28px,6vw,40px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 8px}
        .legal .meta{font-size:14px;color:var(--ink3);margin:0 0 28px}
        .legal h2{font-size:20px;font-weight:700;color:var(--ink);margin:36px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line);line-height:1.3}
        .legal p{color:var(--ink2);line-height:1.75;margin:0 0 14px;font-size:15px}
        .legal ul{padding-left:20px;margin:0 0 14px}
        .legal li{color:var(--ink2);line-height:1.7;font-size:15px;margin-bottom:6px}
        .legal strong{color:var(--ink);font-weight:600}
        .legal a{color:var(--acc);text-underline-offset:2px;overflow-wrap:anywhere}
        .legal .box{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:10px;padding:14px 16px;margin:16px 0}
        .legal .box p:last-child{margin:0}
      `}</style>
      <SiteHeader />
      <main className="legal">
        <p className="eyebrow">Legal</p>
        <h1>Refund Policy</h1>
        <p className="meta">Last updated: October 26, 2026</p>

        <div className="box">
          <p>
            <strong>In short:</strong> listing is free during our launch period, so there is nothing to refund while it lasts. After the
            launch period, listings will cost $49.90/month or $499.90/year. This policy covers those paid subscriptions.
          </p>
        </div>

        <h2>1. Scope</h2>
        <p>
          This Refund Policy applies to paid provider subscriptions on PortServiceFinder (&quot;we&quot;, &quot;us&quot;) taken out after
          the launch period ends. Searching the directory is always free for vessel operators, and free launch-period listings involve no
          payment. By starting a paid subscription you (&quot;the Subscriber&quot;) agree to the terms below.
        </p>

        <h2>2. Payments are generally non-refundable</h2>
        <p>Once a subscription payment has been processed, it is generally not refunded, including in these cases:</p>
        <ul>
          <li>You change your mind after subscribing</li>
          <li>You do not use your listing</li>
          <li>You receive fewer inquiries than you expected</li>
          <li>Unused time left in a billing period, including when you cancel mid-period</li>
          <li>Your business closes or changes its services</li>
        </ul>
        <p>
          Because listings are free during the launch period, you can see how your listing performs before you decide to pay for anything.
        </p>

        <h2>3. Cancelling</h2>
        <p>You can cancel a paid subscription at any time from your account or by emailing us. When you cancel:</p>
        <ul>
          <li>Your subscription stays active until the end of the current billing period</li>
          <li>No further charges are made</li>
          <li>No partial refund is issued for the remaining time</li>
          <li>Your listing stays visible until the subscription ends</li>
        </ul>

        <h2>4. When we do refund</h2>
        <p>We refund a payment in these cases:</p>
        <ul>
          <li>
            <strong>Duplicate charges:</strong> if you are charged more than once for the same billing period, we refund the duplicate.
          </li>
          <li>
            <strong>Our technical errors:</strong> if a payment was taken because of a confirmed error on our side, we refund it.
          </li>
          <li>
            <strong>Unauthorised transactions:</strong> if you show that a payment was made without your authorisation, we investigate and
            refund it if confirmed.
          </li>
          <li>
            <strong>Listings removed during review:</strong> if we remove a newly paid listing because it did not pass our review, we refund
            that payment.
          </li>
        </ul>
        <p>
          To ask for a refund, email <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> within{' '}
          <strong>14 days</strong> of the charge, with the details and any supporting evidence. Nothing in this policy limits rights you
          have under applicable law.
        </p>

        <h2>5. Chargebacks</h2>
        <p>Please contact us before starting a chargeback with your bank or card provider. A chargeback started without contacting us first may lead to:</p>
        <ul>
          <li>Suspension of your account and subscription</li>
          <li>Removal of your listing from the directory</li>
          <li>Refusal of future subscriptions</li>
        </ul>

        <h2>6. Launch period</h2>
        <p>
          While the launch period lasts, listings are free and no payment details are collected. We will email every listed provider before
          the launch period ends. You are never moved to a paid plan without choosing one. See our{' '}
          <Link href="/pricing">pricing page</Link> for the current position.
        </p>

        <h2>7. Changes to this policy</h2>
        <p>
          We may update this Refund Policy. The &quot;Last updated&quot; date above shows when it last changed, and we will email
          subscribers about material changes before they apply to a paid period.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about this policy or a refund request: <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.
          PortServiceFinder, London, England, United Kingdom.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
