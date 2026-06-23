import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { BLOG_POSTS, getBlogPost, formatBlogDate, BlogPost } from '@/app/data/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ============================================================
// METADATA GENERATION
// ============================================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found | PortServiceFinder',
      description: 'The article you are looking for could not be found.',
    };
  }

  const description = post.metaDescription || post.excerpt;
  const url = `https://www.portservicefinder.com/blog/${post.slug}`;

  return {
    title: `${post.title} | PortServiceFinder`,
    description,
    keywords: post.keywords?.join(', '),
    authors: [{ name: post.author || 'PortServiceFinder Editorial Team' }],
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      siteName: 'PortServiceFinder',
      publishedTime: post.publishedDate,
      authors: [post.author || 'PortServiceFinder Editorial Team'],
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ============================================================
// STATIC PARAMS
// ============================================================
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// ============================================================
// HELPER: Get related posts intelligently
// ============================================================
function getSmartRelatedPosts(currentPost: BlogPost, limit: number = 6): BlogPost[] {
  // Priority 1: Same port
  const samePort = BLOG_POSTS.filter(
    (p) =>
      p.slug !== currentPost.slug &&
      currentPost.featuredPort &&
      p.featuredPort === currentPost.featuredPort
  );

  // Priority 2: Same category
  const sameCategory = BLOG_POSTS.filter(
    (p) =>
      p.slug !== currentPost.slug &&
      p.category === currentPost.category &&
      (!currentPost.featuredPort || p.featuredPort !== currentPost.featuredPort)
  );

  // Priority 3: Recent posts
  const recent = BLOG_POSTS.filter(
    (p) =>
      p.slug !== currentPost.slug &&
      p.category !== currentPost.category &&
      (!currentPost.featuredPort || p.featuredPort !== currentPost.featuredPort)
  );

  const combined = [...samePort, ...sameCategory, ...recent];
  return combined.slice(0, limit);
}

// ============================================================
// HELPER: Extract FAQs from content
// ============================================================
function extractFAQs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  // Match Q: ... \n\nA: ... pattern
  const qaRegex = /\*\*Q:\s*([^*]+?)\*\*\s*\n\s*\n\s*A:\s*([^*]+?)(?=\n\s*\*\*Q:|\n\s*###|\n\s*---|\n\s*##\s|$)/gs;
  let match;
  while ((match = qaRegex.exec(content)) !== null) {
    const question = match[1].trim().replace(/\?$/, '').trim() + '?';
    const answer = match[2].trim().replace(/\s+/g, ' ').slice(0, 800);
    if (question.length > 5 && answer.length > 20) {
      faqs.push({ question, answer });
    }
  }
  return faqs.slice(0, 20); // limit to 20 FAQs for schema
}

// ============================================================
// HELPER: Render markdown content (simple)
// ============================================================
function renderContent(content: string): string {
  let html = content;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

  // Italics
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');

  // Links - external
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Tables
  html = html.replace(/((?:^\|.*\|[^\n]*\n)+)/gm, (match) => {
    const rows = match.trim().split('\n').filter(r => r.startsWith('|'));
    if (rows.length < 2) return match;
    const isSeparator = (r: string) => /^\|[\s\-:|]+\|$/.test(r);
    let tableHtml = '<div style="overflow-x:auto;margin:24px 0;"><table style="width:100%;border-collapse:collapse;font-family:Outfit,sans-serif;font-size:13px;">';
    let inBody = false;
    rows.forEach((row, idx) => {
      if (isSeparator(row)) {
        if (!inBody) tableHtml += '</thead><tbody>';
        inBody = true;
        return;
      }
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      if (idx === 0 && !inBody) tableHtml += '<thead>';
      const tag = inBody ? 'td' : 'th';
      tableHtml += '<tr>';
      cells.forEach(c => {
        const style = inBody
          ? 'padding:10px 12px;border-bottom:1px solid rgba(200,168,75,.15);color:#d4dcc8;'
          : 'padding:12px;border-bottom:2px solid rgba(200,168,75,.4);color:#c8a84b;font-family:Rajdhani,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-align:left;font-weight:700;';
        tableHtml += `<${tag} style="${style}">${c}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(200,168,75,.15);margin:32px 0;"/>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>(\n<li>[\s\S]+?<\/li>)*)/g, '<ul>$1</ul>');

  // Paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks.map(b => {
    const t = b.trim();
    if (!t) return '';
    if (t.startsWith('<h1') || t.startsWith('<h2') || t.startsWith('<h3') || t.startsWith('<ul') || t.startsWith('<table') || t.startsWith('<div') || t.startsWith('<hr')) {
      return t;
    }
    return `<p>${t}</p>`;
  }).join('\n');

  return html;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getSmartRelatedPosts(post, 6);
  const faqs = extractFAQs(post.content);
  const url = `https://www.portservicefinder.com/blog/${post.slug}`;
  const publishedDate = new Date(post.publishedDate).toISOString();
  const contentHtml = renderContent(post.content);
  const wordCount = post.content.split(/\s+/).length;

  // ============================================================
  // SCHEMA MARKUP — Article + Breadcrumb + FAQ
  // ============================================================

  // 1. Article Schema (BlogPosting)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    url: url,
    datePublished: publishedDate,
    dateModified: publishedDate,
    author: {
      '@type': 'Organization',
      name: post.author || 'PortServiceFinder Editorial Team',
      url: 'https://www.portservicefinder.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PortServiceFinder',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.portservicefinder.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.keywords?.join(', '),
    articleSection: post.category,
    wordCount: wordCount,
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: 'en',
    isAccessibleForFree: true,
    about: post.featuredPort
      ? [
          { '@type': 'Place', name: post.featuredPort },
          { '@type': 'Thing', name: 'Maritime Services' },
        ]
      : [{ '@type': 'Thing', name: 'Maritime Services' }],
  };

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.portservicefinder.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.portservicefinder.com/blog',
      },
      ...(post.featuredPort
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.featuredPort,
              item: `https://www.portservicefinder.com/ports/${post.featuredPort.toLowerCase().replace(/\s+/g, '-')}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: post.title,
              item: url,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: url,
            },
          ]),
    ],
  };

  // 3. FAQ Schema (only if FAQs exist)
  const faqSchema = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  const g = { color: '#c8a84b' } as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <>
      {/* SCHEMA MARKUP — Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* SCHEMA MARKUP — Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* SCHEMA MARKUP — FAQ (if exists) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;color:#f5f0e8;font-family:'Outfit',sans-serif;font-weight:300;}
        .article-content h1{font-family:${lb};font-size:32px;font-weight:700;line-height:1.15;margin:36px 0 18px;color:#f5f0e8;}
        .article-content h2{font-family:${lb};font-size:26px;font-weight:700;line-height:1.2;margin:32px 0 16px;color:#f5f0e8;border-bottom:1px solid rgba(200,168,75,.15);padding-bottom:10px;}
        .article-content h3{font-family:${lb};font-size:20px;font-weight:700;line-height:1.25;margin:28px 0 12px;color:#c8a84b;}
        .article-content p{font-size:15px;line-height:1.85;color:#d4dcc8;margin-bottom:18px;}
        .article-content ul{padding-left:0;list-style:none;margin:14px 0 22px;}
        .article-content li{font-size:14.5px;line-height:1.75;color:#d4dcc8;margin-bottom:10px;padding-left:24px;position:relative;}
        .article-content li:before{content:"›";position:absolute;left:6px;top:0;color:#c8a84b;font-weight:700;font-size:18px;line-height:1.5;}
        .article-content a{color:#c8a84b;text-decoration:none;border-bottom:1px solid rgba(200,168,75,.4);transition:border-color .2s;}
        .article-content a:hover{border-bottom-color:#c8a84b;}
        .article-content strong{color:#f5f0e8;font-weight:600;}
        .article-content em{font-style:italic;color:#d4dcc8;}
        .blog-card-related{transition:transform .3s ease, border-color .3s ease, box-shadow .3s ease;}
        .blog-card-related:hover{transform:translateY(-3px);border-color:#c8a84b!important;box-shadow:0 10px 28px rgba(0,0,0,.4);}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .breadcrumb-link:hover{color:#c8a84b!important;}
        @media(max-width:768px){
          .article-wrap{padding:80px 16px 40px!important;}
          .article-content h1{font-size:24px!important;margin:24px 0 14px!important;}
          .article-content h2{font-size:20px!important;margin:24px 0 12px!important;}
          .article-content h3{font-size:17px!important;margin:20px 0 10px!important;}
          .article-content p{font-size:14px!important;line-height:1.75!important;}
          .related-grid{grid-template-columns:1fr!important;}
          .meta-row{flex-direction:column!important;gap:8px!important;align-items:flex-start!important;}
          .hero-title{font-size:26px!important;}
        }
        @media(min-width:769px) and (max-width:1024px){
          .related-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,width:'100%',zIndex:100,height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
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
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link href="/blog" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,textDecoration:'none'}}>All Guides</Link>
          <Link href="/" className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'7px 14px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>Search Providers</Link>
        </div>
      </nav>

      <div className="article-wrap" style={{maxWidth:880,margin:'0 auto',padding:'90px 24px 60px',position:'relative',zIndex:1}}>

        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',marginBottom:24,fontFamily:rj,fontSize:11,fontWeight:600,letterSpacing:'.5px'}}>
          <Link href="/" className="breadcrumb-link" style={{color:'#7a8a72',textDecoration:'none'}}>Home</Link>
          <span style={{color:'#3a4a32'}}>›</span>
          <Link href="/blog" className="breadcrumb-link" style={{color:'#7a8a72',textDecoration:'none'}}>Blog</Link>
          {post.featuredPort && (
            <>
              <span style={{color:'#3a4a32'}}>›</span>
              <Link href={`/ports/${post.featuredPort.toLowerCase().replace(/\s+/g, '-')}`} className="breadcrumb-link" style={{color:'#7a8a72',textDecoration:'none'}}>{post.featuredPort}</Link>
            </>
          )}
          <span style={{color:'#3a4a32'}}>›</span>
          <span style={{color:'#c8a84b'}}>Article</span>
        </nav>

        {/* HEADER */}
        <header style={{marginBottom:32,paddingBottom:24,borderBottom:'1px solid rgba(200,168,75,.15)'}}>
          {post.category && (
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>
              {post.category.replace(/-/g, ' ')}
              {post.featuredPort && (<> · {post.featuredPort} 🚢</>)}
            </div>
          )}

          <h1 className="hero-title" style={{fontFamily:lb,fontSize:34,fontWeight:700,lineHeight:1.15,marginBottom:18,color:'#f5f0e8'}}>{post.title}</h1>

          {post.excerpt && (
            <p style={{fontSize:16,color:'#b0c0a4',lineHeight:1.7,marginBottom:18,fontStyle:'italic'}}>{post.excerpt}</p>
          )}

          <div className="meta-row" style={{display:'flex',flexWrap:'wrap',gap:18,alignItems:'center',fontFamily:rj,fontSize:11,letterSpacing:'.5px'}}>
            <span style={{display:'flex',alignItems:'center',gap:6,color:'#7a8a72'}}>
              <span style={{color:'#c8a84b'}}>✍</span> {post.author || 'PortServiceFinder Editorial Team'}
            </span>
            <span style={{color:'#3a4a32'}}>·</span>
            <span style={{color:'#7a8a72'}}>📅 {formatBlogDate(post.publishedDate)}</span>
            <span style={{color:'#3a4a32'}}>·</span>
            <span style={{color:'#7a8a72'}}>⏱ {post.readingTime} min read</span>
            <span style={{color:'#3a4a32'}}>·</span>
            <span style={{color:'#7a8a72'}}>📊 {wordCount.toLocaleString()} words</span>
          </div>
        </header>

        {/* ARTICLE CONTENT */}
        <article className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {/* CTA */}
        <div style={{marginTop:48,padding:'28px 30px',background:'linear-gradient(180deg,rgba(200,168,75,.06),rgba(200,168,75,.02))',border:'1px solid rgba(200,168,75,.25)',display:'grid',gridTemplateColumns:'1fr auto',gap:20,alignItems:'center'}}>
          <div>
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>🔍 Find Verified Providers</div>
            <h3 style={{fontFamily:lb,fontSize:22,fontWeight:700,lineHeight:1.25,marginBottom:8}}>
              {post.featuredPort
                ? <>Find {post.featuredPort} Maritime Service <em style={g}>Providers</em></>
                : <>Find Maritime Service <em style={g}>Providers</em> Worldwide</>}
            </h3>
            <p style={{fontSize:13,color:'#b0c0a4',lineHeight:1.65}}>
              {post.featuredPort
                ? `Browse verified ${post.featuredPort} ship agents, shipchandlers, marine services. Free to search.`
                : 'Search 1,200+ ports worldwide. Verified providers. No commission.'}
            </p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <Link href={post.featuredPort ? `/ports/${post.featuredPort.toLowerCase().replace(/\s+/g, '-')}` : '/'} className="btn-gold" style={{background:'#c8a84b',color:'#08100a',textDecoration:'none',padding:'12px 20px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textAlign:'center',whiteSpace:'nowrap'}}>
              {post.featuredPort ? `Search ${post.featuredPort}` : 'Search Providers'}
            </Link>
          </div>
        </div>

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <section style={{marginTop:52,paddingTop:36,borderTop:'1px solid rgba(200,168,75,.15)'}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>📚 Continue Reading</div>
              <h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,lineHeight:1.2}}>
                {post.featuredPort
                  ? <>Related <em style={g}>{post.featuredPort}</em> Guides</>
                  : <>Related <em style={g}>Maritime</em> Guides</>}
              </h2>
            </div>

            <div className="related-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="blog-card-related"
                  style={{
                    background:'#111c13',
                    padding:'20px 20px',
                    border:'1px solid rgba(200,168,75,.18)',
                    textDecoration:'none',
                    color:'inherit',
                    display:'flex',
                    flexDirection:'column',
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8}}>
                    {related.featuredPort && (
                      <span style={{fontFamily:rj,fontSize:9,letterSpacing:'1.2px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,background:'rgba(200,168,75,.08)',padding:'3px 8px',border:'1px solid rgba(200,168,75,.2)',whiteSpace:'nowrap'}}>{related.featuredPort}</span>
                    )}
                    <span style={{fontFamily:rj,fontSize:10,color:'#7a8a72',fontWeight:600,whiteSpace:'nowrap'}}>⏱ {related.readingTime}m</span>
                  </div>
                  <h3 style={{fontFamily:lb,fontSize:15,fontWeight:700,lineHeight:1.35,marginBottom:8,color:'#f5f0e8'}}>{related.title.length > 80 ? related.title.slice(0, 80) + '...' : related.title}</h3>
                  <p style={{fontSize:12,lineHeight:1.55,color:'#b0c0a4',marginBottom:12,flex:1}}>{related.excerpt.length > 110 ? related.excerpt.slice(0, 110) + '...' : related.excerpt}</p>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,paddingTop:8,borderTop:'1px solid rgba(200,168,75,.1)'}}>Read Guide →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM CTA */}
        <section style={{marginTop:52,padding:'28px 24px',textAlign:'center',background:'#0c1610',border:'1px solid rgba(200,168,75,.18)'}}>
          <h3 style={{fontFamily:lb,fontSize:22,fontWeight:700,marginBottom:10}}>Are You a Maritime Service <em style={g}>Provider?</em></h3>
          <p style={{fontSize:13,color:'#b0c0a4',marginBottom:16,maxWidth:480,margin:'0 auto 16px',lineHeight:1.65}}>
            List your business on PortServiceFinder. <strong style={g}>$49.90/month or $500/year.</strong> No commission. Reach vessel operators worldwide.
          </p>
          <Link href="/#pricing" className="btn-gold" style={{display:'inline-block',background:'#c8a84b',color:'#08100a',textDecoration:'none',padding:'11px 24px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700}}>List Your Business →</Link>
        </section>

        {/* FOOTER */}
        <footer style={{marginTop:44,paddingTop:24,borderTop:'1px solid rgba(200,168,75,.1)',textAlign:'center',fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1}}>
          © 2026 PortServiceFinder. Maritime Services Directory · Free to Search · No Commission.
        </footer>

      </div>
    </>
  );
}
