import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FLAG,
  PROVIDERS,
  getAllPorts,
  getProvidersForPort,
  portToSlug,
  slugToPort,
} from '../../data/providers';

export async function generateStaticParams() {
  const allPorts = getAllPorts();
  return allPorts.map((p) => ({ port: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ port: string }>;
}): Promise<Metadata> {
  const { port: portSlug } = await params;
  const portName = slugToPort(portSlug);

  if (!portName) {
    return { title: 'Port Not Found — PortServiceFinder' };
  }

  const providers = getProvidersForPort(portName);
  const country = providers[0]?.country || '';
  const agentCount = providers.filter((p) => p.type === 'agent').length;
  const chandlerCount = providers.filter((p) => p.type === 'chandler').length;
  const serviceCount = providers.filter((p) => p.type === 'service').length;

  const title = `Ship Agents, Shipchandlers & Marine Services in ${portName}, ${country} | PortServiceFinder`;
  const description = `Find verified ship agents (${agentCount}), shipchandlers (${chandlerCount}) and marine services (${serviceCount}) at ${portName} Port, ${country}. Free directory for vessel operators and shipowners.`;

  return {
    title,
    description,
    keywords: [
      `${portName} ship agent`,
      `${portName} shipchandler`,
      `${portName} marine services`,
      `${portName} port`,
      `${portName} bunker supply`,
      `ship agency ${portName}`,
      `${country} ship agents`,
    ],
    openGraph: {
      title,
      description,
      url: `https://www.portservicefinder.com/ports/${portSlug}`,
      siteName: 'PortServiceFinder',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.portservicefinder.com/ports/${portSlug}`,
    },
  };
}

export default async function PortPage({
  params,
}: {
  params: Promise<{ port: string }>;
}) {
  const { port: portSlug } = await params;
  const portName = slugToPort(portSlug);

  if (!portName) {
    notFound();
  }

  const providers = getProvidersForPort(portName);
  const country = providers[0]?.country || 'Unknown';
  const flag = FLAG[country] || '';

  const agents = providers.filter((p) => p.type === 'agent');
  const chandlers = providers.filter((p) => p.type === 'chandler');
  const services = providers.filter((p) => p.type === 'service');

  const offeredServices = new Set<string>();
  services.forEach((s) => s.svc.forEach((k) => offeredServices.add(k)));

  const sameCountryPorts = Array.from(
    new Set(
      PROVIDERS.filter((p) => p.country === country).flatMap((p) => p.ports)
    )
  )
    .filter((p) => p !== portName)
    .slice(0, 6);

  const lb = "'Libre Baskerville',serif";
  const rj = "'Rajdhani',sans-serif";
  const g = { color: '#c8a84b' } as React.CSSProperties;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .port-link:hover{color:#c8a84b!important;}
        .pcard{transition:border-color .3s ease, transform .25s ease, box-shadow .25s ease;}
        .pcard:hover{border-color:#c8a84b!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
        .nearby:hover{background:rgba(200,168,75,.15)!important;color:#c8a84b!important;}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        @media(max-width:768px){
          .nav-cta{font-size:11px!important;padding:7px 14px!important;}
          .port-hero{padding:90px 20px 40px!important;}
          .port-hero h1{font-size:clamp(26px,6vw,38px)!important;}
          .port-content{padding:36px 20px!important;}
          .facts{grid-template-columns:1fr 1fr!important;}
          .pgrid{grid-template-columns:1fr!important;}
          .ftgrid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh'}}>

        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
          <Link href="/" style={{fontFamily:lb,fontSize:22,fontWeight:700,letterSpacing:1,textDecoration:'none',color:'#f5f0e8'}}>
            PortService<span style={g}>Finder</span>
          </Link>
          <Link href="/" className="btn-gold nav-cta" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'8px 18px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap'}}>
            Back to Search
          </Link>
        </nav>

        <section className="port-hero" style={{padding:'120px 48px 60px',textAlign:'center',borderBottom:'1px solid rgba(200,168,75,.15)'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>
            Maritime Services Directory
          </div>
          <h1 style={{fontFamily:lb,fontSize:'clamp(32px,4vw,52px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1,marginBottom:14}}>
            <span style={{fontSize:'1em'}}>{flag}</span> Ship Agents and Marine Services in <em style={g}>{portName}</em>, {country}
          </h1>
          <p style={{fontSize:15,lineHeight:1.7,color:'#b5bfa8',maxWidth:580,margin:'0 auto 22px'}}>
            Find verified ship agents ({agents.length}), shipchandlers ({chandlers.length}) and marine service companies ({services.length}) at {portName} Port. Free to search. 24/7 maritime operations.
          </p>
          <div style={{display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap',fontFamily:rj,fontSize:12,color:'#b5bfa8',fontWeight:600}}>
            <span><strong style={g}>{providers.length}</strong> Verified Providers</span>
            <span><strong style={g}>{offeredServices.size}</strong> Service Categories</span>
            <span><strong style={g}>24/7</strong> Operations</span>
          </div>
        </section>

        <div className="port-content" style={{maxWidth:1200,margin:'0 auto',padding:'60px 48px'}}>

          <section style={{marginBottom:56}}>
            <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:18}}>
              Port <em style={g}>Quick Facts</em>
            </h2>
            <div className="facts" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(200,168,75,.15)'}}>
              {[
                {l:'Port Name',v:portName},
                {l:'Country',v:`${flag} ${country}`},
                {l:'Service Providers',v:providers.length.toString()},
                {l:'Operating Hours',v:'24/7'},
              ].map(f => (
                <div key={f.l} style={{background:'#0c1610',padding:'18px 14px',textAlign:'center'}}>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:6,fontWeight:600}}>{f.l}</div>
                  <div style={{fontFamily:lb,fontSize:17,fontWeight:700,color:'#c8a84b',lineHeight:1.2}}>{f.v}</div>
                </div>
              ))}
            </div>
          </section>

          {agents.length > 0 && (
            <section style={{marginBottom:56}}>
              <h2 style={{fontFamily:lb,fontSize:26,fontWeight:700,marginBottom:6}}>
                Ship Agents in <em style={g}>{portName}</em> ({agents.length})
              </h2>
              <p style={{color:'#b0c0a4',fontSize:13,marginBottom:22,lineHeight:1.7}}>
                Verified port agency services at {portName} Port for bulk carriers, tankers, container vessels and general cargo.
              </p>
              <div className="pgrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
                {agents.map(p => (
                  <ProviderCard key={p.id} provider={p} flag={FLAG[p.country]||''} />
                ))}
              </div>
            </section>
          )}

          {chandlers.length > 0 && (
            <section style={{marginBottom:56}}>
              <h2 style={{fontFamily:lb,fontSize:26,fontWeight:700,marginBottom:6}}>
                Shipchandlers in <em style={g}>{portName}</em> ({chandlers.length})
              </h2>
              <p style={{color:'#b0c0a4',fontSize:13,marginBottom:22,lineHeight:1.7}}>
                Premium ship supply companies serving {portName}. Fresh provisions, bonded stores, technical spares. 24/7 delivery.
              </p>
              <div className="pgrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
                {chandlers.map(p => (
                  <ProviderCard key={p.id} provider={p} flag={FLAG[p.country]||''} />
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section style={{marginBottom:56}}>
              <h2 style={{fontFamily:lb,fontSize:26,fontWeight:700,marginBottom:6}}>
                Marine Services in <em style={g}>{portName}</em> ({services.length})
              </h2>
              <p style={{color:'#b0c0a4',fontSize:13,marginBottom:22,lineHeight:1.7}}>
                Technical service companies at {portName}: engine, electrical, hull diving, BWTS, welding, refrigeration. Class-approved.
              </p>
              <div className="pgrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
                {services.map(p => (
                  <ProviderCard key={p.id} provider={p} flag={FLAG[p.country]||''} />
                ))}
              </div>
            </section>
          )}

          {providers.length === 0 && (
            <section style={{marginBottom:56,padding:'40px 30px',background:'rgba(200,168,75,.05)',border:'1px solid rgba(200,168,75,.2)',textAlign:'center'}}>
              <h3 style={{fontFamily:lb,fontSize:20,marginBottom:10}}>
                No providers listed yet for {portName}
              </h3>
              <p style={{color:'#b0c0a4',fontSize:14,marginBottom:18,lineHeight:1.7}}>
                Be the first provider at {portName} Port. Get listed on PortServiceFinder — 1 month free trial, no card required.
              </p>
              <Link href="/" className="btn-gold" style={{display:'inline-block',background:'#c8a84b',color:'#08100a',padding:'12px 30px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>
                List Your Business
              </Link>
            </section>
          )}

          <section style={{marginBottom:56}}>
            <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:14}}>
              About <em style={g}>{portName}</em> Port
            </h2>
            <div style={{fontSize:14,lineHeight:1.8,color:'#d4dcc8'}}>
              <p style={{marginBottom:14}}>
                {portName} is a key maritime gateway in {country}, serving as an important hub for international trade and shipping operations. Vessels of all types call at {portName} for cargo operations, bunker supply, crew change, technical services, and provisions.
              </p>
              <p style={{marginBottom:14}}>
                The port operates around the clock with established port agency services, qualified shipchandlers, and specialized marine service companies. Whether you need pre-arrival documentation, customs clearance, underwater hull cleaning, main engine repair, or fresh provisions, {portName} maritime service providers are equipped to handle vessel calls efficiently.
              </p>
              <p>
                PortServiceFinder lists verified, professional service providers at {portName} Port. All listings are free to browse for shipowners, operators, charterers and vessel captains.
              </p>
            </div>
          </section>

          {sameCountryPorts.length > 0 && (
            <section style={{marginBottom:56}}>
              <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:14}}>
                Other Ports in <em style={g}>{country}</em>
              </h2>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {sameCountryPorts.map(p => (
                  <Link key={p} href={`/ports/${portToSlug(p)}`} className="nearby" style={{padding:'10px 18px',background:'rgba(200,168,75,.06)',border:'1px solid rgba(200,168,75,.25)',color:'#f5f0e8',textDecoration:'none',fontFamily:rj,fontSize:13,fontWeight:600,letterSpacing:'.5px',transition:'all .25s ease'}}>
                    {flag} {p}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section style={{marginTop:56,padding:'40px 30px',background:'linear-gradient(180deg,rgba(200,168,75,.07),transparent)',border:'1px solid rgba(200,168,75,.3)',textAlign:'center'}}>
            <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:10}}>
              Are You a Service Provider in <em style={g}>{portName}</em>?
            </h2>
            <p style={{fontSize:14,color:'#b5bfa8',maxWidth:500,margin:'0 auto 22px',lineHeight:1.7}}>
              Get found by shipowners, operators and charterers worldwide. List your business on PortServiceFinder — 1 month free trial, no card required.
            </p>
            <Link href="/" className="btn-gold" style={{display:'inline-block',background:'#c8a84b',color:'#08100a',padding:'14px 32px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>
              List Your Business
            </Link>
          </section>

        </div>

        <footer style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'40px 48px',marginTop:40}}>
          <div className="ftgrid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:36,marginBottom:24,maxWidth:1200,margin:'0 auto 24px'}}>
            <div>
              <div style={{fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1,marginBottom:10}}>
                PortService<span style={g}>Finder</span>
              </div>
              <p style={{fontSize:12,color:'#7a8a72',lineHeight:1.7,maxWidth:240,marginBottom:10}}>
                The global maritime services directory.
              </p>
              <a href="mailto:portservicefinder@gmail.com" style={{fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>
                portservicefinder@gmail.com
              </a>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Quick Links</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" className="port-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Home</Link></li>
                <li><Link href="/#how" className="port-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>How It Works</Link></li>
                <li><Link href="/#pricing" className="port-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>For Providers</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/for-providers" className="port-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Why Join Us</Link></li>
                <li><Link href="/" className="port-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>List Your Business</Link></li>
              </ul>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(200,168,75,.1)',paddingTop:14,textAlign:'center',fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1,fontWeight:600}}>
            © 2026 PortServiceFinder. All rights reserved. · MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH
          </div>
        </footer>

      </div>
    </>
  );
}

function ProviderCard({ provider, flag }: { provider: typeof PROVIDERS[0]; flag: string }) {
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <div className="pcard" style={{background:'#111c13',border:'1px solid rgba(200,168,75,.2)',padding:'18px 20px',display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <div style={{width:42,height:42,background:'rgba(200,168,75,.1)',border:'1px solid rgba(200,168,75,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
          {provider.ico}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:lb,fontSize:15,fontWeight:700,marginBottom:2,display:'flex',alignItems:'center',gap:6}}>
            <span>{provider.name}</span>
            <span style={{fontSize:14,lineHeight:1}}>{flag}</span>
          </div>
          <div style={{fontFamily:rj,fontSize:9,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700}}>
            {provider.type === 'agent' ? 'Ship Agent' : provider.type === 'chandler' ? 'Shipchandler' : 'Marine Service'} · {provider.country}
          </div>
        </div>
      </div>
      <p style={{fontSize:12,lineHeight:1.55,color:'#b0c0a4'}}>
        {provider.bio.length > 140 ? provider.bio.slice(0, 140) + '...' : provider.bio}
      </p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:'auto'}}>
        <a href={`tel:${provider.phone.replace(/\s/g,'')}`} style={{padding:'8px 10px',background:'#c8a84b',color:'#08100a',textDecoration:'none',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,textAlign:'center'}}>
          Call
        </a>
        <a href={`mailto:${provider.email}`} style={{padding:'8px 10px',background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',textDecoration:'none',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,textAlign:'center'}}>
          Email
        </a>
      </div>
    </div>
  );
}
