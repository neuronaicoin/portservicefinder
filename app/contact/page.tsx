'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const g = { color: '#c8a84b' } as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (!form.subject.trim()) return setError('Please enter a subject.');
    if (!form.message.trim()) return setError('Please write a message.');

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.errors?.[0]?.message || `Submission failed (status ${response.status}). Please try again.`;
        setError(msg);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

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
        .btn-gold:disabled{cursor:wait;transform:none;box-shadow:none;filter:none;}
        .btn-ghost{transition:background .25s ease, color .25s ease, border-color .25s ease;}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        .form-input:focus{border-color:#c8a84b!important;outline:none;}
        .info-card{transition:border-color .3s ease;}
        .info-card:hover{border-color:rgba(200,168,75,.4)!important;}
        .logo-mark{filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
        @media(max-width:768px){
          nav{padding:0 16px!important;}
          .logo-text{font-size:16px!important;}
          .hero-pad{padding:100px 16px 36px!important;}
          .hero-h1{font-size:clamp(28px,7vw,42px)!important;}
          .sec-pad{padding:36px 16px!important;}
          .contact-grid{grid-template-columns:1fr!important;}
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
            Contact
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginLeft:12,opacity:.5}}/>
          </div>
          <h1 className="hero-h1" style={{fontFamily:lb,fontSize:'clamp(32px,4vw,52px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1.2,marginBottom:20}}>
            Get in <em style={g}>Touch</em>
          </h1>
          <p style={{fontSize:15,lineHeight:1.8,color:'#d4dcc8',maxWidth:580,margin:'0 auto'}}>
            Questions, feedback, partnership inquiries, or technical issues &mdash; we read every message and reply within 24 hours.
          </p>
        </section>

        {/* CONTACT GRID */}
        <section className="sec-pad" style={{padding:'30px 48px 80px'}}>
          <div className="contact-grid" style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:32,maxWidth:1080,margin:'0 auto',alignItems:'flex-start'}}>

            {/* FORM */}
            <div style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.2)',padding:'30px 30px'}}>
              <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:10,fontWeight:700}}>Send a Message</div>
              <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:20}}>How can we <em style={g}>help?</em></h2>

              {submitted ? (
                <div style={{padding:'30px 24px',background:'rgba(76,175,118,.08)',border:'1px solid rgba(76,175,118,.35)',textAlign:'center'}}>
                  <div style={{fontSize:42,color:'#4caf76',marginBottom:14}}>✓</div>
                  <h3 style={{fontFamily:lb,fontSize:20,fontWeight:700,marginBottom:8,color:'#f5f0e8'}}>Message Received</h3>
                  <p style={{fontSize:13,color:'#b5bfa8',lineHeight:1.7,marginBottom:18}}>
                    Thank you for reaching out. We&apos;ve received your message and will reply to <strong style={{color:'#f5f0e8'}}>{form.email||'your email'}</strong> within 24 hours.
                  </p>
                  <button onClick={()=>setSubmitted(false)} className="btn-ghost" style={{background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',padding:'10px 20px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>Send Another</button>
                </div>
              ) : (
                <>
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>Name *</label>
                    <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} disabled={submitting} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.22)',color:'#f5f0e8',padding:'10px 12px',fontSize:13,width:'100%',fontFamily:"'Outfit',sans-serif"}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>Email *</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} disabled={submitting} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.22)',color:'#f5f0e8',padding:'10px 12px',fontSize:13,width:'100%',fontFamily:"'Outfit',sans-serif"}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>Subject *</label>
                    <input className="form-input" type="text" placeholder="What's this about?" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} disabled={submitting} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.22)',color:'#f5f0e8',padding:'10px 12px',fontSize:13,width:'100%',fontFamily:"'Outfit',sans-serif"}}/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={{display:'block',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>Message *</label>
                    <textarea className="form-input" placeholder="Write your message here..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} disabled={submitting} maxLength={2000} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.22)',color:'#f5f0e8',padding:'10px 12px',fontSize:13,width:'100%',fontFamily:"'Outfit',sans-serif",resize:'vertical',minHeight:130}}/>
                    <div style={{fontFamily:rj,fontSize:9,color:'#5a6a52',marginTop:4,textAlign:'right'}}>{form.message.length}/2000</div>
                  </div>

                  {error&&(<div style={{padding:'9px 12px',background:'rgba(220,80,80,.1)',border:'1px solid rgba(220,80,80,.4)',color:'#ff8a8a',fontSize:12,fontFamily:rj,marginBottom:12,fontWeight:600}}>⚠ {error}</div>)}

                  <button className="btn-gold" onClick={handleSubmit} disabled={submitting} style={{width:'100%',padding:12,background:submitting?'#7a6730':'#c8a84b',border:'none',color:'#08100a',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:submitting?'wait':'pointer',opacity:submitting?0.7:1}}>
                    {submitting?'⏳ Sending...':'Send Message →'}
                  </button>
                  <p style={{fontSize:10,color:'#7a8a72',textAlign:'center',marginTop:8,lineHeight:1.6,fontFamily:rj}}>We reply within 24 hours · Your data is never shared</p>
                </>
              )}
            </div>

            {/* SIDE INFO */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="info-card" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.2)',padding:'22px 22px'}}>
                <div style={{fontSize:22,marginBottom:10}}>📧</div>
                <h3 style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>Email</h3>
                <a href="mailto:portservicefinder@gmail.com" style={{fontSize:14,color:'#f5f0e8',textDecoration:'none',wordBreak:'break-all'}}>portservicefinder@gmail.com</a>
              </div>

              <div className="info-card" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.2)',padding:'22px 22px'}}>
                <div style={{fontSize:22,marginBottom:10}}>📍</div>
                <h3 style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>Coverage</h3>
                <div style={{fontSize:14,color:'#f5f0e8',fontWeight:700,letterSpacing:'.5px'}}>SERVING GLOBAL WORLDWIDE</div>
              </div>

              <div className="info-card" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.2)',padding:'22px 22px'}}>
                <div style={{fontSize:22,marginBottom:10}}>⏰</div>
                <h3 style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>Response Time</h3>
                <div style={{fontSize:14,color:'#f5f0e8'}}>Within 24 hours</div>
                <div style={{fontSize:11,color:'#7a8a72',marginTop:3,fontFamily:rj}}>Usually much faster</div>
              </div>

              <div style={{background:'rgba(200,168,75,.05)',border:'1px solid rgba(200,168,75,.18)',padding:'18px 20px',marginTop:6}}>
                <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,marginBottom:8}}>Looking for something else?</div>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7,fontSize:12}}>
                  <li><Link href="/faq" className="footer-link" style={{color:'#b0c0a4',textDecoration:'none'}}>→ Browse FAQ</Link></li>
                  <li><Link href="/for-providers" className="footer-link" style={{color:'#b0c0a4',textDecoration:'none'}}>→ Provider information</Link></li>
                  <li><Link href="/" className="footer-link" style={{color:'#b0c0a4',textDecoration:'none'}}>→ Search ports</Link></li>
                </ul>
              </div>
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
              <a href="mailto:portservicefinder@gmail.com" className="footer-link" style={{fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>portservicefinder@gmail.com</a>
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
