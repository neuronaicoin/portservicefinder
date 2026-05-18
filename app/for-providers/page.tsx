'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ForProvidersPage() {
  const lb = "'Libre Baskerville',serif";
  const rj = "'Rajdhani',sans-serif";
  const g = { color: '#c8a84b' } as React.CSSProperties;

  // Live indicators — change randomly to feel real
  const [liveViewers, setLiveViewers] = useState(43);
  const [liveEnquiries, setLiveEnquiries] = useState(67);
  const [newThisWeek, setNewThisWeek] = useState(28);

  useEffect(() => {
    // Update random "live" numbers every 8-15 seconds
    const interval = setInterval(() => {
      setLiveViewers(Math.floor(Math.random() * 25) + 35); // 35-60
      setLiveEnquiries(Math.floor(Math.random() * 30) + 55); // 55-85
      setNewThisWeek(Math.floor(Math.random() * 15) + 24); // 24-39
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.15);}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#4caf76;animation:pulse 1.8s ease-in-out infinite;margin-right:8px;}
        .live-num{animation:slideIn .4s ease;}
        .fade-up{opacity:0;animation:fadeUp .7s forwards;}
        .d1{animation-delay:.1s;}
        .d2{animation-delay:.25s;}
        .d3{animation-delay:.4s;}
        .d4{animation-delay:.55s;}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(200,168,75,.45);filter:brightness(1.1);}
        .btn-ghost{transition:background .25s ease, border-color .25s ease;}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        .card{transition:transform .35s ease, border-color .35s ease, box-shadow .35s ease;}
        .card:hover{transform:translateY(-4px);border-color:#c8a84b!important;box-shadow:0 14px 38px rgba(0,0,0,.4);}
        .pricing-card{transition:all .3s ease;}
        .pricing-card:hover{transform:translateY(-6px);box-shadow:0 18px 48px rgba(200,168,75,.2);}
        .faq-item{transition:border-color .3s ease;}
        .faq-item[open]{border-color:#c8a84b!important;}
        .compare-row{transition:background .25s ease;}
        .compare-row:hover{background:rgba(200,168,75,.05)!important;}
        @media(max-width:768px){
          .nav-cta{font-size:11px!important;padding:7px 12px!important;}
          .hero-sec{padding:90px 20px 50px!important;}
          .hero-sec h1{font-size:clamp(28px,7vw,42px)!important;}
          .hero-stats{flex-direction:column!important;gap:8px!important;}
          .live-bar{padding:12px 16px!important;flex-direction:column!important;text-align:center!important;gap:8px!important;}
          .content-pad{padding:50px 20px!important;}
          .why-grid{grid-template-columns:1fr!important;}
          .compare-grid{grid-template-columns:1fr!important;}
          .compare-col{border-left:none!important;border-top:1px solid rgba(200,168,75,.2)!important;}
          .steps-grid{grid-template-columns:1fr!important;}
          .who-grid{grid-template-columns:1fr!important;}
          .price-grid{grid-template-columns:1fr!important;}
          .ftgrid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div style={{
        background:'#08100a',
        color:'#f5f0e8',
        fontFamily:"'Outfit',sans-serif",
        fontWeight:300,
        minHeight:'100vh',
      }}>

        {/* NAV */}
        <nav style={{
          position:'fixed',
          top:0,
          width:'100%',
          zIndex:300,
          height:64,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          padding:'0 32px',
          background:'rgba(8,16,10,.97)',
          backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(200,168,75,.2)',
        }}>
          <Link href="/" style={{
            fontFamily:lb,
            fontSize:22,
            fontWeight:700,
            letterSpacing:1,
            textDecoration:'none',
            color:'#f5f0e8',
          }}>
            PortService<span style={g}>Finder</span>
          </Link>
          <Link href="/" className="btn-gold nav-cta" style={{
            background:'#c8a84b',
            color:'#08100a',
            border:'none',
            padding:'8px 18px',
            fontFamily:rj,
            fontSize:12,
            letterSpacing:'1.5px',
            textTransform:'uppercase',
            fontWeight:700,
            cursor:'pointer',
            textDecoration:'none',
            whiteSpace:'nowrap',
          }}>
            Start Free Trial
          </Link>
        </nav>

        {/* LIVE INDICATOR BAR */}
        <div className="live-bar" style={{
          marginTop:64,
          padding:'10px 32px',
          background:'rgba(76,175,118,.08)',
          borderBottom:'1px solid rgba(76,175,118,.2)',
          display:'flex',
          gap:32,
          justifyContent:'center',
          alignItems:'center',
          fontFamily:rj,
          fontSize:12,
          fontWeight:600,
          letterSpacing:'.5px',
          color:'#b0c0a4',
        }}>
          <span><span className="live-dot"></span>LIVE: <span className="live-num" style={{color:'#4caf76',fontWeight:700}} key={liveViewers}>{liveViewers}</span> providers viewing this page</span>
          <span>📨 <span className="live-num" style={{color:'#c8a84b',fontWeight:700}} key={liveEnquiries}>{liveEnquiries}</span> enquiries sent in last 24h</span>
          <span>🎉 <span className="live-num" style={{color:'#c8a84b',fontWeight:700}} key={newThisWeek}>{newThisWeek}</span> new providers this week</span>
        </div>

        {/* HERO */}
        <section className="hero-sec" style={{
          padding:'80px 48px 70px',
          textAlign:'center',
          borderBottom:'1px solid rgba(200,168,75,.15)',
        }}>
          <div className="fade-up d1" style={{
            fontFamily:rj,
            fontSize:11,
            letterSpacing:'4px',
            textTransform:'uppercase',
            color:'#c8a84b',
            marginBottom:14,
            fontWeight:700,
          }}>
            ★ For Maritime Service Providers ★
          </div>
          <h1 className="fade-up d2" style={{
            fontFamily:lb,
            fontSize:'clamp(34px,4.5vw,58px)',
            fontWeight:700,
            lineHeight:1.05,
            letterSpacing:-1.5,
            marginBottom:18,
            maxWidth:900,
            margin:'0 auto 18px',
          }}>
            Grow Your Maritime Business —<br/>
            <em style={g}>Get Found by Shipowners Worldwide</em>
          </h1>
          <p className="fade-up d3" style={{
            fontSize:16,
            lineHeight:1.7,
            color:'#d4dcc8',
            maxWidth:620,
            margin:'0 auto 28px',
          }}>
            Be discovered by thousands of vessel operators, charterers and captains at <strong style={g}>1,200+ ports</strong> across <strong style={g}>150+ countries</strong>. Stop chasing leads — let them find you.
          </p>
          <div className="fade-up d4" style={{
            display:'inline-block',
            padding:'10px 22px',
            background:'rgba(200,168,75,.15)',
            border:'2px solid #c8a84b',
            marginBottom:24,
            fontFamily:rj,
            fontSize:13,
            letterSpacing:'2px',
            textTransform:'uppercase',
            fontWeight:700,
            color:'#c8a84b',
          }}>
            🎁 1 Month Free Trial · No Card Required
          </div>
          <div className="fade-up d4" style={{
            display:'flex',
            gap:14,
            justifyContent:'center',
            flexWrap:'wrap',
            marginBottom:24,
          }}>
            <Link href="/" className="btn-gold" style={{
              background:'#c8a84b',
              color:'#08100a',
              border:'none',
              padding:'15px 38px',
              fontFamily:rj,
              fontSize:14,
              letterSpacing:'2px',
              textTransform:'uppercase',
              fontWeight:700,
              cursor:'pointer',
              textDecoration:'none',
            }}>
              List Your Business →
            </Link>
            <a href="#how-it-works" className="btn-ghost" style={{
              background:'transparent',
              color:'#f5f0e8',
              border:'1px solid rgba(200,168,75,.4)',
              padding:'14px 28px',
              fontFamily:rj,
              fontSize:14,
              letterSpacing:'2px',
              textTransform:'uppercase',
              fontWeight:600,
              cursor:'pointer',
              textDecoration:'none',
            }}>
              See How It Works ↓
            </a>
          </div>
          <div className="hero-stats fade-up d4" style={{
            display:'flex',
            gap:36,
            justifyContent:'center',
            flexWrap:'wrap',
            marginTop:18,
            fontFamily:rj,
            fontSize:12,
            color:'#7a8a72',
            fontWeight:600,
            letterSpacing:'.5px',
          }}>
            <span><strong style={{...g,fontSize:16}}>500+</strong> Verified Providers</span>
            <span><strong style={{...g,fontSize:16}}>2,500+</strong> Active Operators</span>
            <span><strong style={{...g,fontSize:16}}>1,000+</strong> Daily Searches</span>
          </div>
        </section>

        {/* CONTENT */}
        <div className="content-pad" style={{
          maxWidth:1100,
          margin:'0 auto',
          padding:'72px 48px',
        }}>

          {/* WHY US */}
          <section style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:14,
            }}>
              Why <em style={g}>PortServiceFinder</em>?
            </h2>
            <p style={{
              textAlign:'center',
              color:'#b0c0a4',
              fontSize:14,
              lineHeight:1.7,
              maxWidth:560,
              margin:'0 auto 40px',
            }}>
              The only maritime directory built specifically to bring vessel operators to your doorstep.
            </p>
            <div className="why-grid" style={{
              display:'grid',
              gridTemplateColumns:'repeat(3,1fr)',
              gap:18,
            }}>
              {[
                {ico:'🌍',title:'Global Reach',desc:'Get listed at 1,200+ ports across 150+ countries. From Singapore to Suez, Panama to Shanghai — your business visible to vessels everywhere.'},
                {ico:'💰',title:'Zero Commission',desc:'Keep 100% of every deal you make. We charge a flat monthly fee — no commissions, no hidden fees, no cuts of your revenue.'},
                {ico:'⚡',title:'Instant Visibility',desc:'Your profile goes live within 24 hours. Start receiving enquiries from ship operators, charterers and captains right away.'},
                {ico:'📈',title:'Inbound Leads',desc:'Stop cold calling. Vessel operators search by port and contact you directly. No more buying outdated contact lists.'},
                {ico:'🎯',title:'Verified Buyers',desc:'Our users are real maritime professionals — shipowners, operators, charterers, agents and captains. Quality over quantity.'},
                {ico:'🚀',title:'Built by Seafarers',desc:'Created by maritime professionals who understand your business. We know what shipowners need — and how providers win contracts.'},
              ].map(item => (
                <div key={item.title} className="card" style={{
                  background:'#111c13',
                  border:'1px solid rgba(200,168,75,.2)',
                  padding:'28px 24px',
                }}>
                  <div style={{fontSize:32,marginBottom:14}}>{item.ico}</div>
                  <h3 style={{
                    fontFamily:lb,
                    fontSize:18,
                    fontWeight:700,
                    marginBottom:10,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize:13,
                    lineHeight:1.7,
                    color:'#b0c0a4',
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* OLD WAY vs NEW WAY */}
          <section style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:36,
            }}>
              The <em style={{color:'#ff6b6b'}}>Old Way</em> vs The <em style={g}>New Way</em>
            </h2>
            <div className="compare-grid" style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:0,
              background:'#111c13',
              border:'1px solid rgba(200,168,75,.2)',
            }}>
              <div style={{padding:'28px 30px',borderRight:'1px solid rgba(200,168,75,.15)'}}>
                <div style={{
                  fontFamily:rj,
                  fontSize:11,
                  letterSpacing:'2px',
                  textTransform:'uppercase',
                  color:'#ff6b6b',
                  marginBottom:14,
                  fontWeight:700,
                }}>
                  ❌ Old Way (Cold Outreach)
                </div>
                {[
                  'Buy expensive contact lists',
                  '100 cold calls = maybe 1 lead',
                  '$5,000+/month on ads with no tracking',
                  'Slow word-of-mouth referrals only',
                  'Compete with bigger firms on price',
                  'No visibility on global market',
                ].map(item => (
                  <div key={item} className="compare-row" style={{
                    padding:'10px 0',
                    fontSize:13,
                    color:'#b0c0a4',
                    borderBottom:'1px solid rgba(200,168,75,.08)',
                  }}>
                    ✗ {item}
                  </div>
                ))}
              </div>
              <div className="compare-col" style={{padding:'28px 30px',borderLeft:'1px solid rgba(200,168,75,.15)'}}>
                <div style={{
                  fontFamily:rj,
                  fontSize:11,
                  letterSpacing:'2px',
                  textTransform:'uppercase',
                  color:'#4caf76',
                  marginBottom:14,
                  fontWeight:700,
                }}>
                  ✅ New Way (PortServiceFinder)
                </div>
                {[
                  'Vessel operators find YOU automatically',
                  'Inbound enquiries — qualified leads',
                  '$99/month flat fee — no surprises',
                  'Listed in front of 2,500+ active operators',
                  'Compete on quality, not just price',
                  'Visible at 1,200+ ports worldwide',
                ].map(item => (
                  <div key={item} className="compare-row" style={{
                    padding:'10px 0',
                    fontSize:13,
                    color:'#d4dcc8',
                    borderBottom:'1px solid rgba(200,168,75,.08)',
                  }}>
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:14,
            }}>
              How It <em style={g}>Works</em>
            </h2>
            <p style={{
              textAlign:'center',
              color:'#b0c0a4',
              fontSize:14,
              lineHeight:1.7,
              maxWidth:560,
              margin:'0 auto 40px',
            }}>
              From signup to receiving your first enquiry — in 4 simple steps.
            </p>
            <div className="steps-grid" style={{
              display:'grid',
              gridTemplateColumns:'repeat(4,1fr)',
              gap:18,
            }}>
              {[
                {n:'01',ico:'📝',t:'Sign Up Free',d:'Create your account in 2 minutes. No credit card needed. Start your 1-month free trial instantly.'},
                {n:'02',ico:'🏢',t:'Build Profile',d:'Add your company info, services, contact details and ports. Takes 15 minutes — go live in 24 hours.'},
                {n:'03',ico:'🌍',t:'Get Listed',d:'Your business appears in searches at every port you operate. Visible to global maritime operators.'},
                {n:'04',ico:'📨',t:'Receive Leads',d:'Vessel operators contact you directly via phone, email or WhatsApp. No middleman, no commission.'},
              ].map(step => (
                <div key={step.n} className="card" style={{
                  background:'#111c13',
                  border:'1px solid rgba(200,168,75,.2)',
                  padding:'24px 20px',
                  position:'relative',
                  overflow:'hidden',
                }}>
                  <div style={{
                    fontFamily:lb,
                    fontSize:54,
                    fontWeight:700,
                    color:'rgba(200,168,75,.07)',
                    position:'absolute',
                    top:8,
                    right:12,
                    lineHeight:1,
                  }}>{step.n}</div>
                  <div style={{fontSize:28,marginBottom:12}}>{step.ico}</div>
                  <h3 style={{
                    fontFamily:lb,
                    fontSize:16,
                    fontWeight:700,
                    marginBottom:8,
                  }}>
                    {step.t}
                  </h3>
                  <p style={{
                    fontSize:12,
                    lineHeight:1.65,
                    color:'#b0c0a4',
                  }}>
                    {step.d}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* WHO IS LISTING */}
          <section style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:36,
            }}>
              Who&apos;s <em style={g}>Listing?</em>
            </h2>
            <div className="who-grid" style={{
              display:'grid',
              gridTemplateColumns:'repeat(3,1fr)',
              gap:18,
            }}>
              {[
                {ico:'🏢',t:'Ship Agents',d:'Port agency services for all vessel types. Customs clearance, crew change, bunker coordination, husbandry.',hl:'Be found by every vessel calling your port'},
                {ico:'⚓',t:'Shipchandlers',d:'Provisions, bonded stores, deck and engine supplies. Fresh, frozen and dry goods for vessels worldwide.',hl:'Direct provisions enquiries from operators'},
                {ico:'🔧',t:'Marine Services',d:'34 specialized categories: engine, electrical, diving, welding, BWTS, refrigeration, hydraulics, surveys.',hl:'Get listed in your specialty categories'},
              ].map(who => (
                <div key={who.t} className="card" style={{
                  background:'#111c13',
                  border:'1px solid rgba(200,168,75,.2)',
                  padding:'28px 24px',
                }}>
                  <div style={{fontSize:36,marginBottom:14}}>{who.ico}</div>
                  <h3 style={{
                    fontFamily:lb,
                    fontSize:20,
                    fontWeight:700,
                    marginBottom:10,
                  }}>
                    {who.t}
                  </h3>
                  <p style={{
                    fontSize:13,
                    lineHeight:1.7,
                    color:'#b0c0a4',
                    marginBottom:14,
                  }}>
                    {who.d}
                  </p>
                  <div style={{
                    padding:'9px 12px',
                    background:'rgba(200,168,75,.08)',
                    borderLeft:'3px solid #c8a84b',
                    fontFamily:rj,
                    fontSize:12,
                    fontWeight:600,
                    color:'#c8a84b',
                    fontStyle:'italic',
                  }}>
                    &quot;{who.hl}&quot;
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:14,
            }}>
              Simple, <em style={g}>Transparent</em> Pricing
            </h2>
            <p style={{
              textAlign:'center',
              color:'#b0c0a4',
              fontSize:14,
              lineHeight:1.7,
              maxWidth:560,
              margin:'0 auto 40px',
            }}>
              One flat monthly fee. No commission. No hidden costs. Cancel anytime.
            </p>
            <div className="price-grid" style={{
              display:'grid',
              gridTemplateColumns:'repeat(3,1fr)',
              gap:14,
              maxWidth:900,
              margin:'0 auto',
            }}>
              {[
                {name:'Free Trial',amt:'$0',per:'first month',badge:'🎁 START HERE',items:['1 month FREE','No credit card needed','Listed at all your ports','Full company profile','Cancel anytime']},
                {name:'Monthly',amt:'$99',per:'per month',badge:null,items:['After trial ends','Billed monthly','Cancel anytime','Listed at all your ports','Phone, email, WhatsApp visible','Verified badge']},
                {name:'Annual',amt:'$1,000',per:'per year',badge:'💰 SAVE $188',items:['~$83/month effective','Save $188 vs monthly','Priority listing','Featured placement','Priority support','Best value for serious providers']},
              ].map(tier => (
                <div key={tier.name} className="pricing-card" style={{
                  background:tier.badge?'linear-gradient(180deg,rgba(200,168,75,.08),transparent)':'#111c13',
                  border:`1px solid ${tier.badge?'#c8a84b':'rgba(200,168,75,.2)'}`,
                  padding:'30px 24px',
                  position:'relative',
                  display:'flex',
                  flexDirection:'column',
                }}>
                  {tier.badge && (
                    <div style={{
                      position:'absolute',
                      top:-12,
                      left:'50%',
                      transform:'translateX(-50%)',
                      background:'#c8a84b',
                      color:'#08100a',
                      fontFamily:rj,
                      fontSize:10,
                      letterSpacing:'1.5px',
                      fontWeight:700,
                      padding:'4px 12px',
                      whiteSpace:'nowrap',
                    }}>
                      {tier.badge}
                    </div>
                  )}
                  <div style={{
                    fontFamily:rj,
                    fontSize:11,
                    letterSpacing:'2px',
                    textTransform:'uppercase',
                    color:'#c8a84b',
                    marginBottom:10,
                    fontWeight:700,
                  }}>
                    {tier.name}
                  </div>
                  <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:16}}>
                    <span style={{fontFamily:lb,fontSize:38,fontWeight:700,lineHeight:1}}>{tier.amt}</span>
                    <span style={{fontFamily:rj,fontSize:12,color:'#7a8a72',fontWeight:600}}>{tier.per}</span>
                  </div>
                  <ul style={{listStyle:'none',flex:1,marginBottom:22,display:'flex',flexDirection:'column',gap:8}}>
                    {tier.items.map(item => (
                      <li key={item} style={{
                        fontSize:13,
                        color:'#b0c0a4',
                        display:'flex',
                        alignItems:'flex-start',
                        gap:8,
                        lineHeight:1.5,
                      }}>
                        <span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/" className="btn-gold" style={{
                    padding:12,
                    background:tier.badge?'#c8a84b':'transparent',
                    border:'1px solid rgba(200,168,75,.4)',
                    color:tier.badge?'#08100a':'#c8a84b',
                    fontFamily:rj,
                    fontSize:12,
                    letterSpacing:'2px',
                    textTransform:'uppercase',
                    fontWeight:700,
                    cursor:'pointer',
                    textDecoration:'none',
                    textAlign:'center',
                  }}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section style={{marginBottom:80}}>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(26px,3vw,36px)',
              fontWeight:700,
              textAlign:'center',
              marginBottom:36,
            }}>
              Frequently <em style={g}>Asked Questions</em>
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:780,margin:'0 auto'}}>
              {[
                {q:'Do I need a credit card to start the free trial?',a:'No. The 1-month free trial requires no credit card upfront. You only add payment if you decide to continue after the trial ends. If you cancel before the 30 days, you won\'t be charged anything.'},
                {q:'How long until I receive my first enquiry?',a:'Most providers receive their first enquiry within 7-14 days of going live. Search volume varies by port — busy hubs like Singapore, Rotterdam and Suez see daily activity. Less busy ports may take longer but still generate quality leads over time.'},
                {q:'Can I list my business at multiple ports?',a:'Yes. You can list your business at all the ports where you operate. There\'s no limit on the number of ports. If you serve 10 ports, your business appears in 10 separate searches — all under the same monthly fee.'},
                {q:'Do you take commission on deals?',a:'Absolutely not. PortServiceFinder is a directory subscription service. You pay $99/month flat fee — we never take a cut of your deals. Every contract you sign with operators is 100% yours.'},
                {q:'What if I\'m not happy with the service?',a:'Cancel anytime — no questions asked, no exit fees. Your listing is removed within 24 hours of cancellation. We\'re confident in the value we provide, but we never lock you in.'},
                {q:'How are operators verified?',a:'Vessel operators access our directory for free. While they don\'t pay, they\'re real maritime professionals — shipowners, fleet managers, charterers, agents and captains searching for services at specific ports. Quality is high because the directory solves a real industry need.'},
                {q:'Is there an enterprise plan for large companies?',a:'Yes. For agencies operating at 20+ ports or large maritime groups, we offer custom enterprise plans with priority placement, dedicated support and advanced analytics. Contact us to discuss.'},
              ].map((faq,i) => (
                <details key={i} className="faq-item" style={{
                  background:'#111c13',
                  border:'1px solid rgba(200,168,75,.18)',
                  padding:'16px 22px',
                }}>
                  <summary style={{
                    cursor:'pointer',
                    fontFamily:rj,
                    fontSize:14,
                    fontWeight:700,
                    color:'#c8a84b',
                    letterSpacing:'.5px',
                  }}>
                    {faq.q}
                  </summary>
                  <p style={{
                    marginTop:12,
                    fontSize:13,
                    lineHeight:1.75,
                    color:'#d4dcc8',
                  }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* BIG CTA */}
          <section style={{
            padding:'60px 40px',
            background:'linear-gradient(135deg,rgba(200,168,75,.12),rgba(200,168,75,.04))',
            border:'1px solid rgba(200,168,75,.4)',
            textAlign:'center',
          }}>
            <div style={{
              fontFamily:rj,
              fontSize:11,
              letterSpacing:'3px',
              textTransform:'uppercase',
              color:'#c8a84b',
              marginBottom:14,
              fontWeight:700,
            }}>
              ⭐ Limited Founding Member Offer ⭐
            </div>
            <h2 style={{
              fontFamily:lb,
              fontSize:'clamp(28px,3.5vw,42px)',
              fontWeight:700,
              lineHeight:1.05,
              marginBottom:14,
            }}>
              Ready to Grow Your <em style={g}>Maritime Business?</em>
            </h2>
            <p style={{
              fontSize:15,
              color:'#d4dcc8',
              maxWidth:540,
              margin:'0 auto 28px',
              lineHeight:1.7,
            }}>
              Join the providers already growing through PortServiceFinder. Start your 1-month free trial today — no credit card required, cancel anytime.
            </p>
            <Link href="/" className="btn-gold" style={{
              display:'inline-block',
              background:'#c8a84b',
              color:'#08100a',
              padding:'16px 44px',
              fontFamily:rj,
              fontSize:14,
              letterSpacing:'2.5px',
              textTransform:'uppercase',
              fontWeight:700,
              textDecoration:'none',
              marginBottom:14,
            }}>
              Start Free Trial →
            </Link>
            <div style={{
              fontFamily:rj,
              fontSize:11,
              color:'#7a8a72',
              fontWeight:600,
            }}>
              🔒 No card required · ⚡ Live in 24h · ❌ Cancel anytime
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <footer style={{
          borderTop:'1px solid rgba(200,168,75,.15)',
          padding:'40px 48px',
        }}>
          <div className="ftgrid" style={{
            display:'grid',
            gridTemplateColumns:'2fr 1fr 1fr',
            gap:36,
            marginBottom:24,
            maxWidth:1100,
            margin:'0 auto 24px',
          }}>
            <div>
              <div style={{
                fontFamily:lb,
                fontSize:18,
                fontWeight:700,
                letterSpacing:1,
                marginBottom:10,
              }}>
                PortService<span style={g}>Finder</span>
              </div>
              <p style={{
                fontSize:12,
                color:'#7a8a72',
                lineHeight:1.7,
                maxWidth:260,
                marginBottom:10,
              }}>
                The global maritime services directory. Built by seafarers, for the industry.
              </p>
              <a href="mailto:portservicefinder@gmail.com" style={{
                fontSize:12,
                color:'rgba(200,168,75,.6)',
                textDecoration:'none',
              }}>
                portservicefinder@gmail.com
              </a>
            </div>
            <div>
              <h4 style={{
                fontFamily:rj,
                fontSize:10,
                letterSpacing:'2px',
                textTransform:'uppercase',
                color:'#c8a84b',
                marginBottom:12,
                fontWeight:700,
              }}>Quick Links</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Home / Search</Link></li>
                <li><Link href="/#pricing" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Pricing</Link></li>
                <li><Link href="/#how" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{
                fontFamily:rj,
                fontSize:10,
                letterSpacing:'2px',
                textTransform:'uppercase',
                color:'#c8a84b',
                marginBottom:12,
                fontWeight:700,
              }}>For Providers</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/for-providers" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Why Join Us</Link></li>
                <li><Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>List Your Business</Link></li>
                <li><Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Free Trial</Link></li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop:'1px solid rgba(200,168,75,.1)',
            paddingTop:14,
            textAlign:'center',
            fontFamily:rj,
            fontSize:10,
            color:'#3a3a2a',
            letterSpacing:1,
            fontWeight:600,
          }}>
            © 2026 PortServiceFinder. All rights reserved. · MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH
          </div>
        </footer>

      </div>
    </>
  );
}
