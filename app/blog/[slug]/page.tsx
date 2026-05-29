import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BLOG_POSTS,
  getBlogPost,
  getRelatedPosts,
  formatBlogDate,
  getAllBlogSlugs,
} from '../../data/blog';

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Article Not Found — PortServiceFinder' };
  }

  // Use heroImage if available, otherwise default og-image
  const ogImage = post.heroImage || 'https://www.portservicefinder.com/og-image.jpg';

  return {
    title: `${post.title} | PortServiceFinder`,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://www.portservicefinder.com/blog/${post.slug}`,
      siteName: 'PortServiceFinder',
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://www.portservicefinder.com/blog/${post.slug}`,
    },
  };
}

// ============================================================
// CATEGORY LABELS — Expanded to support all 10 categories
// ============================================================
const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  'port-guide': { label: 'Port Guide', color: '#4caf76' },
  'port-guides': { label: 'Port Guide', color: '#4caf76' },
  'industry-insights': { label: 'Industry Insights', color: '#c8a84b' },
  'tips': { label: 'Tips & Tricks', color: '#6ab4d4' },
  'regulations': { label: 'Regulations', color: '#e2c06a' },
  'regulatory': { label: 'Regulations', color: '#e2c06a' },
  'maritime-fundamentals': { label: 'Maritime Fundamentals', color: '#8ab4f8' },
  'comparison': { label: 'Comparison', color: '#c594d4' },
  'how-to': { label: 'How To Guide', color: '#f8b88a' },
  'business': { label: 'Business', color: '#a4d48a' },
};

// Map category to Schema.org articleSection
const CATEGORY_SECTIONS: Record<string, string> = {
  'port-guide': 'Port Guides',
  'port-guides': 'Port Guides',
  'industry-insights': 'Industry Insights',
  'tips': 'Tips & Tricks',
  'regulations': 'Regulations',
  'regulatory': 'Regulations',
  'maritime-fundamentals': 'Maritime Fundamentals',
  'comparison': 'Comparison Guides',
  'how-to': 'How-To Guides',
  'business': 'Business Guides',
};

// Default fallback for unknown categories
const DEFAULT_CATEGORY = { label: 'Maritime Article', color: '#c8a84b' };

// ============================================================
// REGIONAL GROUPING — For internal linking
// ============================================================
const REGION_KEYWORDS: Record<string, { label: string; emoji: string; keywords: string[] }> = {
  asiaPacific: {
    label: 'Asia-Pacific Ports',
    emoji: '🌏',
    keywords: [
      'shanghai', 'hong-kong', 'singapore', 'busan', 'yokohama',
      'shenzhen', 'ningbo', 'guangzhou', 'qingdao', 'tianjin',
      'tanjung-pelepas', 'mormugao', 'goa', 'tokyo', 'kobe',
      'osaka', 'incheon', 'gwangyang', 'ulsan', 'mumbai',
      'chennai', 'kolkata', 'kandla', 'nhava-sheva', 'jakarta',
      'colombo', 'port-klang', 'laem-chabang', 'kaohsiung', 'jnpt',
    ],
  },
  europe: {
    label: 'European Ports',
    emoji: '🌍',
    keywords: [
      'rotterdam', 'hamburg', 'antwerp', 'amsterdam', 'gibraltar',
      'piraeus', 'istanbul', 'genoa', 'felixstowe', 'le-havre',
      'algeciras', 'valencia', 'barcelona', 'bremerhaven',
      'london', 'liverpool', 'southampton', 'marseille', 'naples',
      'la-spezia', 'koper', 'gdansk', 'klaipeda', 'tallinn',
    ],
  },
  americas: {
    label: 'Americas',
    emoji: '🌎',
    keywords: [
      'houston', 'new-york', 'los-angeles', 'long-beach', 'santos',
      'rosario', 'vancouver', 'panama', 'baltimore', 'savannah',
      'charleston', 'oakland', 'seattle', 'tacoma', 'miami',
      'new-orleans', 'manzanillo', 'cartagena', 'callao',
      'valparaiso', 'buenaventura', 'puerto-rico',
    ],
  },
  middleEastAfrica: {
    label: 'Middle East & Africa',
    emoji: '🌍',
    keywords: [
      'dubai', 'jebel-ali', 'suez', 'casablanca', 'durban',
      'fujairah', 'abu-dhabi', 'jeddah', 'tangier', 'tanger-med',
      'sokhna', 'port-said', 'alexandria', 'cape-town',
      'lagos', 'mombasa', 'aqaba', 'salalah', 'doha',
    ],
  },
  industryResources: {
    label: 'Industry Resources',
    emoji: '🏗️',
    keywords: [
      'shipyard', 'shipyards', 'drydock', 'shipbuilding',
      'comparison', 'compare', 'vs-', 'howto', 'worlds-top',
      'eu-ets', 'uk-ets', 'fueleu', 'maritime-regulations',
      'bunker-hubs', 'ship-agent', 'shipchandler', 'how-to-choose',
    ],
  },
  otherRegions: {
    label: 'Other Regions',
    emoji: '❄️',
    keywords: [
      'melbourne', 'st-petersburg', 'sydney', 'auckland',
      'brisbane', 'vladivostok', 'novorossiysk', 'reykjavik',
    ],
  },
};

