import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FLAG,
  PROVIDERS,
  getAllPorts,
  portToSlug,
  slugToPort,
} from '../../../data/providers';
import {
  SERVICE_CATEGORIES,
  getServiceBySlug,
  getAllServiceSlugs,
} from '@/lib/services-config';
import { siteConfig } from '@/lib/site-config';

// ============================================================
// Generate all valid port × service combinations
// ============================================================
export async function generateStaticParams() {
  const allPorts = getAllPorts();
  const allServices = getAllServiceSlugs();

  // Generate ALL combinations - empty ones get noindex
  const params: { port: string; service: string }[] = [];
  allPorts.forEach((port) => {
    allServices.forEach((service) => {
      params.push({
        port: port.slug,
        service: service,
      });
    });
  });

  return params;
}

// ============================================================
// Filter providers for this port × service combination
// ============================================================
function getProvidersForCombo(portName: string, serviceCategory: typeof SERVICE_CATEGORIES[0]) {
  return PROVIDERS.filter((p) => {
    // Must serve this port
    if (!p.ports.includes(portName)) return false;

    // For agent/chandler types - direct match
    if (serviceCategory.type === 'agent') return p.type === 'agent';
    if (serviceCategory.type === 'chandler') return p.type === 'chandler';

    // For service types - check specific svc key
    if (serviceCategory.type === 'service') {
      if (p.type !== 'service') return false;
      if (serviceCategory.svcKey && !p.svc.includes(serviceCategory.svcKey)) return false;
      return true;
    }

    return false;
  });
}

