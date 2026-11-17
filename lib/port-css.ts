/** Styles shared by the port pages (/ports/…). */
export const PORT_CSS = `
.pt{background:var(--bg);min-height:100vh}
.pt .wrap{max-width:var(--wrap);margin:0 auto;padding:0 var(--gutter)}
.pt .crumbs{font-size:13.5px;color:var(--ink3);padding-top:18px}
.pt .crumbs a{color:var(--ink3);text-decoration:none}.pt .crumbs a:hover{color:var(--acc)}
.pt h1{font-size:clamp(26px,4vw,40px);margin:14px 0 0;letter-spacing:-0.03em;line-height:1.12;font-weight:800}
.pt .lead{color:var(--ink2);font-size:17px;line-height:1.55;margin:12px 0 22px;max-width:800px}
.pt .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.pt h2{font-size:20px;margin:0 0 12px;letter-spacing:-0.02em;font-weight:750}.pt h2 span{color:var(--ink3);font-weight:500}
.pt .facts dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 20px;margin:0}
.pt .facts dt{font-size:12.5px;color:var(--ink3);font-weight:600}.pt .facts dd{margin:2px 0 0;font-weight:600}
.pt .note{color:var(--ink2);line-height:1.6;margin:14px 0 0}.pt .tiny{color:var(--ink3);font-size:12.5px;margin:8px 0 0}
.pt .sec{margin-top:30px}
.pt .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.pt .join{margin-top:30px;display:flex;gap:20px;align-items:center;justify-content:space-between;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 10%,var(--card)),var(--card))}
.pt .join h2{font-size:19px;margin-bottom:6px}.pt .join p{color:var(--ink2);margin:0;line-height:1.55}
.pt .btn{background:var(--acc);color:var(--on-acc);padding:12px 18px;border-radius:10px;font-weight:650;text-decoration:none;white-space:nowrap}
.pt .links{display:flex;flex-wrap:wrap;gap:8px}.pt .links.col{flex-direction:column;align-items:flex-start}
.pt .links a{border:1px solid var(--line);background:var(--card);border-radius:9px;padding:8px 12px;font-size:14.5px;color:var(--ink);text-decoration:none}
.pt .links a:hover{border-color:var(--acc);color:var(--acc)}.pt .links a span{color:var(--ink3)}
.pt .faq{margin:0;display:grid;gap:10px}.pt .faq div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.pt .faq dt{font-weight:650}.pt .faq dd{margin:5px 0 0;color:var(--ink2);line-height:1.6}
@media (max-width:960px){.pt .grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pt .facts dl{grid-template-columns:repeat(2,minmax(0,1fr))}.pt .join{flex-direction:column;align-items:flex-start}}
.pt .ghost{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:11px 16px;border-radius:10px;font-weight:600;text-decoration:none;white-space:nowrap}
.pt .empty{text-align:center;padding:28px 20px}
.pt .empty~.join{display:none}
.pt .empty .em-ico{display:inline-flex;width:52px;height:52px;border-radius:14px;align-items:center;justify-content:center;font-size:24px;background:color-mix(in srgb,var(--acc) 10%,var(--card));margin-bottom:10px}
.pt .empty .note{margin:6px auto 0;max-width:520px}
.pt .em-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}
@media (max-width:620px){
  .pt .grid{grid-template-columns:1fr}
  .pt main.wrap{display:flex;flex-direction:column}
  .pt main.wrap>*{min-width:0}
  .pt .crumbs{display:none}
  .pt h1{font-size:24px;margin-top:16px}
  .pt .lead{font-size:15px;margin:8px 0 16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .pt .sec{margin-top:22px}
  .pt h2{font-size:18px}
  .pt .more{order:2}
  .pt .join{order:1;padding:18px}
  .pt .join .btn,.pt .em-cta a{width:100%;text-align:center;box-sizing:border-box}
  .pt .facts dl{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pt .empty{padding:22px 16px}
  .pt .empty h2{font-size:18px}
  .pt .links a{font-size:14px;padding:7px 11px}
}
`;