interface GroupedPost {
  slug: string;
  title: string;
  featuredPort?: string;
}

interface RegionGroup {
  label: string;
  emoji: string;
  posts: GroupedPost[];
}

function groupPostsByRegion(currentSlug: string): RegionGroup[] {
  const allPosts = BLOG_POSTS.filter((p) => p.slug !== currentSlug);

  const groups: Record<string, RegionGroup> = {};
  const assigned = new Set<string>();

  for (const [key, region] of Object.entries(REGION_KEYWORDS)) {
    groups[key] = {
      label: region.label,
      emoji: region.emoji,
      posts: [],
    };
  }

  for (const post of allPosts) {
    for (const [key, region] of Object.entries(REGION_KEYWORDS)) {
      const matches = region.keywords.some((kw) =>
        post.slug.toLowerCase().includes(kw)
      );
      if (matches) {
        groups[key].posts.push({
          slug: post.slug,
          title: post.title,
          featuredPort: post.featuredPort,
        });
        assigned.add(post.slug);
        break;
      }
    }
  }

  for (const post of allPosts) {
    if (!assigned.has(post.slug)) {
      groups.otherRegions.posts.push({
        slug: post.slug,
        title: post.title,
        featuredPort: post.featuredPort,
      });
    }
  }

  return Object.values(groups).filter((g) => g.posts.length > 0);
}

function getShortName(post: GroupedPost): string {
  if (post.featuredPort) return post.featuredPort;
  const firstPart = post.title.split(':')[0].trim();
  return firstPart.replace(/\s+Port$/, '').replace(/\s+Canal$/, '').replace(/\s+Transit$/, '');
}

// ============================================================
// FAQ EXTRACTION — Auto-extract Q&A pairs from content for FAQPage schema
// ============================================================
interface FAQItem {
  question: string;
  answer: string;
}

function extractFAQs(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const lines = content.split('\n');

  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];

  const flushFAQ = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      const answerText = currentAnswer.join(' ').trim();
      if (answerText.length > 10) {
        faqs.push({
          question: currentQuestion,
          answer: answerText,
        });
      }
    }
    currentQuestion = null;
    currentAnswer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Match **Q: ...** pattern
    const qMatch = trimmed.match(/^\*\*Q:\s*(.+?)\*\*$/);
    if (qMatch) {
      flushFAQ();
      currentQuestion = qMatch[1].trim();
      continue;
    }

    // Match A: ... pattern
    if (trimmed.startsWith('A:') && currentQuestion) {
      const answerStart = trimmed.slice(2).trim();
      // Strip markdown formatting for schema
      const cleanAnswer = answerStart
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*([^*]+?)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      currentAnswer.push(cleanAnswer);
      continue;
    }

    // Empty line ends current FAQ
    if (trimmed === '' && currentQuestion) {
      flushFAQ();
      continue;
    }

    // New section ends current FAQ
    if (trimmed.startsWith('##') && currentQuestion) {
      flushFAQ();
    }
  }

  flushFAQ();
  return faqs;
}