// ============================================================
// Generate metadata for SEO + AI search
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ port: string; service: string }>;
}): Promise<Metadata> {
  const { port: portSlug, service: serviceSlug } = await params;
  const portName = slugToPort(portSlug);
  const serviceCategory = getServiceBySlug(serviceSlug);

  if (!portName || !serviceCategory) {
    return { title: 'Not Found | PortServiceFinder' };
  }

  const providers = getProvidersForCombo(portName, serviceCategory);
  const country = providers[0]?.country ||
    PROVIDERS.find((p) => p.ports.includes(portName))?.country || '';
  const flag = FLAG[country] || '';

  // CRITICAL: Empty combinations get noindex (avoid Google penalty)
  if (providers.length === 0) {
    return {
      title: `${portName} ${serviceCategory.label} | PortServiceFinder`,
      description: `${serviceCategory.label} services at ${portName}${country ? `, ${country}` : ''}. Listings coming soon.`,
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  // SEO-rich metadata for populated combinations
  const title = `${portName} ${serviceCategory.label} | ${siteConfig.name}`;
  const description = `Find ${providers.length} verified ${serviceCategory.shortLabel.toLowerCase()} provider${providers.length !== 1 ? 's' : ''} at ${portName}${country ? `, ${country}` : ''}. ${serviceCategory.description}. Free for vessel operators. No commission.`;

  return {
    title,
    description,
    keywords: [
      `${portName} ${serviceCategory.label}`,
      `${serviceCategory.label} ${portName}`,
      `${portName} ${serviceCategory.shortLabel}`,
      `${serviceCategory.shortLabel} ${portName}`,
      `find ${serviceCategory.shortLabel.toLowerCase()} ${portName}`,
      `best ${serviceCategory.shortLabel.toLowerCase()} ${portName}`,
      `${portName} ${serviceCategory.shortLabel.toLowerCase()} providers`,
      `${portName} ${serviceCategory.shortLabel.toLowerCase()} companies`,
      `${portName} ${serviceCategory.shortLabel.toLowerCase()} services`,
      `${portName} ${serviceCategory.shortLabel.toLowerCase()} list`,
      `${portName} ${serviceCategory.shortLabel.toLowerCase()} directory`,
      ...serviceCategory.keywords,
      portName,
      country,
    ],
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/ports/${portSlug}/${serviceSlug}`,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${siteConfig.url}/ports/${portSlug}/${serviceSlug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ============================================================
// PAGE COMPONENT
// ============================================================
export default async function PortServicePage({
  params,
}: {
  params: Promise<{ port: string; service: string }>;
}) {
  const { port: portSlug, service: serviceSlug } = await params;
  const portName = slugToPort(portSlug);
  const serviceCategory = getServiceBySlug(serviceSlug);

  if (!portName || !serviceCategory) {
    notFound();
  }

  const providers = getProvidersForCombo(portName, serviceCategory);
  const country = providers[0]?.country ||
    PROVIDERS.find((p) => p.ports.includes(portName))?.country || 'Unknown';
  const flag = FLAG[country] || '';

  // Other services available at this port (for cross-linking)
  const portProviders = PROVIDERS.filter((p) => p.ports.includes(portName));
  const otherServicesAtPort = SERVICE_CATEGORIES.filter((cat) => {
    if (cat.slug === serviceSlug) return false;
    const count = getProvidersForCombo(portName, cat).length;
    return count > 0;
  }).slice(0, 8);

  const lb = "'Libre Baskerville',serif";
  const rj = "'Rajdhani',sans-serif";
  const g = { color: '#c8a84b' } as React.CSSProperties;

  // ============================================================
  // Service Schema (B2B Maritime Service)
  // ============================================================
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${serviceCategory.label} at ${portName}`,
    description: serviceCategory.longDescription,
    serviceType: 'Maritime B2B Service',
    category: 'Marine Services',
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      alternateName: siteConfig.alternateName,
      url: siteConfig.url,
    },
    areaServed: {
      '@type': 'Place',
      name: `${portName}, ${country}`,
    },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Vessel operators, shipowners, ship managers, technical superintendents',
    },
  };

  // Breadcrumb Schema for AI/SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Ports', item: `${siteConfig.url}/` },
      { '@type': 'ListItem', position: 3, name: portName, item: `${siteConfig.url}/ports/${portSlug}` },
      { '@type': 'ListItem', position: 4, name: serviceCategory.label, item: `${siteConfig.url}/ports/${portSlug}/${serviceSlug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .link:hover{color:#c8a84b!important;}
        .pcard{transition:border-color .3s ease, transform .25s ease, box-shadow .25s ease;}
        .pcard:hover{border-color:#c8a84b!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
        .other-svc:hover{background:rgba(200,168,75,.15)!important;color:#c8a84b!important;}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        @media(max-width:768px){
          .nav-cta{font-size:11px!important;padding:7px 14px!important;}
          .hero-sec{padding:90px 20px 40px!important;}
          .hero-sec h1{font-size:clamp(22px,5.5vw,32px)!important;}
          .content-sec{padding:30px 20px!important;}
          .crumb{font-size:11px!important;}
          .pgrid{grid-template-columns:1fr!important;}
          .other-grid{grid-template-columns:1fr 1fr!important;}
          .ftgrid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh'}}>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
          <Link href="/" style={{fontFamily:lb,fontSize:22,fontWeight:700,letterSpacing:1,textDecoration:'none',color:'#f5f0e8'}}>
            PortService<span style={g}>Finder</span>
          </Link>
          <Link href="/" className="btn-gold nav-cta" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'8px 18px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap'}}>
            Back to Search
          </Link>
        </nav>

        {/* HERO + BREADCRUMB */}
        <section className="hero-sec" style={{padding:'110px 48px 48px',textAlign:'center',borderBottom:'1px solid rgba(200,168,75,.15)'}}>

          {/* Breadcrumb */}
          <div className="crumb" style={{fontFamily:rj,fontSize:12,color:'#7a8a72',marginBottom:14,letterSpacing:'.5px'}}>
            <Link href="/" className="link" style={{color:'#7a8a72',textDecoration:'none'}}>Home</Link>
            <span style={{margin:'0 8px',color:'#3a4a32'}}>/</span>
            <Link href={`/ports/${portSlug}`} className="link" style={{color:'#7a8a72',textDecoration:'none'}}>{portName}</Link>
            <span style={{margin:'0 8px',color:'#3a4a32'}}>/</span>
            <span style={{color:'#c8a84b'}}>{serviceCategory.shortLabel}</span>
          </div>

          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>
            {flag} {country} · Maritime Services Directory
          </div>

          <h1 style={{fontFamily:lb,fontSize:'clamp(28px,4vw,48px)',fontWeight:700,lineHeight:1.1,letterSpacing:-1,marginBottom:14,maxWidth:920,margin:'0 auto 14px'}}>
            {portName} <em style={g}>{serviceCategory.label}</em>
          </h1>

          <p style={{fontSize:15,lineHeight:1.7,color:'#b5bfa8',maxWidth:680,margin:'0 auto 22px'}}>
            {providers.length > 0
              ? `Find ${providers.length} verified ${serviceCategory.shortLabel.toLowerCase()} provider${providers.length !== 1 ? 's' : ''} at ${portName}, ${country}. ${serviceCategory.description}.`
              : `${serviceCategory.description}. New providers being added.`
            }
          </p>

          <div style={{display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap',fontFamily:rj,fontSize:12,color:'#b5bfa8',fontWeight:600}}>
            <span><strong style={g}>{providers.length}</strong> Verified Provider{providers.length !== 1 ? 's' : ''}</span>
            <span><strong style={g}>{country}</strong></span>
            <span><strong style={g}>24/7</strong> Operations</span>
          </div>
        </section>

        <div className="content-sec" style={{maxWidth:1180,margin:'0 auto',padding:'50px 48px'}}>

          {/* SERVICE DESCRIPTION (SEO content) */}
          <section style={{marginBottom:48}}>
            <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:14}}>
              About <em style={g}>{serviceCategory.label}</em> at {portName}
            </h2>
            <div style={{fontSize:14,lineHeight:1.8,color:'#d4dcc8'}}>
              <p style={{marginBottom:14}}>
                {serviceCategory.longDescription}
              </p>
              <p>
                At {portName} Port in {country}, vessel operators have access to{' '}
                {providers.length > 0 ? `${providers.length} verified provider${providers.length !== 1 ? 's' : ''}` : 'a growing network of marine service providers'} for {serviceCategory.shortLabel.toLowerCase()} services. PortServiceFinder makes it simple to find, evaluate, and contact the right provider — directly, with no commission or middleman.
              </p>
            </div>
          </section>

          {/* PROVIDERS LIST */}
          {providers.length > 0 ? (
            <section style={{marginBottom:48}}>
              <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:14}}>
                {serviceCategory.shortLabel} Providers at <em style={g}>{portName}</em>
              </h2>
              <div className="pgrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} flag={FLAG[p.country] || ''} />
                ))}
              </div>
            </section>
          ) : (
            <section style={{marginBottom:48,padding:'40px 30px',background:'rgba(200,168,75,.05)',border:'1px solid rgba(200,168,75,.2)',textAlign:'center'}}>
              <h3 style={{fontFamily:lb,fontSize:20,marginBottom:10}}>
                No {serviceCategory.shortLabel.toLowerCase()} providers listed yet at {portName}
              </h3>
              <p style={{color:'#b0c0a4',fontSize:14,marginBottom:18,lineHeight:1.7}}>
                Be the first {serviceCategory.shortLabel.toLowerCase()} provider at {portName} Port. Get listed on PortServiceFinder.
              </p>
              <Link href="/" className="btn-gold" style={{display:'inline-block',background:'#c8a84b',color:'#08100a',padding:'12px 30px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>
                List Your Business
              </Link>
            </section>
          )}

          {/* OTHER SERVICES AT THIS PORT */}
          {otherServicesAtPort.length > 0 && (
            <section style={{marginBottom:48}}>
              <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:14}}>
                Other Services at <em style={g}>{portName}</em>
              </h2>
              <div className="other-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
                {otherServicesAtPort.map((cat) => {
                  const count = getProvidersForCombo(portName, cat).length;
                  return (
                    <Link key={cat.slug} href={`/ports/${portSlug}/${cat.slug}`} className="other-svc" style={{padding:'14px 16px',background:'rgba(200,168,75,.04)',border:'1px solid rgba(200,168,75,.2)',color:'#f5f0e8',textDecoration:'none',transition:'all .25s ease',display:'block'}}>
                      <div style={{fontFamily:rj,fontSize:11,letterSpacing:'.5px',fontWeight:700,marginBottom:4,color:'#c8a84b'}}>
                        {cat.shortLabel}
                      </div>
                      <div style={{fontSize:11,color:'#b0c0a4'}}>
                        {count} provider{count !== 1 ? 's' : ''} at {portName}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section style={{marginTop:48,padding:'40px 30px',background:'linear-gradient(180deg,rgba(200,168,75,.07),transparent)',border:'1px solid rgba(200,168,75,.3)',textAlign:'center'}}>
            <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:10}}>
              Are You a {serviceCategory.shortLabel} Provider at <em style={g}>{portName}</em>?
            </h2>
            <p style={{fontSize:14,color:'#b5bfa8',maxWidth:520,margin:'0 auto 22px',lineHeight:1.7}}>
              Get found by vessel operators searching for {serviceCategory.shortLabel.toLowerCase()} services at {portName}. List your business on PortServiceFinder — direct subscription, no commission.
            </p>
            <Link href="/" className="btn-gold" style={{display:'inline-block',background:'#c8a84b',color:'#08100a',padding:'14px 32px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>
              List Your Business
            </Link>
          </section>

        </div>

        {/* FOOTER */}
        <footer style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'36px 48px',marginTop:40}}>
          <div className="ftgrid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:36,marginBottom:20,maxWidth:1200,margin:'0 auto 20px'}}>
            <div>
              <div style={{fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1,marginBottom:10}}>
                PortService<span style={g}>Finder</span>
              </div>
              <p style={{fontSize:12,color:'#7a8a72',lineHeight:1.7,maxWidth:240,marginBottom:10}}>
                The global maritime services directory.
              </p>
              <a href="mailto:contact@portservicefinder.com" style={{fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>
                contact@portservicefinder.com
              </a>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Browse</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" className="link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Home</Link></li>
                <li><Link href={`/ports/${portSlug}`} className="link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>All {portName} Services</Link></li>
                <li><Link href="/blog" className="link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Maritime Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Legal</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/terms" className="link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Terms</Link></li>
                <li><Link href="/privacy" className="link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Privacy</Link></li>
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

// ============================================================
// PROVIDER CARD COMPONENT
// ============================================================
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
