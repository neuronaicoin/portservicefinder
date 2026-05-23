'use client';
import Link from 'next/link';

export default function ListingRules() {
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
        .legal-content ul.do li::before{content:'✓';color:#4caf76;}
        .legal-content ul.dont li::before{content:'✗';color:#ff6b6b;}
        .legal-content strong{color:#f5f0e8;font-weight:600;}
        .legal-content em{color:#d4dcc8;font-style:italic;}
        .legal-content a{color:#c8a84b;text-decoration:none;border-bottom:1px solid rgba(200,168,75,.3);transition:border-color .2s;}
        .legal-content a:hover{border-bottom-color:#c8a84b;}
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
          background:rgba(255,107,107,.06);
          border:1px solid rgba(255,107,107,.25);
          padding:14px 18px;
          margin:16px 0;
          font-size:13.5px;
          color:#ff9a9a;
          line-height:1.7;
        }
        .legal-content .warning-box strong{color:#ff6b6b;}
        .legal-content .success-box{
          background:rgba(76,175,118,.06);
          border:1px solid rgba(76,175,118,.25);
          padding:14px 18px;
          margin:16px 0;
          font-size:13.5px;
          color:#a5d6a7;
          line-height:1.7;
        }
        .legal-content .success-box strong{color:#4caf76;}
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
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>📋 For Providers</div>
          <h1 style={{fontFamily:lb,fontSize:'clamp(28px,4vw,46px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1,marginBottom:14}}>Listing <em style={g}>Rules</em></h1>
          <p style={{fontFamily:rj,fontSize:13,color:'#7a8a72',letterSpacing:'2px',textTransform:'uppercase',fontWeight:600}}>Standards & Guidelines for Maritime Service Providers</p>
        </section>

        {/* CONTENT */}
        <section style={{padding:'10px 24px 80px',maxWidth:880,margin:'0 auto'}}>
          <div className="legal-content">

            <div className="summary-box">
              <strong>Welcome aboard.</strong> These Listing Rules outline the standards every service provider on PortServiceFinder must follow. They protect both vessel operators searching for services and the reputation of legitimate providers on our platform.
            </div>

            <p>By listing your business on PortServiceFinder, you agree to abide by these rules in addition to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>. Violations may result in listing suspension, account termination, and forfeit of subscription fees without refund.</p>

            <h2>1. Who Can List</h2>

            <p>PortServiceFinder accepts listings from three categories of maritime service providers:</p>

            <h3>🏢 Ship Agents</h3>
            <p>Licensed port agency companies providing husbandry services, customs clearance, crew change coordination, bunker arrangement, and vessel call management. You must be a legally registered agency in the jurisdiction(s) where you operate.</p>

            <h3>⚓ Shipchandlers</h3>
            <p>Established suppliers providing provisions (fresh, frozen, bonded), deck stores, engine stores, cabin stores, and technical supplies to vessels. You must have a physical presence or warehouse facility at the port(s) you serve.</p>

            <h3>🔧 Marine Service Providers</h3>
            <p>Specialized technical service companies covering one or more of our 34 service categories — including engine repair, electrical, underwater diving, hull cleaning, welding, refrigeration, navigation systems, BWTS, surveys, and more. You must hold all necessary certifications, class approvals, and licenses required for the services you offer.</p>

            <h2>2. Accuracy Standards</h2>

            <div className="success-box">
              <strong>✓ The Golden Rule:</strong> Every claim in your listing must be true, current, and verifiable. We verify every listing before activation.
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

            <p>You may list your business at <strong>every port where you genuinely operate</strong>. There is no per-port fee — your subscription covers all ports under your business.</p>

            <h3>What Counts as &ldquo;Operating&rdquo; at a Port</h3>
            <ul className="do">
              <li>You maintain personnel, an office, or sub-contracted permanent representatives at the port.</li>
              <li>You regularly handle vessel calls, deliveries, or service jobs at the port (minimum activity within the last 12 months).</li>
              <li>You hold the necessary local licenses, permits, or partnerships required to operate at the port.</li>
              <li>You can respond to inquiries and deliver service at that port within reasonable timeframes (typically 24-48 hours).</li>
            </ul>

            <h3>Prohibited Port Listings</h3>
            <ul className="dont">
              <li>Listing at ports where you have no actual operational capability.</li>
              <li>Listing ports based on aspirational future expansion plans.</li>
              <li>Listing ports where you can only sub-contract without disclosure.</li>
              <li>Mass-listing across many ports to artificially increase visibility.</li>
            </ul>

            <div className="warning-box">
              <strong>⚠️ Detection & Consequences:</strong> If a vessel operator reports a no-response or unable-to-deliver situation at a listed port, we will investigate. Confirmed violations result in immediate removal of that port from your listing. Repeated violations result in full account termination without refund.
            </div>

            <h2>4. Free Trial Policy</h2>

            <p>Every new provider receives <strong>one (1) month free</strong> after verification. This is offered <strong>only once per company or business entity</strong>.</p>

            <div className="warning-box">
              <strong>⚠️ One Free Trial Per Business:</strong> Attempting to claim multiple free trials using different company names, email addresses, registered owners, or business structures while operating the same underlying business will result in:
              <br/>• Immediate account suspension
              <br/>• Forfeit of any active subscription
              <br/>• Permanent ban from the platform
              <br/>• Potential legal action for fraud
            </div>

            <h2>5. Verification Process</h2>

            <p>Every new listing goes through a verification step before activation. This typically takes 24-48 hours and may include:</p>
            <ul>
              <li>Confirmation that contact details match your public business information.</li>
              <li>Brief phone or email verification of operational capability at listed ports.</li>
              <li>Review of certifications and class approvals (for technical service providers).</li>
              <li>Cross-check against publicly available business registries.</li>
            </ul>
            <p>Listings that fail verification may be edited, asked for additional information, or rejected with refund of any subscription fee paid.</p>

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
              <li>Respond within a reasonable business timeframe (typically 24-48 hours).</li>
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

            <p>After successful verification, your listing will display a <span style={{display:'inline-block',padding:'2px 7px',background:'rgba(76,175,118,.15)',border:'1px solid rgba(76,175,118,.4)',color:'#4caf76',fontFamily:rj,fontSize:11,letterSpacing:1,fontWeight:700,borderRadius:2}}>✓ VERIFIED</span> badge. This signals to vessel operators that we have confirmed:</p>
            <ul>
              <li>Your business is a real, operational entity.</li>
              <li>Contact details are active and monitored.</li>
              <li>Listed ports are actually served.</li>
              <li>Service categories match your claimed capabilities.</li>
            </ul>
            <p>The badge does <strong>not</strong> constitute an endorsement of service quality or a guarantee of performance. Vessel operators are responsible for their own due diligence before engaging any provider.</p>

            <h2>10. Updating Your Listing</h2>

            <p>You are responsible for keeping your listing accurate. Changes in:</p>
            <ul>
              <li>Contact information (phone, email, WhatsApp)</li>
              <li>Company name or registration</li>
              <li>Ports served</li>
              <li>Service categories offered</li>
              <li>Certifications or accreditations</li>
            </ul>
            <p>...must be communicated to us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> for verification. Significant changes may require re-verification.</p>

            <h2>11. Promotional Conduct</h2>

            <p>Outside of your listing on PortServiceFinder, you may not:</p>
            <ul className="dont">
              <li>Misrepresent your status on the platform (e.g., claim &ldquo;exclusive partner&rdquo; status if you are simply a paid listing).</li>
              <li>Use PortServiceFinder branding, logos, or trademarks beyond what is provided in your official subscriber materials.</li>
              <li>Promise vessel operators benefits, discounts, or services on behalf of PortServiceFinder.</li>
              <li>Use the platform&apos;s name or directory to harvest contact details for unrelated marketing campaigns.</li>
            </ul>

            <h2>12. Cancellation and Termination</h2>

            <p>You may cancel your subscription at any time by emailing <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>. Your listing will be removed within 24 hours of cancellation request, but your access continues through the end of the current paid period.</p>

            <p>We may terminate your listing for any of the following:</p>
            <ul>
              <li>Material violation of these Listing Rules</li>
              <li>Material violation of our <Link href="/terms">Terms of Service</Link></li>
              <li>Repeated complaints from users that we are unable to resolve</li>
              <li>Fraudulent claims or attempts to manipulate the platform</li>
              <li>Non-payment of subscription fees after applicable grace period</li>
              <li>Court order, regulatory action, or legal requirement</li>
            </ul>

            <p>In cases of termination for violation, subscription fees are non-refundable.</p>

            <h2>13. Reporting Violations</h2>

            <p>If you encounter a listing that appears to violate these rules — fake claims, impersonation, services not delivered, or any other concern — please report it to us at <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a> with as much detail as possible.</p>

            <p>We investigate all reports confidentially. The reporting party&apos;s identity is not shared with the reported provider without consent.</p>

            <h2>14. Changes to These Rules</h2>

            <p>We may update these Listing Rules from time to time to reflect changes in our platform, industry standards, or legal requirements. Material changes will be communicated to active subscribers via email. The latest version is always available at this page.</p>

            <h2>15. Questions & Contact</h2>

            <p>For any questions about these rules, your listing, or to report a concern:</p>

            <div style={{background:'rgba(200,168,75,.06)',border:'1px solid rgba(200,168,75,.2)',padding:'18px 22px',margin:'16px 0',fontFamily:rj,fontSize:14,lineHeight:1.8,color:'#d4dcc8'}}>
              <strong style={{color:'#c8a84b',display:'block',marginBottom:6,letterSpacing:1}}>PortServiceFinder</strong>
              Istanbul, Turkey<br/>
              <a href="mailto:contact@portservicefinder.com" style={{color:'#c8a84b'}}>contact@portservicefinder.com</a>
            </div>

            <div className="summary-box" style={{marginTop:32}}>
              <strong>Thank you for being part of our platform.</strong> By following these rules, you help us maintain a trustworthy directory that benefits every legitimate maritime service provider and every vessel operator searching for help.
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'30px 24px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:14,flexWrap:'wrap'}}>
            <Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Home</Link>
            <Link href="/terms" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Terms</Link>
            <Link href="/privacy" style={{color:'#7a8a72',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Privacy</Link>
            <Link href="/listing-rules" style={{color:'#c8a84b',textDecoration:'none',fontSize:12,fontFamily:rj,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:600}}>Listing Rules</Link>
          </div>
          <div style={{fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1,fontWeight:600}}>© 2026 PortServiceFinder. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
