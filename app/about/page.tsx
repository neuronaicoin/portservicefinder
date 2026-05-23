import Link from 'next/link';

export const metadata = {
  title: 'About PortServiceFinder — Global Maritime Services Directory',
  description: 'Built by maritime industry professionals to solve a real problem: finding reliable port services worldwide. Zero commission. Free for vessel operators.',
};

export default function AboutPage() {
  const g = { color: '#c8a84b' };
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <>
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
        .value-card{transition:transform .35s ease, border-color .35s ease, box-shadow .35s ease;}
        .value-card:hover{transform:translateY(-4px);border-color:rgba(200,168,75,.5)!important;box-shadow:0 10px 30px rgba(0,0,0,.4);}
        .logo-mark{filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
        @media(max-width:768px){
          nav{padding:0 16px!important;}
          .logo-text{font-size:16px!important;}
          .hero-pad{padding:100px 16px 40px!important;}
          .hero-h1{font-size:clamp(28px,7vw,42px)!important;}
          .sec-pad{padding:50px 16px!important;}
          .what-grid{grid-template-columns:1fr!important;}
          .why-grid{grid-template-columns:1fr!important;}
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
        <section className="hero-pad" style={{paddingTop:120,paddingBottom:60,paddingLeft:48,paddingRight:48,textAlign:'center',maxWidth:900,margin:'0 auto'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:18,fontWeight:700}}>
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginRight:12,opacity:.5}}/>
            About Us
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginLeft:12,opacity:.5}}/>
          </div>
          <h1 className="hero-h1" style={{fontFamily:lb,fontSize:'clamp(32px,4vw,52px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1.2,marginBottom:22}}>
            Built by Maritime Professionals,<br/>for <em style={g}>Maritime Professionals</em>
          </h1>
          <p style={{fontSize:16,lineHeight:1.8,color:'#d4dcc8',maxWidth:680,margin:'0 auto'}}>
            PortServiceFinder was created to solve a problem we lived ourselves &mdash; finding reliable ship agents, chandlers, and marine service companies at unfamiliar ports.
          </p>
        </section>

        {/* OUR STORY */}
        <section className="sec-pad" style={{padding:'70px 48px',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{maxWidth:820,margin:'0 auto'}}>
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Our Story</div>
            <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,36px)',fontWeight:700,lineHeight:1.15,marginBottom:24}}>
              A platform born <em style={g}>at sea</em>
            </h2>
            <div style={{fontSize:15,lineHeight:1.9,color:'#d4dcc8',display:'flex',flexDirection:'column',gap:16}}>
              <p>
                PortServiceFinder was founded by maritime industry professionals with years of operational experience across global shipping routes. Like every vessel operator, ship agent, and superintendent, we faced the same frustrating problem at every new port: <strong style={{color:'#f5f0e8'}}>finding reliable local providers fast.</strong>
              </p>
              <p>
                The traditional process &mdash; calling four or five contacts, comparing fragmented quotes, waiting hours for replies, never being sure if a provider is actually verified &mdash; was inefficient, opaque, and built on personal relationships rather than transparent information.
              </p>
              <p>
                We built PortServiceFinder to fix that. A single, global directory where vessel operators can find and contact verified ship agents, shipchandlers, and marine service companies at any port worldwide &mdash; <strong style={g}>free to search, with no commission ever taken from the deal.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* OUR MISSION */}
        <section className="sec-pad" style={{padding:'70px 48px',background:'#08100a'}}>
          <div style={{maxWidth:820,margin:'0 auto',textAlign:'center'}}>
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Our Mission</div>
            <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,36px)',fontWeight:700,lineHeight:1.15,marginBottom:20}}>
              Make port operations <em style={g}>transparent &amp; efficient</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.9,color:'#d4dcc8',maxWidth:680,margin:'0 auto'}}>
              We believe every port call should start with clarity &mdash; knowing who serves the port, what they offer, and how to reach them. By building a platform that&apos;s free for vessel operators and commission-free for providers, we&apos;re creating a directory where trust is built on transparency, not on opaque middlemen.
            </p>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section className="sec-pad" style={{padding:'70px 48px',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:42}}>
              <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>What We Do</div>
              <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,36px)',fontWeight:700,lineHeight:1.15}}>
                Three pillars, <em style={g}>one platform</em>
              </h2>
            </div>
            <div className="what-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {[
                {ico:'🔍',title:'Search',desc:'Vessel operators search verified ship agents, chandlers, and marine service companies at any port worldwide &mdash; free, with no signup required.'},
                {ico:'🏢',title:'List',desc:'Service providers list their business globally with full company profile, verified status, and direct contact details &mdash; flat subscription, no commission.'},
                {ico:'🤝',title:'Connect',desc:'Direct communication via phone, email, or WhatsApp. No middleman, no hidden fees. The deal happens between you and the provider.'},
              ].map(item=>(
                <div key={item.title} className="value-card" style={{background:'#111c13',padding:'30px 26px',border:'1px solid rgba(200,168,75,.2)'}}>
                  <div style={{fontSize:32,marginBottom:14}}>{item.ico}</div>
                  <h3 style={{fontFamily:lb,fontSize:20,fontWeight:700,marginBottom:10}}>{item.title}</h3>
                  <p style={{fontSize:13,lineHeight:1.75,color:'#b0c0a4'}} dangerouslySetInnerHTML={{__html:item.desc}}/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY WE'RE DIFFERENT */}
        <section className="sec-pad" style={{padding:'70px 48px',background:'#08100a'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:42}}>
              <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Why We&apos;re Different</div>
              <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,36px)',fontWeight:700,lineHeight:1.15}}>
                Built different from <em style={g}>day one</em>
              </h2>
            </div>
            <div className="why-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
              {[
                {ico:'💰',title:'Zero commission',desc:'We never take a cut from any deal between operators and providers. Subscriptions only &mdash; flat, predictable, transparent.'},
                {ico:'✓',title:'Verified providers',desc:'Every listed provider goes through our verification process. Operators see only legitimate businesses.'},
                {ico:'🆓',title:'Free for vessel operators',desc:'No subscription, no signup, no paywall. Search any port, contact any provider &mdash; always free.'},
                {ico:'⚓',title:'Built by industry insiders',desc:'We&apos;ve worked aboard ships and at port operations. We understand the real workflow, not theoretical use cases.'},
              ].map(item=>(
                <div key={item.title} className="value-card" style={{background:'#111c13',padding:'24px 26px',border:'1px solid rgba(200,168,75,.2)',display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{fontSize:26,flexShrink:0,marginTop:2}}>{item.ico}</div>
                  <div>
                    <h3 style={{fontFamily:lb,fontSize:17,fontWeight:700,marginBottom:7}}>{item.title}</h3>
                    <p style={{fontSize:13,lineHeight:1.7,color:'#b0c0a4'}}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OPERATING FROM */}
        <section className="sec-pad" style={{padding:'60px 48px',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.1)',textAlign:'center'}}>
          <div style={{maxWidth:680,margin:'0 auto'}}>
            <div style={{fontSize:36,marginBottom:14}}>🌍</div>
            <h2 style={{fontFamily:lb,fontSize:'clamp(22px,2.5vw,30px)',fontWeight:700,lineHeight:1.2,marginBottom:14}}>
              Operating from <em style={g}>Istanbul, Turkey</em><br/>&mdash; Serving Global Ports
            </h2>
            <p style={{fontSize:14,color:'#b0c0a4',lineHeight:1.75}}>
              Our base is Istanbul, one of the world&apos;s most strategic maritime crossroads. From here, we serve vessel operators, ship agents, and service providers across 150+ countries and 1,200+ ports worldwide.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="sec-pad" style={{padding:'70px 48px',textAlign:'center',background:'#08100a',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,38px)',fontWeight:700,lineHeight:1.1,marginBottom:14}}>
            Have a Question or <em style={g}>Feedback?</em>
          </h2>
          <p style={{fontSize:14,color:'#b0c0a4',maxWidth:500,margin:'0 auto 26px',lineHeight:1.75}}>
            We&apos;d love to hear from vessel operators, providers, and anyone in the maritime industry. Reach out anytime.
          </p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/contact" className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'12px 28px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>Contact Us</Link>
            <Link href="/" className="btn-ghost" style={{background:'transparent',color:'#f5f0e8',border:'1px solid rgba(200,168,75,.3)',padding:'11px 22px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:600,textDecoration:'none'}}>Search Ports</Link>
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