// Simple markdown-to-React renderer (handles our basic content format)
function renderContent(content: string): React.ReactNode[] {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`} style={{
            fontSize: 15, lineHeight: 1.85, color: '#d4dcc8',
            marginBottom: 18, fontFamily: "'Outfit',sans-serif",
          }} dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        );
      }
      currentParagraph = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const [header, ...rows] = tableRows;
    elements.push(
      <div key={`table-${elements.length}`} style={{
        marginBottom: 22, overflowX: 'auto',
        border: '1px solid rgba(200,168,75,.2)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(200,168,75,.08)' }}>
              {header.map((h, i) => (
                <th key={i} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 11,
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: '#c8a84b', fontWeight: 700,
                  borderBottom: '1px solid rgba(200,168,75,.2)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{
                borderBottom: '1px solid rgba(200,168,75,.08)',
              }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 16px', color: '#d4dcc8', lineHeight: 1.6,
                  }} dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      if (cells.every(c => /^[-:\s]+$/.test(c))) continue;
      inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed === '---') {
      flushParagraph();
      elements.push(
        <hr key={`hr-${elements.length}`} style={{
          border: 'none', borderTop: '1px solid rgba(200,168,75,.18)',
          margin: '32px 0',
        }} />
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h3 key={`h3-${elements.length}`} style={{
          fontFamily: "'Libre Baskerville',serif", fontSize: 19, fontWeight: 700,
          marginTop: 28, marginBottom: 12, color: '#f5f0e8', lineHeight: 1.3,
        }}>{trimmed.slice(4)}</h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h2 key={`h2-${elements.length}`} style={{
          fontFamily: "'Libre Baskerville',serif", fontSize: 26, fontWeight: 700,
          marginTop: 40, marginBottom: 16, color: '#f5f0e8', lineHeight: 1.2,
          letterSpacing: -.5,
        }}>{trimmed.slice(3)}</h2>
      );
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      const listItems: string[] = [trimmed.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
        i++;
        listItems.push(lines[i].trim().slice(2));
      }
      elements.push(
        <ul key={`ul-${elements.length}`} style={{
          marginBottom: 20, paddingLeft: 0, listStyle: 'none',
        }}>
          {listItems.map((item, li) => (
            <li key={li} style={{
              fontSize: 14, lineHeight: 1.8, color: '#d4dcc8',
              marginBottom: 8, paddingLeft: 22, position: 'relative',
            }}>
              <span style={{
                position: 'absolute', left: 0, top: 0, color: '#c8a84b',
                fontWeight: 700,
              }}>▸</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      const listItems: string[] = [trimmed.replace(/^\d+\.\s/, '')];
      while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
        i++;
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
      }
      elements.push(
        <ol key={`ol-${elements.length}`} style={{
          marginBottom: 20, paddingLeft: 26,
        }}>
          {listItems.map((item, li) => (
            <li key={li} style={{
              fontSize: 14, lineHeight: 1.8, color: '#d4dcc8', marginBottom: 8,
            }} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
      continue;
    }

    if (trimmed.startsWith('**Q:')) {
      flushParagraph();
      elements.push(
        <div key={`q-${elements.length}`} style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
          color: '#c8a84b', marginTop: 18, marginBottom: 6,
          letterSpacing: '.5px',
        }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      );
      continue;
    }
    if (trimmed.startsWith('A:')) {
      flushParagraph();
      elements.push(
        <p key={`a-${elements.length}`} style={{
          fontSize: 14, lineHeight: 1.8, color: '#d4dcc8',
          marginBottom: 14, paddingLeft: 18,
          borderLeft: '2px solid rgba(200,168,75,.25)',
        }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      );
      continue;
    }

    // Blockquote support
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      const quoteItems: string[] = [trimmed.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
        i++;
        quoteItems.push(lines[i].trim().slice(2));
      }
      elements.push(
        <blockquote key={`bq-${elements.length}`} style={{
          margin: '24px 0',
          padding: '18px 24px',
          borderLeft: '3px solid #c8a84b',
          background: 'rgba(200,168,75,.05)',
          fontStyle: 'italic',
          fontSize: 15,
          lineHeight: 1.75,
          color: '#d4dcc8',
        }} dangerouslySetInnerHTML={{ __html: formatInline(quoteItems.join(' ')) }} />
      );
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushTable();

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f5f0e8;font-weight:700">$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em style="color:#c8a84b">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#c8a84b;text-decoration:underline">$1</a>');
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug, 3);
  const regionGroups = groupPostsByRegion(post.slug);
  const lb = "'Libre Baskerville',serif";
  const rj = "'Rajdhani',sans-serif";
  const g = { color: '#c8a84b' } as React.CSSProperties;

  const postUrl = `https://www.portservicefinder.com/blog/${post.slug}`;
  const categoryInfo = CATEGORY_LABELS[post.category] || DEFAULT_CATEGORY;

  // Use heroImage if available, otherwise default og-image
  const heroImageUrl = post.heroImage || null;
  const schemaImage = post.heroImage || 'https://www.portservicefinder.com/og-image.jpg';

  // JSON-LD: Article schema (enhanced)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: schemaImage,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://www.portservicefinder.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PortServiceFinder',
      url: 'https://www.portservicefinder.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.portservicefinder.com/favicon.ico',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : post.keywords,
    articleSection: CATEGORY_SECTIONS[post.category] || 'Maritime Industry',
    inLanguage: 'en',
  };

  // JSON-LD: BreadcrumbList schema
  const breadcrumbJsonLd = {
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // JSON-LD: FAQPage schema (auto-extracted from content)
  const faqs = extractFAQs(post.content);
  const faqJsonLd = faqs.length > 0 ? {
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
  } : null;

  // Use custom schema if defined in post, otherwise auto-generated
  const customSchema = post.schema || null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema) }}
        />
      )}

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        .article-link:hover{color:#c8a84b!important;}
        .related-card{transition:border-color .3s ease, transform .3s ease;}
        .related-card:hover{border-color:#c8a84b!important;transform:translateY(-3px);}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .region-link{transition:color .2s ease, background .2s ease, transform .2s ease;}
        .region-link:hover{color:#08100a!important;background:#c8a84b!important;transform:translateY(-2px);}
        .hero-image-wrapper{
          width:100%;
          max-width:880px;
          margin:90px auto 0;
          padding:0 48px;
        }
        .hero-image{
          width:100%;
          height:auto;
          max-height:420px;
          object-fit:cover;
          border:1px solid rgba(200,168,75,.18);
          display:block;
        }
        @media(max-width:768px){
          .nav-cta{font-size:11px!important;padding:7px 14px!important;}
          .article-hero{padding:30px 20px 30px!important;}
          .article-hero h1{font-size:clamp(24px,6vw,34px)!important;}
          .article-body{padding:30px 20px 60px!important;}
          .article-body h2{font-size:22px!important;margin-top:32px!important;}
          .article-body h3{font-size:17px!important;}
          .meta-row{flex-direction:column!important;gap:6px!important;align-items:flex-start!important;}
          .related-grid{grid-template-columns:1fr!important;}
          .region-section{padding:0 20px 50px!important;}
          .region-grid{grid-template-columns:1fr!important;}
          .ftgrid{grid-template-columns:1fr!important;}
          .hero-image-wrapper{padding:0 20px;margin-top:80px;}
          .hero-image{max-height:240px;}
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
          <Link href="/blog" className="btn-gold nav-cta" style={{
            background:'transparent',color:'#c8a84b',
            border:'1px solid rgba(200,168,75,.4)',
            padding:'8px 18px',fontFamily:rj,fontSize:12,
            letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,
            cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap',
          }}>
            ← All Articles
          </Link>
        </nav>

        {/* HERO IMAGE (if available) */}
        {heroImageUrl && (
          <div className="hero-image-wrapper">
            <img
              src={heroImageUrl}
              alt={post.title}
              className="hero-image"
              loading="eager"
            />
          </div>
        )}

        {/* ARTICLE HERO */}
        <section className="article-hero" style={{
          padding: heroImageUrl ? '40px 48px 40px' : '120px 48px 40px',
          maxWidth:880,margin:'0 auto',
        }}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:18}}>
            <span style={{
              padding:'4px 11px',
              background:`${categoryInfo.color}22`,
              border:`1px solid ${categoryInfo.color}`,
              color:categoryInfo.color,
              fontFamily:rj,fontSize:10,letterSpacing:'1.5px',
              textTransform:'uppercase',fontWeight:700,
            }}>
              {categoryInfo.label}
            </span>
            {post.featuredPort && (
              <span style={{
                fontFamily:rj,fontSize:11,letterSpacing:'1.5px',
                color:'#7a8a72',fontWeight:600,
              }}>
                🌍 {post.featuredPort}
              </span>
            )}
          </div>
          <h1 style={{
            fontFamily:lb,fontSize:'clamp(28px,3.6vw,46px)',fontWeight:700,
            lineHeight:1.1,letterSpacing:-1.2,marginBottom:20,
          }}>
            {post.title}
          </h1>
          <p style={{
            fontSize:17,lineHeight:1.7,color:'#b5bfa8',marginBottom:24,
            fontWeight:300,
          }}>
            {post.excerpt}
          </p>
          <div className="meta-row" style={{
            display:'flex',gap:22,alignItems:'center',
            paddingBottom:24,borderBottom:'1px solid rgba(200,168,75,.15)',
            fontFamily:rj,fontSize:12,color:'#7a8a72',fontWeight:600,
            letterSpacing:'.5px',
          }}>
            <span>👤 {post.author}</span>
            <span>📅 {formatBlogDate(post.publishedDate)}</span>
            <span>⏱️ {post.readingTime} min read</span>
          </div>
        </section>

        {/* ARTICLE BODY */}
        <article className="article-body" style={{
          maxWidth:760,margin:'0 auto',padding:'40px 48px 80px',
        }}>
          {renderContent(post.content)}

          {/* Author bio / CTA */}
          <div style={{
            marginTop:50,padding:'30px 32px',
            background:'linear-gradient(135deg,rgba(200,168,75,.07),transparent)',
            border:'1px solid rgba(200,168,75,.25)',
          }}>
            <div style={{
              fontFamily:rj,fontSize:10,letterSpacing:'2.5px',
              textTransform:'uppercase',color:'#c8a84b',
              marginBottom:10,fontWeight:700,
            }}>
              💼 About PortServiceFinder
            </div>
            <p style={{fontSize:14,color:'#d4dcc8',lineHeight:1.7,marginBottom:16}}>
              PortServiceFinder is the global directory connecting vessel operators with verified ship agents, shipchandlers, and marine service providers at every port worldwide. <strong style={{color:'#f5f0e8'}}>Free to search for vessel operators. Subscription model for providers — no commission, ever.</strong>
            </p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <Link href="/" className="btn-gold" style={{
                background:'#c8a84b',color:'#08100a',
                padding:'11px 22px',fontFamily:rj,fontSize:12,
                letterSpacing:'1.8px',textTransform:'uppercase',
                fontWeight:700,textDecoration:'none',
              }}>
                Search Ports →
              </Link>
              <Link href="/for-providers" style={{
                background:'transparent',color:'#c8a84b',
                border:'1px solid rgba(200,168,75,.4)',
                padding:'11px 22px',fontFamily:rj,fontSize:12,
                letterSpacing:'1.8px',textTransform:'uppercase',
                fontWeight:700,textDecoration:'none',
              }}>
                For Providers
              </Link>
            </div>
          </div>
        </article>

        {/* RELATED POSTS */}
        {related.length > 0 && (
          <section style={{
            maxWidth:1100,margin:'0 auto',padding:'0 48px 50px',
          }}>
            <div style={{
              fontFamily:rj,fontSize:10,letterSpacing:'2.5px',
              textTransform:'uppercase',color:'#c8a84b',
              marginBottom:18,fontWeight:700,
            }}>
              Related Articles
            </div>
            <div className="related-grid" style={{
              display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14,
            }}>
              {related.map(r => {
                const rCat = CATEGORY_LABELS[r.category] || DEFAULT_CATEGORY;
                return (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="related-card" style={{
                    background:'#111c13',border:'1px solid rgba(200,168,75,.18)',
                    padding:'20px 22px',textDecoration:'none',color:'inherit',
                    display:'block',
                  }}>
                    <div style={{
                      fontFamily:rj,fontSize:9,letterSpacing:'1.2px',
                      textTransform:'uppercase',color:'#c8a84b',
                      fontWeight:700,marginBottom:8,
                    }}>
                      {rCat.label}
                    </div>
                    <h4 style={{
                      fontFamily:lb,fontSize:16,fontWeight:700,
                      lineHeight:1.3,marginBottom:8,
                    }}>
                      {r.title}
                    </h4>
                    <div style={{
                      fontFamily:rj,fontSize:10,color:'#7a8a72',
                      fontWeight:600,letterSpacing:'.5px',
                    }}>
                      ⏱️ {r.readingTime} min read
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================== */}
        {/* EXPLORE MORE PORT GUIDES — Regional Internal Linking */}
        {/* ============================================== */}
        {regionGroups.length > 0 && (
          <section className="region-section" style={{
            maxWidth:1100,margin:'0 auto',padding:'0 48px 70px',
            borderTop:'1px solid rgba(200,168,75,.15)',paddingTop:50,
          }}>
            <div style={{
              fontFamily:rj,fontSize:10,letterSpacing:'2.5px',
              textTransform:'uppercase',color:'#c8a84b',
              marginBottom:8,fontWeight:700,
            }}>
              🌐 Explore More Port Guides
            </div>
            <h2 style={{
              fontFamily:lb,fontSize:24,fontWeight:700,
              lineHeight:1.2,marginBottom:24,color:'#f5f0e8',
            }}>
              Comprehensive Guides for <em style={g}>Major Ports</em> Worldwide
            </h2>
            <p style={{
              fontSize:13.5,color:'#b5bfa8',lineHeight:1.7,marginBottom:30,
              maxWidth:680,
            }}>
              Detailed operational guides covering terminals, pilotage, bunkering, agency services, and best practices for vessel operators at major ports across the globe.
            </p>

            <div className="region-grid" style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
              gap:20,
            }}>
              {regionGroups.map((region) => (
                <div key={region.label} style={{
                  background:'#111c13',
                  border:'1px solid rgba(200,168,75,.15)',
                  padding:'22px 22px',
                }}>
                  <div style={{
                    fontFamily:rj,fontSize:11,letterSpacing:'1.8px',
                    textTransform:'uppercase',color:'#c8a84b',
                    marginBottom:14,fontWeight:700,
                    display:'flex',alignItems:'center',gap:8,
                  }}>
                    <span style={{fontSize:16}}>{region.emoji}</span>
                    <span>{region.label}</span>
                    <span style={{
                      fontSize:9,color:'#7a8a72',fontWeight:600,
                      marginLeft:'auto',
                    }}>
                      {region.posts.length} {region.posts.length === 1 ? 'guide' : 'guides'}
                    </span>
                  </div>
                  <div style={{
                    display:'flex',flexWrap:'wrap',gap:6,
                  }}>
                    {region.posts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="region-link"
                        style={{
                          fontFamily:rj,fontSize:11.5,
                          padding:'5px 11px',
                          background:'rgba(200,168,75,.08)',
                          border:'1px solid rgba(200,168,75,.18)',
                          color:'#d4dcc8',
                          textDecoration:'none',
                          fontWeight:600,
                          letterSpacing:'.3px',
                          whiteSpace:'nowrap',
                        }}
                        title={p.title}
                      >
                        {getShortName(p)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop:30,textAlign:'center',
              paddingTop:24,borderTop:'1px solid rgba(200,168,75,.1)',
            }}>
              <Link href="/blog" style={{
                fontFamily:rj,fontSize:12,letterSpacing:'1.8px',
                textTransform:'uppercase',color:'#c8a84b',
                fontWeight:700,textDecoration:'none',
                padding:'12px 28px',
                border:'1px solid rgba(200,168,75,.4)',
                display:'inline-block',
              }} className="btn-gold">
                View All Port Guides →
              </Link>
            </div>
          </section>
        )}

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
                fontFamily:rj,fontSize:10,letterSpacing:'2px',
                textTransform:'uppercase',color:'#c8a84b',
                marginBottom:12,fontWeight:700,
              }}>
                Explore
              </h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Home / Search</Link></li>
                <li><Link href="/blog" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Blog & Guides</Link></li>
                <li><Link href="/for-providers" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>For Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{
                fontFamily:rj,fontSize:10,letterSpacing:'2px',
                textTransform:'uppercase',color:'#c8a84b',
                marginBottom:12,fontWeight:700,
              }}>
                Top Ports
              </h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/ports/singapore" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Singapore</Link></li>
                <li><Link href="/ports/rotterdam" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Rotterdam</Link></li>
                <li><Link href="/ports/suez" className="article-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Suez</Link></li>
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
