import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Privacy Notice: How We Handle Your Data',
  description: 'How PortServiceFinder collects, uses, stores and shares personal data from vessel operators and listed providers, and how to exercise your privacy rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicy() {
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
        <h1>Privacy Notice</h1>
        <p className="meta">Last updated: May 23, 2026</p>
        <div className="legal-content">

            <p>This Privacy Notice for <strong>PortServiceFinder</strong> (<strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>, or <strong>&ldquo;our&rdquo;</strong>) describes how and why we might access, collect, store, use, and/or share (<strong>&ldquo;process&rdquo;</strong>) your personal information when you use our services (<strong>&ldquo;Services&rdquo;</strong>), including when you:</p>

            <ul>
              <li>Visit our website at <a href="https://www.portservicefinder.com">https://www.portservicefinder.com</a> or any website of ours that links to this Privacy Notice</li>
              <li>Engage with us in other related ways, including any marketing or events</li>
            </ul>

            <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.</p>

            <h2>Summary of Key Points</h2>

            <div className="summary-box">
              <strong>This summary provides key points from our Privacy Notice.</strong> You can find more details about any of these topics in the relevant sections below.
            </div>

            <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us, the choices you make, and the products and features you use.</p>

            <p><strong>Do we process any sensitive personal information?</strong> Some information may be considered &ldquo;special&rdquo; or &ldquo;sensitive&rdquo; in certain jurisdictions. We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law.</p>

            <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We process your information only when we have a valid legal reason to do so.</p>

            <p><strong>With whom do we share personal information?</strong> We may share information in specific situations and with specific third parties.</p>

            <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>

            <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by contacting us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. We will consider and act upon any request in accordance with applicable data protection laws.</p>

            <div className="toc">
              <div className="toc-title">Contents</div>
              <a href="#section1">1. What Information Do We Collect?</a>
              <a href="#section2">2. How Do We Process Your Information?</a>
              <a href="#section3">3. What Legal Bases Do We Rely On?</a>
              <a href="#section4">4. When And With Whom Do We Share Your Information?</a>
              <a href="#section5">5. What Is Our Stance On Third-Party Websites?</a>
              <a href="#section6">6. Do We Use Cookies And Other Tracking Technologies?</a>
              <a href="#section7">7. Do We Offer Artificial Intelligence-Based Products?</a>
              <a href="#section8">8. How Do We Handle Your Social Logins?</a>
              <a href="#section9">9. Is Your Information Transferred Internationally?</a>
              <a href="#section10">10. How Long Do We Keep Your Information?</a>
              <a href="#section11">11. What Are Your Privacy Rights?</a>
              <a href="#section12">12. Controls For Do-Not-Track Features</a>
              <a href="#section13">13. Do United States Residents Have Specific Privacy Rights?</a>
              <a href="#section14">14. Do Other Regions Have Specific Privacy Rights?</a>
              <a href="#section15">15. Do We Make Updates To This Notice?</a>
              <a href="#section16">16. How Can You Contact Us About This Notice?</a>
              <a href="#section17">17. How Can You Review, Update, Or Delete Your Data?</a>
            </div>

            <h2 id="section1">1. What Information Do We Collect?</h2>

            <h3>Personal information you disclose to us</h3>

            <div className="summary-box"><strong>In Short:</strong> We collect personal information that you provide to us.</div>

            <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>

            <p><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include:</p>

            <ul>
              <li>Names</li>
              <li>Phone numbers</li>
              <li>Email addresses</li>
              <li>Mailing addresses</li>
              <li>Job titles</li>
              <li>Usernames</li>
              <li>Passwords</li>
              <li>Contact preferences</li>
              <li>Contact or authentication data</li>
              <li>Billing addresses</li>
              <li>Debit/credit card numbers</li>
            </ul>

            <p><strong>Sensitive Information.</strong> We do not knowingly collect sensitive personal information unless necessary and with your explicit consent or as otherwise permitted by applicable law.</p>

            <p><strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details. If you choose to register in this way, we will collect certain profile information about you from the social media provider, as described in the section called <a href="#section8">How Do We Handle Your Social Logins?</a> below.</p>

            <p>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>

            <h3>Information automatically collected</h3>

            <div className="summary-box"><strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</div>

            <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.</p>

            <p>Like many businesses, we also collect information through cookies and similar technologies.</p>

            <p>The information we collect includes:</p>
            <ul>
              <li><strong>Log and Usage Data.</strong> Service-related, diagnostic, usage, and performance information our servers automatically collect.</li>
              <li><strong>Device Data.</strong> Information about your computer, phone, tablet, or other device used to access the Services.</li>
              <li><strong>Location Data.</strong> Information about your device&apos;s location, which can be either precise or imprecise.</li>
            </ul>

            <h2 id="section2">2. How Do We Process Your Information?</h2>

            <div className="summary-box"><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</div>

            <p>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
            <ul>
              <li><strong>To facilitate account creation and authentication.</strong> So you can create and log in to your account, and to keep your account in working order.</li>
              <li><strong>To deliver and facilitate delivery of services.</strong> To help you connect with verified maritime service providers worldwide.</li>
              <li><strong>To respond to user inquiries and offer support.</strong> To address your inquiries and resolve any potential issues with our Services.</li>
              <li><strong>To send administrative information.</strong> Such as details about our products, services, and changes to our terms and policies.</li>
              <li><strong>To request feedback.</strong> To contact you about your use of our Services.</li>
              <li><strong>To send marketing and promotional communications.</strong> Only if this is in accordance with your marketing preferences.</li>
              <li><strong>To protect our Services.</strong> To keep them safe and secure, including fraud monitoring and prevention.</li>
              <li><strong>To comply with our legal obligations.</strong> Including responding to legal requests and preventing harm.</li>
            </ul>

            <h2 id="section3">3. What Legal Bases Do We Rely On To Process Your Information?</h2>

            <div className="summary-box"><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason to do so under applicable law.</div>

            <p><strong><em>If you are located in the EU or UK, this section applies to you.</em></strong></p>

            <p>The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases:</p>
            <ul>
              <li><strong>Consent.</strong> When you have given us permission to use your information for a specific purpose. You can withdraw consent at any time.</li>
              <li><strong>Performance of a Contract.</strong> When we need to fulfill our contractual obligations to you.</li>
              <li><strong>Legitimate Interests.</strong> When it is reasonably necessary to achieve our legitimate business interests.</li>
              <li><strong>Legal Obligations.</strong> When we believe it is necessary for compliance with our legal obligations.</li>
              <li><strong>Vital Interests.</strong> When we believe it is necessary to protect your or another person&apos;s vital interests.</li>
            </ul>

            <h2 id="section4">4. When And With Whom Do We Share Your Personal Information?</h2>

            <div className="summary-box"><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.</div>

            <p>We may need to share your personal information in the following situations:</p>
            <ul>
              <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              <li><strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice.</li>
              <li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
              <li><strong>Service Providers.</strong> We may share information with vendors, service providers, and contractors who perform services for us, such as hosting providers (Cloudflare, Railway), email and form processors (Formspree), and analytics providers.</li>
            </ul>

            <h2 id="section5">5. What Is Our Stance On Third-Party Websites?</h2>

            <div className="summary-box"><strong>In Short:</strong> We are not responsible for the safety of any information that you share with third parties that we may link to or who advertise on our Services.</div>

            <p>The Services may link to third-party websites, online services, or mobile applications that are not affiliated with us. We do not make any guarantee regarding any such third parties, and we will not be liable for any loss or damage caused by the use of such third-party websites, services, or applications.</p>

            <h2 id="section6">6. Do We Use Cookies And Other Tracking Technologies?</h2>

            <div className="summary-box"><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</div>

            <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>

            <h2 id="section7">7. Do We Offer Artificial Intelligence-Based Products?</h2>

            <div className="summary-box"><strong>In Short:</strong> We may offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies in the future.</div>

            <p>As part of our Services and future development, we may offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, &ldquo;AI Products&rdquo;). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of any AI Products within our Services.</p>

            <h2 id="section8">8. How Do We Handle Your Social Logins?</h2>

            <div className="summary-box"><strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</div>

            <p>Our Services may offer you the ability to register and log in using your third-party social media account details. Where you choose to do this, we will receive certain profile information about you from your social media provider.</p>

            <h2 id="section9">9. Is Your Information Transferred Internationally?</h2>

            <div className="summary-box"><strong>In Short:</strong> We may transfer, store, and process your information in countries other than your own.</div>

            <p>Our servers are located in the United Kingdom and other locations depending on third-party providers (Cloudflare, Railway). If you are accessing our Services from outside the United Kingdom, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information.</p>

            <p>If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.</p>

            <h2 id="section10">10. How Long Do We Keep Your Information?</h2>

            <div className="summary-box"><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</div>

            <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law.</p>

            <p>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible, we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>

            <h2 id="section11">11. What Are Your Privacy Rights?</h2>

            <div className="summary-box"><strong>In Short:</strong> Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information.</div>

            <p>In some regions, you have certain rights under applicable data protection laws. These may include:</p>
            <ul>
              <li>The right to request access and obtain a copy of your personal information</li>
              <li>The right to request rectification or erasure</li>
              <li>The right to restrict the processing of your personal information</li>
              <li>The right to data portability (if applicable)</li>
              <li>The right not to be subject to automated decision-making</li>
              <li>The right to object to the processing of your personal information</li>
            </ul>

            <p>To make such a request, please contact us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. We will consider and act upon any request in accordance with applicable data protection laws.</p>

            <h3>Withdrawing your consent</h3>
            <p>If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time by contacting us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.</p>

            <h3>Account Information</h3>
            <p>If you would at any time like to review or change the information in your account or terminate your account, you can:</p>
            <ul>
              <li>Log in to your account settings and update your user account</li>
              <li>Contact us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a></li>
            </ul>

            <h2 id="section12">12. Controls For Do-Not-Track Features</h2>

            <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&ldquo;DNT&rdquo;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals.</p>

            <h2 id="section13">13. Do United States Residents Have Specific Privacy Rights?</h2>

            <div className="summary-box"><strong>In Short:</strong> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have rights regarding access, correction, deletion, and portability of your personal information.</div>

            <p>You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</p>
            <ul>
              <li><strong>Right to know</strong> whether or not we are processing your personal data</li>
              <li><strong>Right to access</strong> your personal data</li>
              <li><strong>Right to correct</strong> inaccuracies in your personal data</li>
              <li><strong>Right to request</strong> the deletion of your personal data</li>
              <li><strong>Right to obtain a copy</strong> of the personal data you previously shared with us</li>
              <li><strong>Right to non-discrimination</strong> for exercising your rights</li>
              <li><strong>Right to opt out</strong> of the processing of your personal data for targeted advertising, sale, or profiling</li>
            </ul>

            <p>To exercise these rights, please contact us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.</p>

            <h2 id="section14">14. Do Other Regions Have Specific Privacy Rights?</h2>

            <div className="summary-box"><strong>In Short:</strong> You may have additional rights based on the country you reside in.</div>

            <h3>Australia and New Zealand</h3>
            <p>We collect and process your personal information under the obligations and conditions set by Australia&apos;s Privacy Act 1988 and New Zealand&apos;s Privacy Act 2020. This Privacy Notice satisfies the notice requirements defined in both Privacy Acts.</p>

            <h3>Republic of South Africa</h3>
            <p>At any time, you have the right to request access to or correction of your personal information. You can make such a request by contacting us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.</p>

            <h3>Turkey (KVKK)</h3>
            <p>If you are located in Turkey, you have rights under the Kişisel Verilerin Korunması Kanunu (KVKK), including the right to learn whether your personal data has been processed, request information about how it has been processed, learn the purpose of processing, request correction or deletion of incomplete or incorrect data, and object to results that are against your interests resulting from analysis of your personal data exclusively through automated systems.</p>

            <h2 id="section15">15. Do We Make Updates To This Notice?</h2>

            <div className="summary-box"><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</div>

            <p>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &ldquo;Last Updated&rdquo; date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</p>

            <h2 id="section16">16. How Can You Contact Us About This Notice?</h2>

            <p>If you have questions or comments about this notice, you may contact us by email at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> or by post at:</p>

            <div className="contact-box">
              <strong>PortServiceFinder</strong>
              London, England<br/>
              <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>
            </div>

            <h2 id="section17">17. How Can You Review, Update, Or Delete The Data We Collect From You?</h2>

            <p>Based on the applicable laws of your country or state of residence, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law.</p>

            <p>To request to review, update, or delete your personal information, please email us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
