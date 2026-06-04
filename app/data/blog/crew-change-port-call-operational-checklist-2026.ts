import type { BlogPost } from '../blog-posts';

export const post: BlogPost = {
  slug: 'crew-change-port-call-operational-checklist-2026',
  title: 'Crew Change During Port Call: Operational Checklist for Ship Operators',
  excerpt: 'A complete operational checklist for crew change at any port — pre-arrival planning, documentation, sign-on/sign-off procedures, common pitfalls, and port-specific considerations for major hubs.',
  date: '2026-05-27',
  readTime: '16 min',
  category: 'Operations',
  author: 'Maritime industry professional',
  heroImage: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1600&q=80&auto=format&fit=crop',
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': 'https://www.portservicefinder.com/blog/crew-change-port-call-operational-checklist-2026#article',
        headline: 'Crew Change During Port Call: Operational Checklist for Ship Operators',
        description: 'A complete operational checklist for crew change at any port — pre-arrival planning, documentation, sign-on/sign-off procedures, common pitfalls, and port-specific considerations for major hubs.',
        datePublished: '2026-05-27',
        dateModified: '2026-05-27',
        author: {
          '@type': 'Organization',
          name: 'PortServiceFinder',
          url: 'https://www.portservicefinder.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PortServiceFinder',
          url: 'https://www.portservicefinder.com',
        },
        image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1600&q=80&auto=format&fit=crop',
        mainEntityOfPage: 'https://www.portservicefinder.com/blog/crew-change-port-call-operational-checklist-2026',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How far in advance should crew change be planned?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A minimum of three weeks before the port call is the operational standard. This allows time for visa processing (especially USA C1/D, Schengen, UK Seaman visa), medical certificate renewal if needed, flight booking before fares spike, and agency nomination at the port. For ports with strict immigration (USA, Australia, UAE), four to six weeks is safer. Last-minute crew changes within 48 hours are possible at flexible ports like Singapore or Rotterdam but carry significant cost premiums.',
            },
          },
          {
            '@type': 'Question',
            name: 'What documents must a seafarer carry for crew change?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Standard documents required for sign-on or sign-off: valid passport with minimum six months validity, Seaman Book (CDC), valid STCW certificates (Basic Safety Training, Advanced Fire Fighting, Medical First Aid, Personal Survival Techniques, Security Awareness), medical fitness certificate (ENG1 or equivalent, valid two years), Certificate of Competency (CoC) for officers, flag state endorsement, valid visa for the country of crew change, yellow fever vaccination if applicable, and employment contract or letter of guarantee. Some ports also require COVID-related documents depending on current health regulations.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does a typical crew change cost at a major port?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Crew change costs vary by port and crew nationality. Per officer at major hubs: Singapore $1,200-1,800, Rotterdam $1,400-2,000, Houston $2,500-3,500 (due to C1/D visa requirements and US transit complexity), Fujairah $1,000-1,500, Istanbul $900-1,400, Hong Kong $1,500-2,200. Costs include agency fee, hotel one to two nights, transport from airport to port and back, immigration assistance, and standard documentation. Costs rise significantly with last-minute bookings, visa issues, or weekend operations.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the C1/D visa and which seafarers need it?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The C1/D visa is a combined transit visa issued by the United States allowing seafarers to enter US territory for the sole purpose of joining or leaving a vessel. Any seafarer of a nationality requiring a US visa who needs to sign on or sign off a ship in a US port must have a valid C1/D visa. Application requires DS-160 form, interview at a US embassy, letter of guarantee from the manning agency, and Seaman Book. Processing time can range from two weeks to two months depending on the embassy. Refusal rates are high for first-time applicants from certain nationalities.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can crew change be done at anchorage instead of alongside?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, crew change at anchorage is common at ports like Singapore Eastern Anchorage, Fujairah OPL, Hong Kong Western Anchorage, and Gibraltar. Launch boat transfers signing-off crew to shore and brings signing-on crew to the vessel. Anchorage crew change typically costs $200-500 more per crew due to launch boat charges but saves berthing fees and pilotage. Weather, sea state, and pilot ladder safety are critical factors. Some flag states have specific requirements for pilot ladder rigging during crew transfers.',
            },
          },
        ],
      },
    ],
  },
  content: `
<p>Crew change is one of the most operationally complex events during a port call. It involves immigration, customs, transportation, medical compliance, visa procedures, manning agency coordination, and port agency execution — all converging on a vessel with a hard departure deadline.</p>

<p>A botched crew change can cost a vessel operator anywhere from a few thousand dollars in extra agency fees to tens of thousands in delayed departure penalties. More importantly, it leaves a crew member stranded thousands of miles from home or stuck onboard past contract end — both of which create welfare, morale, and regulatory issues under the MLC 2006 (Maritime Labour Convention).</p>

<p>This guide is a practical operational checklist for vessel operators, ship agents, and crew managers handling crew change at any port worldwide. It covers the three-week planning horizon, day-of-arrival procedures, common pitfalls, and port-specific considerations for major hubs.</p>

<h2>A Sign-On That Almost Wasn't</h2>

<p>Years back I was sailing as Chief Officer on a bulk carrier heading into Houston. Two of our deck cadets were due to sign on — both Filipino, both with valid C1/D visas, both with confirmed flights from Manila via Doha. Standard crew change, two weeks of planning, everything documented.</p>

<p>The vessel was on a tight charter party. Pilot was booked. Agent was nominated. Hotel rooms blocked. And then, 36 hours before our berthing, one of the cadets was denied boarding at Doha by the airline because his Seaman Book had expired three months prior — something none of the manning agency, the vessel, or even the cadet himself had flagged. His passport was valid. His visa was valid. His STCW was valid. But without a current Seaman Book, the US Customs and Border Protection would not allow him to enter under his C1/D visa.</p>

<p>The agent in Houston scrambled. We sailed with one cadet short, the second cadet flew home from Doha, and the manning agency arranged Seaman Book renewal in Manila — a two-week process. The vessel signed him on three ports later in Rotterdam. The total extra cost, including rerouted flights, hotel nights in Doha, agency rebooking fees, and the eventual sign-on in Rotterdam, came to just over $4,200 for a single crew change that should have cost $2,800. The root cause was one document field nobody had checked.</p>

<h2>Why Crew Change Is High-Risk Operationally</h2>

<p>Unlike bunkering or stores delivery, crew change has dependencies across multiple jurisdictions, agencies, and time-sensitive validity windows. A single expired document — passport, visa, medical certificate, Seaman Book, vaccination card — can collapse the entire operation.</p>

<p>The high-risk factors that distinguish crew change from other port services:</p>

<ul>
  <li><strong>Multi-party coordination:</strong> Manning agency, port agency, immigration, customs, airline, hotel, transport company, and the vessel itself all need to align.</li>
  <li><strong>Documentation chain:</strong> Each document has independent expiry. Failure of one invalidates the whole.</li>
  <li><strong>Visa processing time:</strong> US C1/D visas alone can take 2 months for some nationalities. Last-minute crew change to USA is rarely possible.</li>
  <li><strong>Flag state requirements:</strong> Different flag states have different minimum crew requirements. Sailing one crew short may trigger Port State Control detention.</li>
  <li><strong>MLC 2006 obligations:</strong> Maximum 11 months onboard for any seafarer. Failure to repatriate on time is a violation flaggable by ITF or PSC.</li>
</ul>

<h2>Three-Week Planning Horizon</h2>

<p>For any crew change at a major port, three weeks is the minimum planning window. For US ports, ports requiring complex visas, or remote ports with limited flight connections, four to six weeks is operationally safer.</p>

<h3>Three Weeks Before Port Call</h3>

<p>This is when the crew change plan moves from intention to execution. The vessel master receives a formal crew change order from the office. The manning agency confirms availability of relievers. Documentation review begins.</p>

<p>Key actions at the three-week mark:</p>

<ul>
  <li>Confirm vessel ETA at the crew change port within a 48-hour window.</li>
  <li>Manning agency confirms reliever availability and provides crew documentation pack.</li>
  <li>Vessel office reviews all reliever documents: passport validity (min 6 months from sign-on date), Seaman Book validity, STCW expiry dates, medical certificate validity, visa status, vaccination records.</li>
  <li>Sign-off crew identified. Confirm their documentation is sufficient for travel to home country.</li>
  <li>Nominate port agency. Agency is briefed on crew change scope: number of sign-on/sign-off, nationality, special requirements (medical case, hospitalisation case, etc.).</li>
  <li>Crew matrix verified for flag state compliance after the change. Ensure no minimum manning violations.</li>
</ul>

<p>At this stage, identifying any document gap is critical. A passport expiring in 5 months is still valid today but will be expired by the time the crew member needs it for the return flight 11 months later. Most countries require 6 months passport validity beyond intended stay.</p>

<h3>Two Weeks Before Port Call</h3>

<p>This is when bookings happen. Flight prices spike inside the two-week window, so cost discipline matters here.</p>

<ul>
  <li>Manning agency books flights for both sign-on and sign-off crew. Wherever possible, route via airline alliances with reliable transit experience for seafarers (Emirates, Qatar Airways, Singapore Airlines, Turkish Airlines all have established seafarer transit handling).</li>
  <li>Port agency books hotel accommodation. Single rooms standard. Confirm hotel can hold rooms with late arrival.</li>
  <li>Visas confirmed valid for entry. Multiple-entry visas verified if crew is transiting.</li>
  <li>Letter of Guarantee from manning agency or vessel owner prepared for immigration. Some ports require this in original hard copy.</li>
  <li>Medical certificates rechecked. Anyone whose ENG1 or equivalent expires within 60 days of sign-on is flagged for renewal.</li>
  <li>If crew change involves USA, verify C1/D visa pages are still valid and not damaged. Some immigration officers refuse damaged visas.</li>
</ul>

<h3>One Week Before Port Call</h3>

<p>Operational fine-tuning. ETA stabilises within a 12-hour window. Final document checks.</p>

<ul>
  <li>Vessel ETA confirmed within 12 hours.</li>
  <li>Crew change format confirmed: alongside or anchorage? If anchorage, launch boat is booked.</li>
  <li>Final passport-to-flight name matching check. Every airline boarding pass name must match passport exactly. Even a missing middle name has caused denied boarding.</li>
  <li>Sign-off crew briefed on flight schedule, hotel, transport.</li>
  <li>Sign-on crew receives joining instructions: flight number, hotel name, agent contact, port name, vessel name, expected boarding time.</li>
  <li>Agency confirms immigration appointments where applicable (some ports require pre-booked immigration slots).</li>
  <li>Vessel prepares accommodation: cabins cleaned, linen changed, joining crew kits prepared by Chief Officer.</li>
</ul>

<h3>48 Hours Before Arrival</h3>

<p>The crew change becomes irreversible inside 48 hours. Flights are confirmed, hotel rooms are booked, immigration is notified.</p>

<ul>
  <li>Final ETA confirmation to agent and manning agency.</li>
  <li>Sign-on crew lands at destination airport. Agent meets them. Transports to hotel.</li>
  <li>Sign-off crew flight bookings finalised. Departure timing matched to vessel ETD.</li>
  <li>Agent submits crew list to immigration and customs.</li>
  <li>Vessel master prepares sign-off documentation: completed Seaman Book entries, completed Articles of Agreement entries, end-of-contract letters, repatriation forms, medical clearance if needed.</li>
  <li>If any reliever is delayed or unable to fly, decision point: sail short, or delay vessel? This is an office-level decision involving commercial, operational, and compliance considerations.</li>
</ul>

<h2>Day of Crew Change — Operational Checklist</h2>

<p>The crew change day itself is a tight sequence of dependent steps. Each step has a critical path.</p>

<h3>Pre-Arrival (4-6 hours before berthing)</h3>

<ul>
  <li>Vessel master confirms berthing time with pilot station.</li>
  <li>Agent confirms transport from hotel to port: vehicle, driver, ETA at port.</li>
  <li>Customs and immigration confirmed for boarding upon arrival.</li>
  <li>Master prepares: crew list (sign-on and sign-off), passports, Seaman Books, Letter of Guarantee, vessel security plan, last 10 ports list.</li>
</ul>

<h3>Arrival and Boarding</h3>

<ul>
  <li>Pilot boards. Vessel proceeds to berth.</li>
  <li>Once alongside and gangway is down, agent boards immediately with immigration and customs.</li>
  <li>Sign-off crew has passports and Seaman Books ready, packed luggage stacked at gangway.</li>
  <li>Sign-on crew waits at gangway side ashore with the agent's driver. They do not board until cleared by immigration.</li>
</ul>

<h3>Sign-Off Procedure</h3>

<ul>
  <li>Master makes final Seaman Book entry: end of service, signature, vessel stamp.</li>
  <li>Articles of Agreement closed for each sign-off seafarer.</li>
  <li>Wages calculation finalised. Any pending amounts noted.</li>
  <li>Personal effects searched if required by flag state or port regulation.</li>
  <li>Immigration stamps Seaman Books and passports.</li>
  <li>Sign-off crew disembarks. Agent escorts to vehicle. Transport to hotel or directly to airport depending on flight timing.</li>
</ul>

<h3>Sign-On Procedure</h3>

<ul>
  <li>Sign-on crew boards after immigration clearance.</li>
  <li>Master opens new Articles of Agreement entry for each sign-on seafarer.</li>
  <li>Seaman Book first entry made: vessel name, position, sign-on date and port, master signature, vessel stamp.</li>
  <li>Sign-on briefing: vessel familiarisation, safety briefing, drug and alcohol policy, security level, watch schedule.</li>
  <li>Cabin assignment. PPE issued. Medical declaration filed.</li>
  <li>Personal documents collected by Chief Officer: passport, Seaman Book, STCW, medical certificate, CoC. Stored in vessel safe.</li>
</ul>

<h3>Final Documentation</h3>

<ul>
  <li>Updated crew list signed by master.</li>
  <li>Submitted to agent for departure clearance.</li>
  <li>Crew change confirmation email sent to office and manning agency.</li>
  <li>Photographs of all new crew documents archived for office records.</li>
</ul>

<h2>Cost Breakdown at Major Ports</h2>

<p>Crew change cost varies significantly by port, nationality of crew, and complexity of the operation. The following table reflects average costs per officer-level crew member at major hubs in 2026:</p>

<table style="width:100%; border-collapse:collapse; margin:24px 0;">
  <thead>
    <tr style="background:rgba(200,168,75,.1); border-bottom:2px solid #c8a84b;">
      <th style="padding:10px; text-align:left; font-family:'Rajdhani',sans-serif; font-size:12px; letter-spacing:1px;">PORT</th>
      <th style="padding:10px; text-align:right; font-family:'Rajdhani',sans-serif; font-size:12px; letter-spacing:1px;">PER OFFICER (USD)</th>
      <th style="padding:10px; text-align:left; font-family:'Rajdhani',sans-serif; font-size:12px; letter-spacing:1px;">NOTES</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Singapore</td>
      <td style="padding:10px; text-align:right;">$1,200 - $1,800</td>
      <td style="padding:10px; font-size:13px;">Efficient. Anchorage or alongside.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Rotterdam</td>
      <td style="padding:10px; text-align:right;">$1,400 - $2,000</td>
      <td style="padding:10px; font-size:13px;">EU Schengen rules apply.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Houston</td>
      <td style="padding:10px; text-align:right;">$2,500 - $3,500</td>
      <td style="padding:10px; font-size:13px;">C1/D visa required. Higher complexity.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Fujairah</td>
      <td style="padding:10px; text-align:right;">$1,000 - $1,500</td>
      <td style="padding:10px; font-size:13px;">OPL crew change common.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Istanbul</td>
      <td style="padding:10px; text-align:right;">$900 - $1,400</td>
      <td style="padding:10px; font-size:13px;">Bosphorus transit common.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Hong Kong</td>
      <td style="padding:10px; text-align:right;">$1,500 - $2,200</td>
      <td style="padding:10px; font-size:13px;">Western Anchorage option.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Antwerp</td>
      <td style="padding:10px; text-align:right;">$1,300 - $1,900</td>
      <td style="padding:10px; font-size:13px;">Belgian/Dutch land transit option.</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(200,168,75,.15);">
      <td style="padding:10px;">Hamburg</td>
      <td style="padding:10px; text-align:right;">$1,400 - $2,100</td>
      <td style="padding:10px; font-size:13px;">EU Schengen rules apply.</td>
    </tr>
    <tr>
      <td style="padding:10px;">Suez / Port Said</td>
      <td style="padding:10px; text-align:right;">$1,100 - $1,700</td>
      <td style="padding:10px; font-size:13px;">During canal transit.</td>
    </tr>
  </tbody>
</table>

<p>Cost increases significantly with: last-minute booking (within 7 days), weekend or holiday operations, visa rejection requiring rebooking, hospitalisation cases, or denied boarding incidents. Budget operators typically run 10-20% over the lower bound. Premium operators with strong agency relationships often beat the lower bound through standing agreements.</p>

<h2>Common Pitfalls and How to Avoid Them</h2>

<h3>Pitfall 1: Document Expiry Within Travel Window</h3>

<p>The most frequent and most preventable cause of failed crew change. Passport expiring within 6 months, Seaman Book expired, STCW certificates expired, medical certificate expired during the contract period — any of these can deny boarding or deny entry.</p>

<p><strong>Solution:</strong> Three-week document review with explicit field-by-field validity check. Track expiry dates in a manning database with 90-day expiry alerts.</p>

<h3>Pitfall 2: Visa Issues</h3>

<p>USA C1/D visa rejections are the most damaging. Schengen visa rejections for crew transiting Europe also common. UK Seaman visa requirements often missed for vessels calling UK ports.</p>

<p><strong>Solution:</strong> Apply for visas at least 8 weeks before planned sign-on. Maintain a database of crew with valid visas to enable rapid deployment. Build relationships with manning agencies experienced in specific embassy procedures.</p>

<h3>Pitfall 3: Flight Disruption</h3>

<p>Cancelled flights, missed connections, baggage delays. Common in monsoon season for Asian routes, winter for European routes, hurricane season for Caribbean routes.</p>

<p><strong>Solution:</strong> Book flights with at least 6-hour transit margin. Avoid one-stop connections during weather-sensitive seasons. Confirm baggage allowance covers seafarer kits (often 30+ kg).</p>

<h3>Pitfall 4: Hotel No-Show or Overbooking</h3>

<p>Late arrival, overbooked hotels, hotel located too far from port, hotel rejecting crew without local sponsorship letter.</p>

<p><strong>Solution:</strong> Use agency-recommended hotels with established seafarer arrival procedures. Confirm hotel acceptance of late arrival in writing. Maintain a backup hotel option.</p>

<h3>Pitfall 5: Customs and Immigration Delays</h3>

<p>Immigration officers refusing entry, customs holding personal effects, document discrepancies between vessel crew list and immigration record.</p>

<p><strong>Solution:</strong> Submit crew list at least 24 hours before arrival. Ensure exact name spelling consistency across passport, Seaman Book, crew list, and visa. Maintain Letter of Guarantee in original hard copy.</p>

<h3>Pitfall 6: Anchorage Weather</h3>

<p>For anchorage crew change at Singapore Eastern, Fujairah OPL, or Hong Kong Western, sea state and wind can prevent safe launch boat operations.</p>

<p><strong>Solution:</strong> Monitor weather 48 hours ahead. Have alongside contingency arranged. Brief launch boat crew on pilot ladder rigging standards. Avoid anchorage crew change during monsoon peaks if alternative ports are available.</p>

<h2>Port-Specific Considerations</h2>

<h3>Singapore</h3>

<p>The world's most efficient crew change hub. <a href="/blog/singapore-port-complete-guide-2026">Singapore</a> handles approximately 100,000 crew changes annually with established procedures, immigration efficiency, and excellent flight connectivity through Changi. Crew change available alongside, at anchorage, or at OPL. Most major manning agencies maintain Singapore offices for rapid response.</p>

<h3>Rotterdam</h3>

<p>Europe's primary crew change port. <a href="/blog/rotterdam-port-complete-guide-2026">Rotterdam</a> offers EU Schengen-compliant processing for nationalities holding Schengen visas. Schiphol airport (45 minutes by car) handles most crew flights. Land transit to Antwerp or Hamburg also feasible for crew on tight schedules.</p>

<h3>Houston</h3>

<p>The most complex crew change port for non-US nationalities. C1/D visa absolutely required. CBP inspection is strict. Crew change typically takes 3-4 hours from berthing to sign-on/sign-off completion. Houston agents with strong CBP relationships add significant value through faster clearance.</p>

<h3>Istanbul (Türk Boğazı)</h3>

<p>Bosphorus transits offer a unique crew change opportunity — <a href="/blog/istanbul-turkish-straits-complete-guide-2026">vessels transiting the Turkish Straits</a> can arrange crew change at Ahirkapi anchorage with Istanbul agency support. Istanbul airport (50 km from Ahirkapi) provides excellent connectivity. Cost-effective option for vessels in Black Sea or Mediterranean trade.</p>

<h3>Fujairah</h3>

<p>OPL (Outside Port Limits) crew change is the standard at Fujairah. Cost-effective, no berthing fees, launch boat handles transfer. Sharjah airport (90 minutes by car) or Dubai airport (60 minutes) handle flights. UAE visa-on-arrival available for many nationalities, simplifying process.</p>

<h3>Hong Kong</h3>

<p>Western Anchorage crew change common. Hong Kong International Airport extremely well-connected for Asian crew. Maintain awareness of recent immigration policy changes affecting seafarer transit.</p>

<h2>The Role of Port Agency in Crew Change</h2>

<p>A good port agency is the single most important factor in successful crew change. The difference between a $1,200 and a $1,800 crew change at the same port is usually agency capability and relationships, not actual cost difference.</p>

<p>Key qualities of an effective crew change agent:</p>

<ul>
  <li>24/7 boarding officer availability.</li>
  <li>Established CBP / immigration / customs relationships.</li>
  <li>Preferred hotel network with seafarer-friendly procedures.</li>
  <li>Reliable transport partners for airport-port-airport runs.</li>
  <li>English-language communication with vessel and manning agency.</li>
  <li>Experience with the specific flag state of the vessel.</li>
  <li>Membership in FONASBA, ITIC insurance, or other professional certifications.</li>
</ul>

<p>Vessel operators traditionally find crew change agents through long-standing relationships, broker networks, or trial and error. PortServiceFinder centralises this discovery — operators can search verified ship agents at any major port worldwide and compare contact details, service scope, and verification status before nominating.</p>

<h2>Conclusion</h2>

<p>Crew change is a high-risk operational event with low tolerance for documentation gaps, timing errors, or weak agency execution. The three-week planning horizon, methodical document validation, and selection of a competent port agency are the three controllable factors that determine success.</p>

<p>For vessel operators, the operational discipline of running crew change to a structured checklist — rather than ad-hoc per port — reduces cost variance, avoids welfare violations, and prevents the kind of last-minute crises that can cascade into chartering disputes. The framework outlined in this guide is designed to be adapted to any vessel's specific operational profile.</p>

<p>Finding verified ship agents at every major crew change hub is the first step. <a href="/">Search PortServiceFinder</a> to locate ship agents at Singapore, Rotterdam, Houston, Fujairah, Istanbul, Hong Kong, Antwerp, Hamburg, Suez, and over 1,200 other ports worldwide. Free for vessel operators, no commission, no hidden fees.</p>
`,
};
