import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Terms of Service for Operators and Providers',
  description: 'Terms for using PortServiceFinder: free search for vessel operators, provider listings, launch-period pricing, cancellation and the law of England and Wales.',
  alternates: { canonical: '/terms' },
};

export default function TermsOfService() {
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
        <p className="eyebrow">Legal</p>
        <h1>Terms of Service</h1>
        <p className="meta">Last updated: October 26, 2026</p>
        <div className="legal-content">

            <div className="summary-box">
              <strong>Welcome to PortServiceFinder.</strong> These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of PortServiceFinder&apos;s website, services, and applications (the &ldquo;Services&rdquo;). By accessing or using the Services, you agree to be bound by these Terms.
            </div>

            <p>These Terms of Service constitute a legally binding agreement made between you (whether personally or on behalf of an entity) and <strong>PortServiceFinder</strong> (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, or &ldquo;<strong>our</strong>&rdquo;), concerning your access to and use of the website at <a href="https://www.portservicefinder.com">https://www.portservicefinder.com</a> as well as any other related media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the &ldquo;Services&rdquo;).</p>

            <p>You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></p>

            <div className="toc">
              <div className="toc-title">Contents</div>
              <a href="#section1">1. Our Services</a>
              <a href="#section2">2. Intellectual Property Rights</a>
              <a href="#section3">3. User Representations</a>
              <a href="#section4">4. User Registration</a>
              <a href="#section5">5. Subscriptions and Payments</a>
              <a href="#section6">6. Launch Period</a>
              <a href="#section7">7. Cancellation</a>
              <a href="#section8">8. Prohibited Activities</a>
              <a href="#section9">9. User-Generated Contributions</a>
              <a href="#section10">10. Contribution License</a>
              <a href="#section11">11. Provider Listings</a>
              <a href="#section12">12. No Commission Policy</a>
              <a href="#section13">13. Third-Party Websites and Content</a>
              <a href="#section14">14. Services Management</a>
              <a href="#section15">15. Privacy Policy</a>
              <a href="#section16">16. Term and Termination</a>
              <a href="#section17">17. Modifications and Interruptions</a>
              <a href="#section18">18. Governing Law</a>
              <a href="#section19">19. Dispute Resolution</a>
              <a href="#section20">20. Disclaimer</a>
              <a href="#section21">21. Limitations of Liability</a>
              <a href="#section22">22. Indemnification</a>
              <a href="#section23">23. Contact Us</a>
            </div>

            <h2 id="section1">1. Our Services</h2>
            <p>PortServiceFinder is a global maritime services directory that connects vessel operators with verified ship agents, shipchandlers, and marine service providers at ports worldwide. We provide an online platform where:</p>
            <ul>
              <li>Vessel operators, captains, charterers, and maritime professionals can search and discover service providers free of charge.</li>
              <li>Maritime service providers can list their businesses (free during our launch period, then by paid subscription).</li>
            </ul>
            <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation.</p>

            <h2 id="section2">2. Intellectual Property Rights</h2>
            <p>Unless otherwise indicated, the Services are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Services (collectively, the &ldquo;Content&rdquo;) and the trademarks, service marks, and logos contained therein (the &ldquo;Marks&rdquo;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
            <p>The Content and the Marks are provided on the Services &ldquo;AS IS&rdquo; for your information and personal use only. Except as expressly provided in these Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</p>

            <h2 id="section3">3. User Representations</h2>
            <p>By using the Services, you represent and warrant that:</p>
            <ul>
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not access the Services through automated or non-human means, whether through a bot, script, or otherwise, except as expressly permitted.</li>
              <li>You will not use the Services for any illegal or unauthorized purpose.</li>
              <li>Your use of the Services will not violate any applicable law or regulation.</li>
            </ul>

            <h2 id="section4">4. User Registration</h2>
            <p>You may be required to register with the Services to access certain features (e.g., provider listing). You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</p>

            <h2 id="section5">5. Subscriptions and Payments</h2>
            <p>Searching the directory and contacting providers is free for vessel operators.</p>
            <p>For service providers: <strong>listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year.</strong> Prices are in US dollars.</p>
            <p>We will email every listed provider before the launch period ends and before any paid plan starts. No payment details are collected during the launch period, and nothing is charged unless you choose a paid plan.</p>
            <p>Once you choose a paid plan, you authorize us (or our designated payment processor) to charge your payment method for that plan. Paid subscriptions renew automatically at the end of each billing period unless you cancel before the renewal date. Refunds for paid subscriptions are covered by our <Link href="/refund-policy">Refund Policy</Link>.</p>

            <h2 id="section6">6. Launch Period</h2>
            <p>The launch period is the period during which provider listings are free. We decide when it ends and will give listed providers notice by email in advance. If you do not choose a paid plan when the launch period ends, your listing may be paused or removed; you will not be charged.</p>
            <p>One free listing is allowed per company or business entity. Creating several accounts for the same business may lead to those accounts being merged, suspended or removed.</p>

            <h2 id="section7">7. Cancellation</h2>
            <p>You can remove your listing or cancel a paid subscription at any time by contacting us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. A paid subscription stays active until the end of the current billing period and is not renewed. If you ask us to remove your listing, we will do so within 24 hours.</p>

            <h2 id="section8">8. Prohibited Activities</h2>
            <p>You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
            <p>As a user of the Services, you agree not to:</p>
            <ul>
              <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
              <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
              <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
              <li>Engage in unauthorized framing of or linking to the Services.</li>
              <li>Upload or transmit viruses, Trojan horses, or other material that interferes with any party&apos;s uninterrupted use and enjoyment of the Services.</li>
              <li>Submit false or misleading information about your business or services.</li>
              <li>List a business at ports where you do not actually operate or provide services.</li>
              <li>Impersonate another person or business entity.</li>
              <li>Use the Services to advertise or offer to sell goods and services in a manner that violates these Terms.</li>
            </ul>

            <h2 id="section9">9. User-Generated Contributions</h2>
            <p>The Services may invite you to chat, contribute to, or participate in features, including business listings, reviews, or other content. When you create or make available any Contributions, you represent and warrant that:</p>
            <ul>
              <li>Your Contributions are true, accurate, and complete.</li>
              <li>Your Contributions do not infringe any third-party rights.</li>
              <li>Your Contributions do not contain false, inaccurate, or misleading information.</li>
              <li>Your Contributions are not unsolicited or unauthorized advertising or promotional materials.</li>
            </ul>

            <h2 id="section10">10. Contribution License</h2>
            <p>By posting your Contributions to any part of the Services, you automatically grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt, and distribute such Contributions for any purpose related to the Services.</p>

            <h2 id="section11">11. Provider Listings</h2>
            <p>If you list your business as a service provider on the Services, you agree to the following:</p>
            <ul>
              <li>All information you provide about your business will be accurate, current, and truthful.</li>
              <li>You will only list at ports where you actively operate or provide services.</li>
              <li>You hold all necessary licenses, permits, and certifications to provide the services you advertise.</li>
              <li>You will respond promptly to inquiries from vessel operators or charterers.</li>
              <li>You will maintain the quality of service represented in your listing.</li>
              <li>You will not use the listing to engage in fraudulent or deceptive practices.</li>
            </ul>
            <p>We may suspend or remove any listing that breaks these requirements. Fees already paid for a listing removed for a breach are not refunded.</p>

            <h2 id="section12">12. No Commission Policy</h2>
            <p>PortServiceFinder is funded by provider listing fees only. We do not take any commission, finder&apos;s fee, or percentage from transactions or contracts that result from connections made through the Services. All business dealings between vessel operators and service providers are conducted directly between those parties, and we are not a party to those transactions.</p>

            <h2 id="section13">13. Third-Party Websites and Content</h2>
            <p>The Services may contain links to other websites, as well as content originating from third parties. Such third-party links and content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any third-party websites accessed through the Services or any third-party content posted on, available through, or installed from the Services.</p>

            <h2 id="section14">14. Services Management</h2>
            <p>We reserve the right, but not the obligation, to: monitor the Services for violations of these Terms; take appropriate legal action against anyone who violates the law or these Terms; refuse, restrict access to, limit the availability of, or disable any of your Contributions; remove from the Services any files and content that are excessive in size; and manage the Services in a manner designed to protect our rights and property.</p>

            <h2 id="section15">15. Privacy Policy</h2>
            <p>We care about data privacy and security. Please review our <Link href="/privacy">Privacy Policy</Link>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Terms.</p>

            <h2 id="section16">16. Term and Termination</h2>
            <p>These Terms shall remain in full force and effect while you use the Services. <strong>WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES TO ANY PERSON FOR ANY REASON OR FOR NO REASON</strong>, including without limitation for breach of any representation, warranty, or covenant contained in these Terms or of any applicable law or regulation.</p>

            <h2 id="section17">17. Modifications and Interruptions</h2>
            <p>We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time.</p>
            <p>We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors.</p>

            <h2 id="section18">18. Governing Law</h2>
            <p>These Terms and your use of the Services are governed by and construed in accordance with the laws of England and Wales applicable to agreements made and to be entirely performed within England and Wales, without regard to its conflict of law principles.</p>

            <h2 id="section19">19. Dispute Resolution</h2>
            <p>Any legal action of whatever nature brought by either you or us shall be commenced or prosecuted in the courts located in London, England, and you hereby consent to, and waive all defenses of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such courts.</p>
            <p>Before initiating any formal legal action, you agree to first contact us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> and make a good faith effort to resolve the dispute informally.</p>

            <h2 id="section20">20. Disclaimer</h2>
            <p><strong>THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK.</strong> TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.</p>
            <p>We make no warranties or representations about:</p>
            <ul>
              <li>The accuracy or completeness of the Services&apos; content or the content of any websites linked to the Services.</li>
              <li>The quality, reliability, or credentials of any service provider listed on the Services.</li>
              <li>Any errors, mistakes, or inaccuracies of content and materials.</li>
              <li>Any unauthorized access to or use of our secure servers and any personal information stored therein.</li>
              <li>Any interruption or cessation of transmission to or from the Services.</li>
            </ul>
            <p><strong>VESSEL OPERATORS AND OTHER USERS ARE SOLELY RESPONSIBLE FOR VERIFYING THE CREDENTIALS, LICENSES, AND CAPABILITIES OF ANY SERVICE PROVIDER BEFORE ENGAGING THEIR SERVICES.</strong></p>

            <h2 id="section21">21. Limitations of Liability</h2>
            <p><strong>IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</strong></p>

            <h2 id="section22">22. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or arising out of: your use of the Services; breach of these Terms; any breach of your representations and warranties set forth in these Terms; your violation of the rights of a third party; or any overt harmful act toward any other user of the Services with whom you connected via the Services.</p>

            <h2 id="section23">23. Contact Us</h2>
            <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>

            <div className="contact-box">
              <strong>PortServiceFinder</strong>
              London, England<br/>
              <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>
            </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
