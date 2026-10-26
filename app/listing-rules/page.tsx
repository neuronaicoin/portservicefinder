import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Listing Rules for Providers',
  description: 'The standards every ship agent, shipchandler and marine service company must meet to list on PortServiceFinder: accuracy, ports served, conduct and removals.',
  alternates: { canonical: '/listing-rules' },
};

export default function ListingRules() {
  return (
    <>
      <style>{`
        .legal{max-width:820px;margin:0 auto;padding:40px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .legal .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .legal h1{font-size:clamp(28px,6vw,40px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 8px}
        .legal .meta{font-size:14px;color:var(--ink3);margin:0 0 28px}
        .legal-content h2{font-size:20px;font-weight:700;color:var(--ink);margin:36px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line);scroll-margin-top:84px;line-height:1.3}
        .legal-content h3{font-size:16px;font-weight:650;color:var(--ink);margin:22px 0 8px}
        .legal-content p{color:var(--ink2);line-height:1.75;margin:0 0 14px;font-size:15px}
        .legal-content ul{padding-left:20px;margin:0 0 14px}
        .legal-content li{color:var(--ink2);line-height:1.7;font-size:15px;margin-bottom:6px}
        .legal-content strong{color:var(--ink);font-weight:600}
        .legal-content a{color:var(--acc);text-underline-offset:2px;overflow-wrap:anywhere}
        .legal-content .toc{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin:20px 0}
        .legal-content .toc-title{font-size:13px;font-weight:600;color:var(--ink3);margin-bottom:6px}
        .legal-content .toc a{display:block;padding:6px 0;text-decoration:none;font-size:14.5px}
        .legal-content .summary-box,.legal-content .warning-box,.legal-content .success-box{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:10px;padding:14px 16px;margin:16px 0;font-size:14.5px;color:var(--ink2);line-height:1.7}
        .legal-content .warning-box{border-left-color:var(--warn)}
        .legal-content .success-box{border-left-color:var(--ok)}
        .legal-content .contact-box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin:16px 0;font-size:15px;line-height:1.8;color:var(--ink2)}
        .legal-content .contact-box strong{display:block}
      `}</style>
      <SiteHeader />
      <main className="legal">
        <p className="eyebrow">For providers</p>
        <h1>Listing Rules</h1>
        <p className="meta">Standards for ship agents, shipchandlers and marine service companies listed on PortServiceFinder. Last updated: October 26, 2026.</p>
        <div className="legal-content">

            <div className="summary-box">
              These Listing Rules set out the standards every service provider on PortServiceFinder must follow. They protect both vessel operators searching for services and the reputation of legitimate providers on our platform.
            </div>

            <p>By listing your business on PortServiceFinder, you agree to abide by these rules in addition to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>. Breaking them may lead to suspension or removal of your listing.</p>

            <h2>1. Who Can List</h2>

            <p>PortServiceFinder accepts listings from three categories of maritime service providers:</p>

            <h3>Ship agents</h3>
            <p>Licensed port agency companies providing husbandry services, customs clearance, crew change coordination, bunker arrangement, and vessel call management. You must be a legally registered agency in the jurisdiction(s) where you operate.</p>

            <h3>Shipchandlers</h3>
            <p>Established suppliers providing provisions (fresh, frozen, bonded), deck stores, engine stores, cabin stores, and technical supplies to vessels. You must have a physical presence or warehouse facility at the port(s) you serve.</p>

            <h3>Marine service providers</h3>
            <p>Specialized technical service companies covering one or more of our 34 service categories, including engine repair, electrical, underwater diving, hull cleaning, welding, refrigeration, navigation systems, BWTS, surveys, and more. You must hold all necessary certifications, class approvals, and licenses required for the services you offer.</p>

            <h2>2. Accuracy Standards</h2>

            <div className="success-box">
              <strong>The basic rule:</strong> every claim in your listing must be true, current and verifiable. We review listings and may ask you for evidence at any time.
            </div>

            <h3>Required Accurate Information</h3>
            <ul className="do">
              <li><strong>Company name</strong> must match your legal business registration.</li>
              <li><strong>Contact details</strong> (phone, email, WhatsApp) must be active and monitored business lines.</li>
              <li><strong>Physical address</strong> must be a real operational location, not a mailbox.</li>
              <li><strong>Ports served</strong> must be ports where you actually operate or maintain personnel.</li>
              <li><strong>Service categories</strong> must match services you currently provide.</li>
              <li><strong>Certifications and class approvals</strong> claimed must be current and verifiable.</li>
              <li><strong>Years of operation, fleet experience, accreditations</strong> must be factual.</li>
            </ul>

            <h2>3. Port Listing Rules</h2>

            <p>You may list your business at <strong>every port where you genuinely operate</strong>, up to 10 ports per listing. There is no per-port fee. If you serve more ports, contact us.</p>

            <h3>What Counts as &ldquo;Operating&rdquo; at a Port</h3>
            <ul className="do">
              <li>You maintain personnel, an office, or sub-contracted permanent representatives at the port.</li>
              <li>You regularly handle vessel calls, deliveries, or service jobs at the port (minimum activity within the last 12 months).</li>
              <li>You hold the necessary local licenses, permits, or partnerships required to operate at the port.</li>
              <li>You can respond to inquiries and deliver service at that port within a reasonable time (typically 24 to 48 hours).</li>
            </ul>

            <h3>Prohibited Port Listings</h3>
            <ul className="dont">
              <li>Listing at ports where you have no actual operational capability.</li>
              <li>Listing ports based on aspirational future expansion plans.</li>
              <li>Listing ports where you can only sub-contract without disclosure.</li>
              <li>Mass-listing across many ports to artificially increase visibility.</li>
            </ul>

            <div className="warning-box">
              <strong>What happens if a port claim is false:</strong> If a vessel operator reports a no-response or unable-to-deliver situation at a listed port, we will investigate. Confirmed violations result in immediate removal of that port from your listing. Repeated violations lead to removal of the whole listing; fees already paid are not refunded.
            </div>

            <h2>4. Pricing and One Listing Per Business</h2>

            <p>Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year. We will email listed providers before any paid plan starts.</p>

            <div className="warning-box">
              <strong>One listing per business:</strong> creating several accounts for the same underlying business (using different company names, email addresses or owners) may lead to:
              <ul style={{margin:'8px 0 0'}}>
                <li>Suspension of the duplicate accounts</li>
                <li>Removal of the listings involved</li>
                <li>A permanent ban for repeated abuse</li>
              </ul>
            </div>

            <h2>5. Review Process</h2>

            <p>Your listing goes live as soon as your profile is complete. We then review new listings, which may include:</p>
            <ul>
              <li>Confirmation that contact details match your public business information.</li>
              <li>Brief phone or email verification of operational capability at listed ports.</li>
              <li>Review of certifications and class approvals (for technical service providers).</li>
              <li>Cross-check against publicly available business registries.</li>
            </ul>
            <p>If a listing fails review, we may edit it, ask for more information, or remove it. If you paid for a listing that we remove at this stage, we refund that payment.</p>

            <h2>6. Prohibited Content</h2>

            <p>The following content and behavior are strictly prohibited in listings:</p>
            <ul className="dont">
              <li>False, exaggerated, or misleading claims about services, experience, or capabilities.</li>
              <li>Unverifiable certifications, awards, or accreditations.</li>
              <li>Fake reviews, fabricated client testimonials, or invented case studies.</li>
              <li>Logos, trademarks, or brand names you do not have rights to use.</li>
              <li>Pornographic, offensive, or unlawful content of any kind.</li>
              <li>Political, religious, or discriminatory messaging.</li>
              <li>Links to external sites that compete directly with PortServiceFinder.</li>
              <li>Contact information for unrelated third parties without authorization.</li>
              <li>Auto-redirecting URLs, phishing links, or malware.</li>
              <li>Spam, repetitive content, or keyword stuffing.</li>
            </ul>

            <h2>7. Communication Standards</h2>

            <p>When vessel operators contact you through your listed details, you agree to:</p>
            <ul className="do">
              <li>Respond within a reasonable business timeframe (typically 24 to 48 hours).</li>
              <li>Provide accurate information about your services, pricing, and availability.</li>
              <li>Honor any quotes or commitments you make in writing.</li>
              <li>Treat all inquiries professionally and confidentially.</li>
              <li>Refer the inquiry to another provider if you cannot fulfill the request.</li>
            </ul>

            <h2>8. Quality of Service</h2>

            <p>While we do not police every transaction, providers who repeatedly receive complaints about service quality, no-shows, billing disputes, or unprofessional conduct may have their listings suspended or removed.</p>

            <p>We may, at our discretion:</p>
            <ul>
              <li>Investigate complaints submitted by vessel operators or other users.</li>
              <li>Request explanations or evidence regarding disputed situations.</li>
              <li>Suspend listings pending investigation.</li>
              <li>Remove listings permanently in cases of confirmed fraudulent or harmful conduct.</li>
            </ul>

            <h2>9. Verified Provider Badge</h2>

            <p>Listings that pass our checks display a <strong>Verified</strong> badge. This signals to vessel operators that we have confirmed:</p>
            <ul>
              <li>Your business is a real, operational entity.</li>
              <li>Contact details are active and monitored.</li>
              <li>Listed ports are actually served.</li>
              <li>Service categories match your claimed capabilities.</li>
            </ul>
            <p>The badge does <strong>not</strong> constitute an endorsement of service quality or a guarantee of performance. Vessel operators are responsible for their own due diligence before engaging any provider.</p>

            <h2>10. Updating Your Listing</h2>

            <p>You are responsible for keeping your listing accurate, including:</p>
            <ul>
              <li>Contact information (phone, email, WhatsApp)</li>
              <li>Company name or registration</li>
              <li>Ports served</li>
              <li>Service categories offered</li>
              <li>Certifications or accreditations</li>
            </ul>
            <p>You can update most details from your provider dashboard; for anything else, email <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. Significant changes may be reviewed again.</p>

            <h2>11. Promotional Conduct</h2>

            <p>Outside of your listing on PortServiceFinder, you may not:</p>
            <ul className="dont">
              <li>Misrepresent your status on the platform (for example, claiming &ldquo;exclusive partner&rdquo; status when you simply have a listing).</li>
              <li>Use PortServiceFinder branding, logos, or trademarks beyond what is provided in your official subscriber materials.</li>
              <li>Promise vessel operators benefits, discounts, or services on behalf of PortServiceFinder.</li>
              <li>Use the platform&apos;s name or directory to harvest contact details for unrelated marketing campaigns.</li>
            </ul>

            <h2>12. Cancellation and Termination</h2>

            <p>You can remove your listing at any time by emailing <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>; we remove it within 24 hours. If you have a paid subscription, cancelling stops the next renewal.</p>

            <p>We may terminate your listing for any of the following:</p>
            <ul>
              <li>Material violation of these Listing Rules</li>
              <li>Material violation of our <Link href="/terms">Terms of Service</Link></li>
              <li>Repeated complaints from users that we are unable to resolve</li>
              <li>Fraudulent claims or attempts to manipulate the platform</li>
              <li>Non-payment of subscription fees (after the launch period) once any grace period has passed</li>
              <li>Court order, regulatory action, or legal requirement</li>
            </ul>

            <p>If we remove a listing for a violation, fees already paid are not refunded.</p>

            <h2>13. Reporting Violations</h2>

            <p>If you find a listing that appears to break these rules (false claims, impersonation, services not delivered or anything else), please report it to us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> with as much detail as possible.</p>

            <p>We investigate all reports confidentially. The reporting party&apos;s identity is not shared with the reported provider without consent.</p>

            <h2>14. Changes to These Rules</h2>

            <p>We may update these Listing Rules from time to time to reflect changes in our platform, industry standards, or legal requirements. Material changes will be communicated to active subscribers via email. The latest version is always available at this page.</p>

            <h2>15. Questions and Contact</h2>

            <p>For any questions about these rules, your listing, or to report a concern:</p>

            <div className="contact-box">
              <strong>PortServiceFinder</strong>
              London, England, United Kingdom<br/>
              <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>
            </div>

            <div className="summary-box">
              Following these rules keeps the directory useful for the operators who search it and fair for the providers who list in it.
            </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
