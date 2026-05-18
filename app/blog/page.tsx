import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, formatBlogDate } from '../data/blog-posts';

export const metadata: Metadata = {
  title: 'Maritime Industry Blog & Port Guides | PortServiceFinder',
  description: 'Expert guides for vessel operators, ship agents, shipchandlers and maritime professionals. Port guides for Singapore, Rotterdam, Suez, Panama and more.',
  keywords: [
    'maritime blog',
    'port guides',
    'ship agent guide',
    'shipping industry insights',
    'vessel operator resources',
    'Singapore port guide',
    'Suez canal guide',
    'Rotterdam port guide',
  ],
  openGraph: {
    title: 'Maritime Industry Blog & Port Guides | PortServiceFinder',
    description: 'Expert guides for vessel operators, ship agents and maritime professionals.',
    url: 'https://www.portservicefinder.com/blog',
    siteName: 'PortServiceFinder',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.portservicefinder.com/blog',
  },
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  'port-guide': { label: 'Port Guide', color: '#4caf76' },
  'industry-insights': { label: 'Industry Insights', color: '#c8a84b' },
  'tips': { label: 'Tips & Tricks', color: '#6ab4d4' },
  'regulations': { label: 'Regulations', color: '#e2c06a' },
};

export default function BlogIndexPage() {
  const lb = "'Libre Baskerville',serif";
  const rj = "'Rajdhani',sans-serif";
  const g = { color: '#c8a84b' } as React.CSSProperties;

  const sortedPosts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

  const featured = sortedPosts[0];
  const rest = sortedPosts.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .post-card{transition:border-color .3s ease, transform .3s ease, box-shadow .3s ease;}
        .post-card:hover{border-color:#c8a84b!important;transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.35);}
        .featured-card{transition:border-color .3s ease, box-shadow .3s ease;}
        .featured-card:hover{border-color:#c8a84b!important;box-shadow:0 16px 42px rgba(0,0,0,.4);}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .btn-ghost{transition:background .25s ease, border-color .25s ease;}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        @media(max-width:768px){
          .nav-cta{font-size:11px!important;padding:7px 14px!important;}
          .blog-hero{padding:90px 20px 40px!important;}
          .blog-hero h1{font-size:clamp(28px,6.5vw,42px)!important;}
          .blog-content{padding:36px 20px 60px!important;}
          .featured-grid{grid-template-columns:1fr!important;}
          .posts-grid{grid-template-columns:1fr!important;}
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
          position:'fixed',top:0,width:'100%',zIndex:300,height:64,
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'0 32px',background:'rgba(8,16,10,.97)',
          backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)',
        }}>
          <Link href="/" style={{
            fontFamily:lb,fontSize:22,fontWeight:700,letterSpacing:1,
            textDecoration:'none',color:'#f5f0e8',
          }}>
            PortService<span style={g}>Finder</span>
          </Link>
          <Link href="/" className="btn-gold nav-cta" style={{
            background:'#c8a84b',color:'#08100a',border:'none',
            padding:'8px 18px',fontFamily:rj,fontSize:12,
            letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,
            cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap',
          }}>
            Search Ports
          </Link>
        </nav>

        {/* HERO */}
        <section className="blog-hero" style={{
          padding:'120px 48px 50px',textAlign:'center',
          borderBottom:'1px solid rgba(200,168,75,.15)',
          background:'linear-gradient(180deg, rgba(200,168,75,.04), transparent)',
        }}>
          <div style={{
            fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',
            color:'#c8a84b',marginBottom:14,fontWeight:700,
          }}>
            Maritime Knowledge Hub
          </div>
          <h1 style={{
            fontFamily:lb,fontSize:'clamp(34px,4.5vw,56px)',fontWeight:700,
            lineHeight:1.05,letterSpacing:-1.5,marginBottom:18,
            maxWidth:820,margin:'0 auto 18px',
          }}>
            Port Guides & <em style={g}>Industry Insights</em>
          </h1>
          <p style={{
            fontSize:16,lineHeight:1.7,color:'#d4dcc8',
            maxWidth:620,margin:'0 auto',
          }}>
            Expert guides for vessel operators, ship agents, shipchandlers and maritime professionals. Written by industry insiders for the maritime industry.
          </p>
        </section>

        {/* CONTENT */}
        <div className="blog-content" style={{
          maxWidth:1180,margin:'0 auto',padding:'60px 48px 80px',
        }}>

          {/* FEATURED POST */}
          {featured && (
            <section style={{marginBottom:60}}>
              <div style={{
                fontFamily:rj,fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',
                color:'#c8a84b',marginBottom:14,fontWeight:700,
              }}>
                ★ Featured Guide
              </div>
              <Link href={`/blog/${featured.slug}`} className="featured-card" style={{
                display:'block',background:'linear-gradient(135deg,#0c1610,#0a140d)',
                border:'1px solid rgba(200,168,75,.3)',padding:'42px 44px',
                textDecoration:'none',color:'inherit',
              }}>
                <div className="featured-grid" style={{
                  display:'grid',gridTemplateColumns:'1fr 200px',gap:32,alignItems:'start',
                }}>
                  <div>
                    <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:14}}>
                      <span style={{
                        padding:'4px 11px',background:`${CATEGORY_LABELS[featured.category]?.color}22`,
                        border:`1px solid ${CATEGORY_LABELS[featured.category]?.color}`,
                        color:CATEGORY_LABELS[featured.category]?.color,
                        fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',
                        fontWeight:700,
                      }}>
                        {CATEGORY_LABELS[featured.category]?.label}
                      </span>
                      {featured.featuredPort && (
                        <span style={{
                          fontFamily:rj,fontSize:10,letterSpacing:'1.5px',
                          color:'#7a8a72',fontWeight:600,
                        }}>
                          🌍 {featured.featuredPort}
                        </span>
                      )}
                    </div>
                    <h2 style={{
                      fontFamily:lb,fontSize:'clamp(22px,2.6vw,34px)',fontWeight:700,
                      lineHeight:1.15,letterSpacing:-1,marginBottom:14,
                    }}>
                      {featured.title}
                    </h2>
                    <p style={{
                      fontSize:14,lineHeight:1.75,color:'#d4dcc8',marginBottom:18,
                    }}>
                      {featured.excerpt}
                    </p>
                    <div style={{
                      display:'flex',gap:18,fontFamily:rj,fontSize:11,
                      color:'#7a8a72',fontWeight:600,letterSpacing:'.5px',
                    }}>
                      <span>📅 {formatBlogDate(featured.publishedDate)}</span>
                      <span>⏱️ {featured.readingTime} min read</span>
                      <span>👤 {featured.author}</span>
                    </div>
                  </div>
                  <div style={{
                    display:'flex',flexDirection:'column',alignItems:'flex-end',
                    justifyContent:'space-between',height:'100%',gap:14,
                  }}>
                    <div style={{
                      fontFamily:lb,fontSize:80,fontWeight:700,
                      color:'rgba(200,168,75,.15)',lineHeight:1,
                    }}>
                      01
                    </div>
                    <div style={{
                      padding:'10px 22px',background:'#c8a84b',color:'#08100a',
                      fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',
                      fontWeight:700,whiteSpace:'nowrap',
                    }}>
                      Read Guide →
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* OTHER POSTS */}
          {rest.length > 0 && (
            <section style={{marginBottom:60}}>
              <div style={{
                fontFamily:rj,fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',
                color:'#c8a84b',marginBottom:18,fontWeight:700,
              }}>
                More Articles
              </div>
              <div className="posts-grid" style={{
                display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18,
              }}>
                {rest.map((post,i) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="post-card" style={{
                    background:'#111c13',border:'1px solid rgba(200,168,75,.18)',
                    padding:'24px 26px',textDecoration:'none',color:'inherit',
                    display:'flex',flexDirection:'column',
                  }}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
                      <span style={{
                        padding:'3px 9px',background:`${CATEGORY_LABELS[post.category]?.color}22`,
                        border:`1px solid ${CATEGORY_LABELS[post.category]?.color}`,
                        color:CATEGORY_LABELS[post.category]?.color,
                        fontFamily:rj,fontSize:9,letterSpacing:'1.2px',textTransform:'uppercase',
                        fontWeight:700,
                      }}>
                        {CATEGORY_LABELS[post.category]?.label}
                      </span>
                      {post.featuredPort && (
                        <span style={{
                          fontFamily:rj,fontSize:9,letterSpacing:'1px',
                          color:'#7a8a72',fontWeight:600,
                        }}>
                          🌍 {post.featuredPort}
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      fontFamily:lb,fontSize:18,fontWeight:700,lineHeight:1.25,
                      marginBottom:10,flex:'0 0 auto',
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize:13,lineHeight:1.65,color:'#b0c0a4',marginBottom:14,
                      flex:'1 0 auto',
                    }}>
                      {post.excerpt}
                    </p>
                    <div style={{
                      display:'flex',justifyContent:'space-between',
                      fontFamily:rj,fontSize:10,color:'#7a8a72',
                      fontWeight:600,letterSpacing:'.5px',marginTop:'auto',
                    }}>
                      <span>📅 {formatBlogDate(post.publishedDate)}</span>
                      <span>⏱️ {post.readingTime} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* COMING SOON CTA */}
          <section style={{
            padding:'40px 30px',background:'rgba(200,168,75,.05)',
            border:'1px solid rgba(200,168,75,.18)',textAlign:'center',
          }}>
            <div style={{
              fontFamily:rj,fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',
              color:'#c8a84b',marginBottom:10,fontWeight:700,
            }}>
              📡 More Guides Coming Soon
            </div>
            <h3 style={{
              fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:10,
            }}>
              Suez Canal · Rotterdam · Panama · Dubai
            </h3>
            <p style={{
              fontSize:13,color:'#b0c0a4',maxWidth:500,
              margin:'0 auto 18px',lineHeight:1.7,
            }}>
              We&apos;re publishing complete guides for every major maritime hub. New articles weekly.
            </p>
            <Link href="/for-providers" className="btn-gold" style={{
              display:'inline-block',background:'#c8a84b',color:'#08100a',
              padding:'12px 28px',fontFamily:rj,fontSize:12,
              letterSpacing:'2px',textTransform:'uppercase',
              fontWeight:700,textDecoration:'none',
            }}>
              List Your Business →
            </Link>
          </section>

        </div>

        {/* FOOTER */}
        <footer style={{
          borderTop:'1px solid rgba(200,168,75,.15)',padding:'40px 48px',
        }}>
          <div className="ftgrid" style={{
            display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:36,
            marginBottom:24,maxWidth:1180,margin:'0 auto 24px',
          }}>
            <div>
              <div style={{
                fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1,marginBottom:10,
              }}>
                PortService<span style={g}>Finder</span>
              </div>
              <p style={{
                fontSize:12,color:'#7a8a72',lineHeight:1.7,
                maxWidth:260,marginBottom:10,
              }}>
                The global maritime services directory and industry knowledge hub.
              </p>
              <a href="mailto:portservicefinder@gmail.com" style={{
                fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none',
              }}>
                portservicefinder@gmail.com
              </a>
            </div>
            <div>
              <h4 style={{
                fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',
                color:'#c8a84b',marginBottom:12,fontWeight:700,
              }}>
                Explore
              </h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Home / Search</Link></li>
                <li><Link href="/blog" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Blog & Guides</Link></li>
                <li><Link href="/for-providers" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>For Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{
                fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',
                color:'#c8a84b',marginBottom:12,fontWeight:700,
              }}>
                Top Ports
              </h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/ports/singapore" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Singapore</Link></li>
                <li><Link href="/ports/rotterdam" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Rotterdam</Link></li>
                <li><Link href="/ports/suez" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Suez</Link></li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop:'1px solid rgba(200,168,75,.1)',paddingTop:14,
            textAlign:'center',fontFamily:rj,fontSize:10,
            color:'#3a3a2a',letterSpacing:1,fontWeight:600,
          }}>
            © 2026 PortServiceFinder. All rights reserved. · MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH
          </div>
        </footer>

      </div>
    </>
  );
}
