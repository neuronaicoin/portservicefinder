import Link from 'next/link';

/** Operator call to action on port pages: one request, quotes from the companies listed there. */
export function RfqCta({ port, country, service, label }: { port: string; country: string; service?: string; label?: string }) {
  const q = new URLSearchParams({ country, port, ...(service ? { service } : {}) });
  return (
    <section className="rfq-cta" aria-label="Request quotes">
      <div>
        <p className="rfq-k">For ship operators &amp; managers</p>
        <h2>Need {label ? `a ${label.toLowerCase()}` : 'an agent, supplies or a service'} in {port}?</h2>
        <p>Send one request with your ETA and needs. Companies listed at {port} reply with quotes directly. Free, no commission, no login.</p>
      </div>
      <Link href={`/request-quote?${q.toString()}`} className="rfq-btn">Get quotes in {port}</Link>
      <style>{`
        .rfq-cta{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:18px 0;padding:18px 20px;border-radius:14px;background:linear-gradient(135deg,#0d1030,#16224a);border:1px solid #d6b25e55;color:#fff}
        .rfq-cta>div{flex:1 1 320px;min-width:0}
        .rfq-k{margin:0 0 4px;color:#d6b25e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
        .rfq-cta h2{margin:0 0 6px;font-size:20px;line-height:1.25;color:#fff;overflow-wrap:anywhere}
        .rfq-cta p{margin:0;color:#c9d2e3;font-size:14px;line-height:1.5}
        .rfq-btn{flex:0 0 auto;max-width:100%;background:#d6b25e;color:#0d1030!important;font-weight:800;padding:12px 18px;border-radius:10px;text-decoration:none;text-align:center;overflow-wrap:anywhere}
        @media(max-width:520px){.rfq-btn{flex:1 1 100%}}
      `}</style>
    </section>
  );
}
