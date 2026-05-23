'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FAQItem { q: string; a: string }
interface FAQCategory { title: string; icon: string; items: FAQItem[] }

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'For Vessel Operators',
    icon: '🚢',
    items: [
      { q: 'Is PortServiceFinder free for vessel operators?', a: 'Yes, completely free. There is no subscription, no signup, no paywall. Search any port worldwide and contact any provider — always free for vessel operators, ship managers, captains, and shipping companies.' },
      { q: 'How do I contact a provider after I find them?', a: 'Click on any provider listing to see their full contact details — phone, email, WhatsApp, and website. Communication happens directly between you and the provider. We never sit in the middle, take a commission, or filter messages.' },
      { q: 'How are providers verified?', a: 'Every provider on the platform goes through our manual verification process. We check business registration, contact details, port operations, and reputation. Verified providers display the green "Verified" badge. Note: verification confirms legitimacy, not an endorsement of service quality.' },
      { q: 'What if no provider is listed at my port?', a: 'Our smart fallback shows other providers from the same country. We are actively expanding our database — if your specific port is not covered yet, you can also contact us and we will prioritise outreach to providers at that port.' },
    ],
  },
  {
    title: 'For Service Providers',
    icon: '🏢',
    items: [
      { q: 'How much does it cost to list my business?', a: 'There are two simple plans: $99 per month or $1,000 per year (saves $188 versus monthly). Both plans include a 1-month free trial after we verify your details. No commission is ever taken from any deal you make through the platform.' },
      { q: 'How long is the free trial?', a: 'One full month, starting the day we verify your business details. You will not be charged during this period and you can cancel any time before the trial ends with no fees.' },
      { q: 'What does "Founding Members" mean?', a: 'Founding Members are the first wave of providers who join while we build the platform. Currently, founding member applications are reviewed individually and may receive extended trial periods or other benefits. Apply through the registration form to be considered.' },
      { q: 'What happens if I cancel?', a: 'You can cancel any time from your account or by emailing us. If you cancel during the free trial, you owe nothing. If you cancel during a paid month, your listing stays active until the end of the current billing period. We do not pro-rate refunds for partial months.' },
      { q: 'How do I get the Verified Badge?', a: 'During the application process, our team reviews your business registration, contact information, and operations at the ports you list. Verification usually takes 24-48 hours. Once approved, your listing displays a green "Verified" badge to vessel operators.' },
      { q: 'Can I list at multiple ports?', a: 'Yes. Each listing can cover up to 3 ports under one subscription. If you serve more ports, contact us and we will work out a custom arrangement.' },
    ],
  },
  {
    title: 'Payments & Billing',
    icon: '💳',
    items: [
      { q: 'When am I charged?', a: 'You are not charged when you submit your application. Charging only begins after we verify your business and your 1-month free trial ends. You will receive a notification before any charge is made.' },
      { q: 'What payment methods do you accept?', a: 'Currently we accept all major credit and debit cards (Visa, Mastercard, American Express). We are working on additional payment options including bank transfer for annual subscriptions.' },
      { q: 'Can I switch between monthly and annual?', a: 'Yes. You can upgrade from monthly to annual any time and we will apply a pro-rated credit. Downgrading from annual to monthly happens at the end of your current annual period.' },
      { q: 'Is my payment information secure?', a: 'Yes. Payment processing is handled through industry-standard secure payment processors. We never store full card details on our servers — only the last 4 digits for your reference.' },
    ],
  },
  {
    title: 'General',
    icon: 'ℹ️',
    items: [
      { q: 'Who runs PortServiceFinder?', a: 'PortServiceFinder is operated by maritime industry professionals with years of operational experience across global shipping routes. We built this platform because we lived the problem ourselves — finding reliable port services at unfamiliar ports was inefficient and opaque. We are based in Istanbul, Turkey and serve ports worldwide.' },
      { q: 'Where are you based?', a: 'Our base of operations is Istanbul, Turkey — one of the world\'s most strategic maritime crossroads. From here we serve providers and vessel operators across 150+ countries and 1,200+ ports.' },
      { q: 'How is PortServiceFinder different from other maritime directories?', a: 'Three things make us different: (1) we are free for vessel operators forever, with no signup or paywall; (2) we never take commission from deals — providers pay a flat subscription only; (3) the platform is built by people who have actually worked in maritime operations, not by outsiders who only see the industry from spreadsheets.' },
    ],
  },
];

