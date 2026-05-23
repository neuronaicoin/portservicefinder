'use client';
import Link from 'next/link';

export default function TermsOfService() {
  const g = { color: '#c8a84b' } as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .legal-content h2{
          font-family:'Libre Baskerville',serif;
          font-size:22px;
          font-weight:700;
          color:#f5f0e8;
          margin:36px 0 14px;
          padding-bottom:10px;
          border-bottom:1px solid rgba(200,168,75,.2);
        }
        .legal-content h3{
          font-family:'Libre Baskerville',serif;
          font-size:17px;
          font-weight:700;
          color:#c8a84b;
          margin:24px 0 10px;
        }
        .legal-content p{
          color:#b0c0a4;
          line-height:1.8;
          margin-bottom:14px;
          font-size:14px;
        }
        .legal-content ul{
          list-style:none;
          padding-left:0;
          margin-bottom:14px;
        }
        .legal-content ul li{
          color:#b0c0a4;
          line-height:1.8;
          font-size:14px;
          padding-left:22px;
          position:relative;
          margin-bottom:7px;
        }
        .legal-content ul li::before{
          content:'▸';
          color:#c8a84b;
          position:absolute;
          left:6px;
          font-weight:700;
        }
        .legal-content strong{color:#f5f0e8;font-weight:600;}
        .legal-content em{color:#d4dcc8;font-style:italic;}
        .legal-content a{color:#c8a84b;text-decoration:none;border-bottom:1px solid rgba(200,168,75,.3);transition:border-color .2s;}
        .legal-content a:hover{border-bottom-color:#c8a84b;}
        .legal-content .toc{
          background:rgba(200,168,75,.04);
          border:1px solid rgba(200,168,75,.15);
          padding:22px 26px;
          margin:24px 0;
        }
        .legal-content .toc a{
          display:block;
          padding:5px 0;
          color:#c8a84b;
          border-bottom:none;
          font-family:'Rajdhani',sans-serif;
          font-weight:600;
          font-size:13px;
        }
        .legal-content .toc a:hover{
          color:#e2c06a;
        }
        .legal-content .summary-box{
          background:rgba(200,168,75,.05);
          border-left:3px solid #c8a84b;
          padding:14px 18px;
          margin:16px 0;
          font-size:13.5px;
          color:#d4dcc8;
          font-style:italic;
          line-height:1.7;
        }
        .legal-content .summary-box strong{color:#c8a84b;font-style:normal;}
        .legal-content .warning-box{
          background:rgba(226,192,106,.06);
          border:1px solid rgba(226,192,106,.25);
          padding:14px 18px;
          margin:16px 0;
          font-size:13.5px;
          color:#e2c06a;
          line-height:1.7;
        }
        .legal-content .warning-box strong{color:#ffd76a;}
        @media(max-width:768px){
          .legal-content h2{font-size:18px;}
          .legal-content h3{font-size:15px;}
          .legal-content p,.legal-content ul li{font-size:13px;}
        }
      `}</style>

      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh'}}>
        {/* NAV */}
        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#f5f0e8'}}>
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
            <span style={{fontFamily:lb,fontSize:20,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></span>
          </Link>
          <Link href="/" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'7px 14px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>← Back to Home</Link>
        </nav>

        {/* HEADER */}
        <section style={{paddingTop:130,paddingBottom:40,paddingLeft:24,paddingRight:24,textAlign:'center',background:'linear-gradient(180deg,rgba(200,168,75,.04) 0%,transparent 100%)'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>⚖️ Legal Document</div>
          <h1 style={{fontFamily:lb,fontSize:'clamp(28px,4vw,46px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1,marginBottom:14}}>Terms of <em style={g}>Service</em></h1>
          <p style={{fontFamily:rj,fontSize:13,color:'#7a8a72',letterSpacing:'2px',textTransform:'uppercase',fontWeight:600}}>Last Updated: May 23, 2026</p>
        </section>

        {/* CONTENT */}
        <section style={{padding:'10px 24px 80px',maxWidth:880,margin:'0 auto'}}>
          <div className="legal-content">

            <div className="summary-box">
              <strong>Welcome to PortServiceFinder.</strong> These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of PortServiceFinder&apos;s website, services, and applications (the &ldquo;Services&rdquo;). By accessing or using the Services, you agree to be bound by these Terms.
            </div>

            <p>These Terms of Service constitute a legally binding agreement made between you (whether personally or on behalf of an entity) and <strong>PortServiceFinder</strong> (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, or &ldquo;<strong>our</strong>&rdquo;), concerning your access to and use of the website at <a href="https://www.portservicefinder.com">https://www.portservicefinder.com</a> as well as any other related media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the &ldquo;Services&rdquo;).</p>

            <p>You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></p>

            <div className="toc">
              <div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>📑 Table of Contents</div>
              <a href="#section1">1. Our Services</a>
              <a href="#section2">2. Intellectual Property Rights</a>
              <a href="#section3">3. User Representations</a>
              <a href="#section4">4. User Registration</a>
              <a href="#section5">5. Subscriptions and Payments</a>
              <a href="#section6">6. Free Trial Period</a>
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
              <li>Maritime service providers can list their businesses through a paid subscription model.</li>
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
            <p>Service providers may subscribe to list their businesses on the Services through one of the following plans:</p>
            <ul>
              <li><strong>Monthly Subscription:</strong> $99 USD per month, billed monthly</li>
              <li><strong>Annual Subscription:</strong> $1,000 USD per year, billed annually (saves $188 vs monthly)</li>
            </ul>
            <p>By submitting payment information, you authorize us (or our designated payment processor) to charge your payment method for the applicable subscription fee. Subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date.</p>
            <p><strong>Refund Policy:</strong> All subscription fees are non-refundable. You may cancel your subscription at any time, and your access will continue until the end of the current billing period. No partial refunds are provided for unused portions of any billing period.</p>

            <h2 id="section6">6. Free Trial Period</h2>
            <p>We offer a one (1) month free trial period to new providers after verification. The free trial begins only after our team has verified your application and listing details.</p>

            <div className="warning-box">
              <strong>⚠️ Important:</strong> The free trial period is offered only once per company or business entity. Multiple attempts to claim the free trial using different details, email addresses, or business identities will result in account suspension and forfeit of any active subscription, without refund.
            </div>

            <p>You may cancel your subscription at any time during the free trial period without incurring any charges. If you do not cancel before the end of the free trial, your subscription will automatically convert to a paid subscription at the rate of the plan you selected.</p>

            <h2 id="section7">7. Cancellation</h2>
            <p>You can cancel your subscription at any time by contacting us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. Your cancellation will take effect at the end of the current paid term. Your listing will be removed from the directory within 24 hours of cancellation.</p>

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
            <p>We reserve the right to suspend or terminate any listing that violates these requirements, without refund.</p>

            <h2 id="section12">12. No Commission Policy</h2>
            <p>PortServiceFinder operates on a flat subscription model. We do not take any commission, finder&apos;s fee, or percentage from transactions or contracts that result from connections made through the Services. All business dealings between vessel operators and service providers are conducted directly between those parties, and we are not a party to those transactions.</p>

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
            <p>These Terms and your use of the Services are governed by and construed in accordance with the laws of the Republic of Turkey applicable to agreements made and to be entirely performed within Turkey, without regard to its conflict of law principles.</p>

            <h2 id="section19">19. Dispute Resolution</h2>
            <p>Any legal action of whatever nature brought by either you or us shall be commenced or prosecuted in the courts located in Istanbul, Turkey, and you hereby consent to, and waive all defenses of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such courts.</p>
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

            <div style={{background:'rgba(200,168,75,.06)',border:'1px solid rgba(200,168,75,.2)',padding:'18px 22px',margin:'16px 0',fontFamily:rj,fontSize:14,lineHeight:1.8,color:'#d4dcc8'}}>
              <strong style={{color:'#c8a84b',display:'block',marginBottom:6,letterSpacing:1}}>PortServiceFinder</strong>
              Istanbul, Turkey<br/>
              <a href="mailto:contact@portservicefinder.com" style={{color:'#c8a84b'}}>contact@portservicefinder.com</a>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'30px 24px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:14,flexWrap:'wrap'}}>
            <Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Home</Link>
            <Link href="/terms" style={{color:'#c8a84b',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Terms</Link>
            <Link href="/privacy" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Privacy</Link>
            <Link href="/listing-rules" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Listing Rules</Link>
          </div>
          <div style={{fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1,fontWeight:600}}>© 2026 PortServiceFinder. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
