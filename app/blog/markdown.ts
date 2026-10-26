// ============================================================
// Small, dependency-free Markdown renderer for blog posts (server side only).
// Supports: ## / ### / #### headings (with ids for the table of contents), paragraphs,
// bullet and numbered lists, tables (wrapped so they scroll on phones), blockquotes,
// horizontal rules, **bold**, *italic*, `code` and [links](/path).
// Internal links are checked: merged posts point at the kept post, and /ports/<slug>
// links that do not match a real port fall back to the ports index.
// ============================================================
import { BLOG_REDIRECTS } from '@/app/data/blog/redirects';
import { portBySlug } from '@/lib/ports';

export type Heading = { id: string; text: string; level: 2 | 3 };
export type Faq = { question: string; answer: string };

const SITE = 'https://www.portservicefinder.com';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Plain text version of a line of Markdown (for ids, FAQ schema and the TOC). */
export function stripInline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyHeading(s: string): string {
  return stripInline(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

/** Resolve a link target: rewrite merged posts, validate port slugs, mark external links. */
export function resolveHref(raw: string): { href: string; external: boolean } {
  const url = raw.trim();
  if (/^https?:\/\//i.test(url)) {
    const internal = url.replace(/^https?:\/\/(www\.)?portservicefinder\.com/i, '');
    if (internal !== url) return resolveHref(internal || '/');
    return { href: url, external: true };
  }
  if (/^(mailto:|tel:|#)/i.test(url)) return { href: url, external: false };
  if (!url.startsWith('/')) return { href: '/' + url, external: false };

  const [path, hash] = url.split('#');
  const clean = path.replace(/\/+$/, '') || '/';
  let out = clean;
  const blog = clean.match(/^\/blog\/([^/?]+)$/);
  if (blog && BLOG_REDIRECTS[blog[1]]) out = `/blog/${BLOG_REDIRECTS[blog[1]]}`;
  const port = clean.match(/^\/ports\/([^/?]+)$/);
  if (port && !portBySlug(decodeURIComponent(port[1]).toLowerCase())) out = '/ports';
  return { href: out + (hash ? `#${hash}` : ''), external: false };
}

function renderInline(text: string): string {
  const slots: string[] = [];
  const hold = (html: string) => `\u0000${slots.push(html) - 1}\u0000`;

  let s = text.replace(/`([^`]+)`/g, (_, code: string) => hold(`<code>${escapeHtml(code)}</code>`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
    const { href, external } = resolveHref(url);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return hold(`<a href="${escapeHtml(href)}"${attrs}>${renderInline(label)}</a>`);
  });
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => slots[Number(i)]);
}

function renderTable(rows: string[]): string {
  const cells = (r: string) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isSep = (r: string) => /^\|?[\s:|-]+\|?$/.test(r.trim()) && r.includes('-');
  let head: string[] | null = null;
  const body: string[][] = [];
  rows.forEach((r, i) => {
    if (isSep(r)) return;
    if (i === 0 && rows[1] && isSep(rows[1])) head = cells(r);
    else body.push(cells(r));
  });
  const h = head as string[] | null;
  const thead = h ? `<thead><tr>${h.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr></thead>` : '';
  const tbody = `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="bp-table" role="region" aria-label="Table" tabindex="0"><table>${thead}${tbody}</table></div>`;
}

const isBoldLine = (l: string) => /^\*\*[^*].*\*\*:?$/.test(l.trim());

/** Render post Markdown to HTML and collect its headings. */
export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let para: string[] = [];

  const uniqueId = (text: string) => {
    const base = slugifyHeading(text);
    const n = used.get(base) || 0;
    used.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  };
  const flush = () => {
    if (para.length) out.push(`<p>${renderInline(para.join(' '))}</p>`);
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (!t) { flush(); continue; }

    const h = t.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (h) {
      flush();
      const level = h[1].length <= 2 ? 2 : h[1].length === 3 ? 3 : 4;
      const text = h[2];
      if (level === 4) { out.push(`<h4>${renderInline(text)}</h4>`); continue; }
      const id = uniqueId(text);
      headings.push({ id, text: stripInline(text), level: level as 2 | 3 });
      out.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flush(); out.push('<hr/>'); continue; }

    if (t.startsWith('|')) {
      flush();
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      i--;
      out.push(renderTable(rows));
      continue;
    }

    if (/^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      flush();
      const ordered = /^\d+[.)]\s+/.test(t);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (ordered ? /^\d+[.)]\s+/.test(l) : /^[-*•]\s+/.test(l)) {
          items.push(l.replace(ordered ? /^\d+[.)]\s+/ : /^[-*•]\s+/, ''));
        } else if (l && items.length && /^\s{2,}\S/.test(lines[i]) ) {
          items[items.length - 1] += ' ' + l;
        } else break;
        i++;
      }
      i--;
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    if (t.startsWith('>')) {
      flush();
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) q.push(lines[i++].trim().replace(/^>\s?/, ''));
      i--;
      out.push(`<blockquote><p>${renderInline(q.join(' '))}</p></blockquote>`);
      continue;
    }

    // A line that is entirely bold (often a FAQ question) stands on its own.
    if (isBoldLine(t)) { flush(); out.push(`<p class="bp-q">${renderInline(t)}</p>`); continue; }

    para.push(t);
  }
  flush();
  return { html: out.join('\n'), headings };
}

/** Pull question and answer pairs out of a post for FAQPage structured data. */
export function extractFaqs(md: string): Faq[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const faqs: Faq[] = [];
  let inFaq = false;
  let q: string | null = null;
  let a: string[] = [];
  const push = () => {
    if (q) {
      const answer = stripInline(a.join(' ').replace(/^A:\s*/i, '')).slice(0, 1000);
      if (q.length > 5 && answer.length > 20) faqs.push({ question: q, answer });
    }
    q = null;
    a = [];
  };

  for (const raw of lines) {
    const t = raw.trim();
    const h2 = t.match(/^##\s+(.+)/);
    if (h2 && !t.startsWith('###')) {
      push();
      inFaq = /faq|frequently asked|common questions/i.test(h2[1]);
      continue;
    }
    const h3 = t.match(/^###\s+(.+)/);
    const bold = t.match(/^\*\*(.+?)\*\*:?$/);
    const candidate = (h3 && h3[1]) || (bold && bold[1]) || null;
    if (candidate) {
      const text = stripInline(candidate).replace(/^Q[:.]\s*/i, '').trim();
      const explicitQ = /^Q[:.]/i.test(stripInline(candidate));
      if ((inFaq && text.endsWith('?')) || explicitQ) {
        push();
        q = text.endsWith('?') ? text : `${text}?`;
        continue;
      }
      if (h3 && inFaq) { push(); continue; }
    }
    if (q && t && t !== '---') a.push(t.replace(/^[-*]\s+/, ''));
  }
  push();
  const seen = new Set<string>();
  return faqs.filter((f) => (seen.has(f.question) ? false : (seen.add(f.question), true))).slice(0, 20);
}

export function absoluteUrl(path: string): string {
  return `${SITE}${path === '/' ? '' : path}`;
}