export default function FAQPage() {
  const g = { color: '#c8a84b' };
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  const [openKey, setOpenKey] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenKey(openKey === key ? null : key);
  }

  // Schema.org FAQPage structured data — generated from FAQ_DATA
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.flatMap((category) =>
      category.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .nlnk:hover{color:#c8a84b!important;}
        .footer-link:hover{color:#c8a84b!important;}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .btn-ghost{transition:background .25s ease, color .25s ease, border-color .25s ease;}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        .faq-row{transition:border-color .25s ease, background .25s ease;}
        .faq-row:hover{border-color:rgba(200,168,75,.5)!important;}
        .faq-q{transition:color .25s ease;}
        .faq-row:hover .faq-q{color:#c8a84b;}
        .logo-mark{filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
        @media(max-width:768px){
          nav{padding:0 16px!important;}
          .logo-text{font-size:16px!important;}
          .hero-pad{padding:100px 16px 40px!important;}
          .hero-h1{font-size:clamp(28px,7vw,42px)!important;}
          .sec-pad{padding:36px 16px!important;}
          .ftgrid{grid-template-columns:1fr!important;}
          .ftpad{padding:36px 16px 0!important;}
        }
      `}</style>

      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh'}}>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#f5f0e8'}}>
            <svg className="logo-mark" width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5"/>
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
            <span className="logo-text" style={{fontFamily:lb,fontSize:20,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></span>
          </Link>
          <Link href="/" className="btn-ghost" style={{background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',padding:'7px 14px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>← Back to Home</Link>
        </nav>

        {/* HERO */}
        <section className="hero-pad" style={{paddingTop:120,paddingBottom:50,paddingLeft:48,paddingRight:48,textAlign:'center',maxWidth:900,margin:'0 auto'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:18,fontWeight:700}}>
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginRight:12,opacity:.5}}/>
            FAQ
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginLeft:12,opacity:.5}}/>
          </div>
          <h1 className="hero-h1" style={{fontFamily:lb,fontSize:'clamp(32px,4vw,52px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1.2,marginBottom:20}}>
            Frequently Asked <em style={g}>Questions</em>
          </h1>
          <p style={{fontSize:15,lineHeight:1.8,color:'#d4dcc8',maxWidth:580,margin:'0 auto'}}>
            Answers to common questions from vessel operators, providers, and maritime professionals.
          </p>
        </section>

        {/* FAQ CATEGORIES */}
        <section className="sec-pad" style={{padding:'30px 48px 80px',maxWidth:920,margin:'0 auto'}}>
          {FAQ_DATA.map((category, ci) => (
            <div key={ci} style={{marginBottom:36}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,paddingBottom:10,borderBottom:'1px solid rgba(200,168,75,.18)'}}>
                <span style={{fontSize:24}}>{category.icon}</span>
                <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700}}>{category.title}</h2>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {category.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key} className="faq-row" style={{background:'#0c1610',border:`1px solid ${isOpen?'rgba(200,168,75,.5)':'rgba(200,168,75,.18)'}`,overflow:'hidden'}}>
                      <button onClick={()=>toggle(key)} style={{width:'100%',background:'none',border:'none',padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',textAlign:'left',gap:16,color:'#f5f0e8'}}>
                        <span className="faq-q" style={{fontFamily:lb,fontSize:15,fontWeight:700,lineHeight:1.4,color:isOpen?'#c8a84b':'#f5f0e8',flex:1}}>{item.q}</span>
                        <span style={{fontFamily:rj,fontSize:24,color:'#c8a84b',fontWeight:600,transition:'transform .3s ease',transform:isOpen?'rotate(45deg)':'rotate(0deg)',flexShrink:0,lineHeight:1}}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{padding:'0 22px 20px',fontSize:13.5,lineHeight:1.8,color:'#d4dcc8',borderTop:'1px solid rgba(200,168,75,.1)',paddingTop:14}}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div style={{background:'linear-gradient(180deg,rgba(200,168,75,.06),transparent)',border:'1px solid rgba(200,168,75,.3)',padding:'30px 30px',marginTop:24,textAlign:'center'}}>
            <h3 style={{fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:10}}>Still have <em style={g}>questions?</em></h3>
            <p style={{fontSize:14,color:'#b0c0a4',lineHeight:1.7,maxWidth:480,margin:'0 auto 20px'}}>
              We&apos;re happy to help. Reach out anytime and we&apos;ll get back to you within 24 hours.
            </p>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/contact" className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'12px 26px',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>Contact Us</Link>
              <a href="mailto:contact@portservicefinder.com" className="btn-ghost" style={{background:'transparent',color:'#c8a84b',border:'1px solid rgba(200,168,75,.4)',padding:'11px 22px',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>Email Us</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ftpad" style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'48px 48px 0',background:'#08100a'}}>
          <div className="ftgrid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:44,marginBottom:32}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                <div style={{fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></div>
              </div>
              <p style={{fontSize:12,color:'#7a8a72',lineHeight:1.75,maxWidth:240,marginBottom:14}}>The global maritime services directory. Free for vessel operators. No commission, ever.</p>
              <a href="mailto:contact@portservicefinder.com" className="footer-link" style={{fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>contact@portservicefinder.com</a>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Directory</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Search Ports</Link></li>
                <li><Link href="/blog" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Blog &amp; Guides</Link></li>
                <li><Link href="/for-providers" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>For Providers</Link></li>
                <li><Link href="/faq" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Company</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/about" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>About</Link></li>
                <li><Link href="/contact" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Legal</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/terms" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Terms of Service</Link></li>
                <li><Link href="/privacy" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Privacy Policy</Link></li>
                <li><Link href="/listing-rules" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Listing Rules</Link></li>
              </ul>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(200,168,75,.1)',padding:'14px 0 20px',display:'flex',justifyContent:'space-between',fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1,fontWeight:600,flexWrap:'wrap',gap:8}}>
            <span>© 2026 PortServiceFinder. All rights reserved.</span>
            <span>MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH</span>
          </div>
        </footer>

      </div>
    </>
  );
}
