import { BlogPost } from './types';

export const vesselTechnicalServiceVisits: BlogPost = {
  slug: 'vessel-technical-service-visits-port-coordination-guide-2026',
  title: 'Vessel Technical Service Visits: Operator Guide to Coordinating Engine, ECDIS, and Class Surveys at Port',
  excerpt: 'Complete operational guide for coordinating technical service visits at port — main engine, boiler, ECDIS, GMDSS, LSA, class surveys, BWTS. Spare parts logistics, service engineer coordination, port-specific considerations.',
  metaDescription: 'Coordinating vessel technical service visits at port 2026: main engine, boiler, ECDIS, GMDSS, liferaft, class surveys. Spare parts logistics, service engineer coordination, costs, port-specific guidance.',
  keywords: [
    'main engine service at port',
    'ECDIS update service vessel',
    'vessel technical service coordination',
    'class survey at port',
    'boiler service ship port',
    'marine service provider port visit',
    'GMDSS radio survey',
    'BWTS service port',
    'liferaft service vessel',
    'spare parts vessel customs clearance',
    'hot work permit port',
    'Wartsila MAN service port',
  ],
  category: 'industry-insights',
  featuredPort: 'Operations',
  author: 'PortServiceFinder Editorial Team',
  publishedDate: '2026-05-27',
  readingTime: 18,
  content: `
## Introduction

Technical service visits during a port call are the operational backbone of vessel maintenance. Every commercial vessel — regardless of age, flag, or trade — requires regular shoreside service interventions that cannot be performed by the ship's own crew. Main engine overhauls, ECDIS chart updates, GMDSS radio surveys, liferaft servicing, boiler maintenance, BWTS calibration, class surveys — each carries its own technical scope, regulatory requirement, time pressure, and coordination complexity.

Unlike crew change or bunker supply, which are relatively standardized operations, technical service visits vary enormously in scope. A single port call may involve five different service companies, four different spare parts shipments through customs, two different class society attendances, and a tight critical path where any single delay can extend the vessel's port stay by 24-48 hours. Each extra day represents significant lost charter income for the operator and operational disruption for the trade.

This guide provides a practical framework for vessel operators, technical superintendents, chief engineers, and ship agents coordinating technical service visits at any port worldwide. It covers service categories, pre-arrival planning, spare parts logistics, service engineer coordination, port-specific capabilities, common pitfalls, and the cost framework that drives operational decisions.

---

## The ECDIS Update That Cost Three Days

A few years back I was Chief Officer on a multipurpose vessel routing from Tuzla through the Mediterranean to West Africa. Our ECDIS was the primary navigation system, paperless approved by flag state. The ENC (Electronic Navigational Chart) license was due for renewal in 18 days — well before our West Africa arrival. The technical superintendent assured us renewal would be arranged at Gibraltar bunker call.

What happened at Gibraltar was a small disaster. The ENC vendor service representative was flying in from Madrid that morning. His flight was delayed six hours. By the time he reached the anchorage launch, our 4-hour bunker stop was already complete and we were lifting anchor. The bunker barge had departed. The pilot was waiting.

We sailed without the ECDIS renewal. Two weeks later, approaching Lagos approach channel, the ECDIS displayed an "ENC expired" warning. By the IMO ECDIS performance standards, an expired ENC means the system cannot be used as the primary means of navigation. We had no paper backup charts for West African coast — the vessel was fully paperless approved. Lagos pilots refused to board until we had operational navigation charts.

Three days at anchorage. Emergency air-freight of paper charts from Singapore (USD 4,800). Emergency service technician flown to Lagos (USD 6,200). Lost charter time at approximately USD 18,000 per day. A USD 850 ECDIS service that should have been done at Gibraltar ended up costing nearly USD 65,000 in cascading costs. The root cause was not the service company — it was coordination. Nobody had built a buffer for the service engineer's flight delay, and nobody had a backup plan if the service window was missed.

That incident shaped how I think about technical service coordination. Every service visit needs a primary plan, a backup plan, and a contingency for what happens if the service is not completed on schedule.

---

## Service Categories That Require Port Visits

Vessel technical services that typically require shoreside specialists fall into clear categories. Understanding the scope, time requirements, and criticality of each is essential for proper coordination.

### Main Engine and Auxiliary Engine Services

Main engine maintenance is the most operationally significant category. Manufacturers (MAN Energy Solutions, Wärtsilä, MaK, Caterpillar Marine) authorise specific service partners worldwide, and many warranty terms require manufacturer-authorised service for major interventions.

**Common main engine port services:**

- Major running hours overhaul (typically every 12,000-24,000 hours)
- Top overhaul (cylinder head, piston, liner work)
- Fuel injection equipment overhaul
- Turbocharger overhaul
- Crankshaft alignment and deflection
- Vibration analysis and balancing
- Emission compliance testing (IMO Tier II/III)
- Performance testing and tuning

**Time requirement:** 24 hours to 7 days depending on scope. Top overhaul typically 36-72 hours. Major overhaul can require drydock.

**Auxiliary engine services:** Similar scope, typically faster (12-48 hours), but no less critical since auxiliaries provide ship's electrical supply.

### Boiler and Steam System Services

Tanker vessels, particularly with steam-driven cargo pumps, depend on boiler operations. Even non-tanker vessels have auxiliary boilers for fuel heating and accommodation steam.

**Common boiler services:**

- Internal inspection and gauging
- Tube renewal or repair
- Combustion equipment service
- Safety valve testing and recalibration
- Water treatment system service
- Exhaust gas economiser cleaning
- Refractory inspection and repair

**Time requirement:** 12-48 hours typical. Tube renewal can extend to 72+ hours.

**Critical consideration:** Boilers require complete cooldown before internal access, then reheating to operational temperature after work. Plan total downtime, not just service hours.

### Navigation and Communication Services

Navigation electronics require manufacturer-certified service for compliance with SOLAS and flag state requirements.

**ECDIS (Electronic Chart Display and Information System):**

- ENC chart update (mandatory weekly via subscription)
- ECDIS software upgrade
- Performance check per IMO standards
- Backup system verification

**GMDSS (Global Maritime Distress and Safety System):**

- Annual radio survey (mandatory)
- VHF, MF/HF, Inmarsat equipment testing
- EPIRB and SART battery service
- DSC (Digital Selective Calling) verification
- Antenna inspection

**Other navigation services:**

- Gyrocompass calibration
- Radar maintenance
- AIS service
- Voyage Data Recorder (VDR) annual performance test
- Speed log service

**Time requirement:** Most services 2-6 hours. GMDSS annual survey 3-8 hours.

### Life-Saving Appliances (LSA) Services

LSA services are heavily regulated under SOLAS and require certified service stations.

**Common LSA services:**

- Annual liferaft service (mandatory)
- Lifeboat annual service and load testing
- Davit and launching gear inspection
- Hydrostatic Release Unit (HRU) replacement
- Lifejacket inspection
- Immersion suit hydrostatic testing
- EPIRB and SART service

**Critical consideration:** Liferafts must be sent to certified service stations ashore. This typically takes 7-14 days. Service must be coordinated with port stay or a longer call. Many operators stagger liferaft service across multiple ports so the vessel never lacks compliant equipment.

### Fire Fighting and Safety Services

**Common fire-fighting services:**

- Fixed CO2 system inspection and weighing
- Fire detection system service
- Portable extinguisher service
- Foam system testing
- Emergency fire pump service
- Fire main pressure testing

**Time requirement:** 4-12 hours for most services. Annual CO2 weighing typically 4-6 hours.

### Refrigeration and HVAC Services

Reefer cargo vessels require specialized refrigeration service. All vessels have HVAC for accommodation and provisions cooling.

**Common services:**

- Reefer container plug testing (for container vessels)
- Provisions refrigeration service
- HVAC chiller service
- Refrigerant management (HFC, ammonia)
- Compressor overhaul

**Time requirement:** 6-24 hours typical.

### Hydraulic System Services

Cranes, hatch covers, steering gear, and many deck machinery items use hydraulic systems requiring specialist attention.

**Common hydraulic services:**

- Crane annual inspection and load test
- Hatch cover gasket renewal and pressure test
- Steering gear annual test
- Hydraulic oil analysis and renewal
- Hose renewal and pressure testing

**Time requirement:** 8-48 hours depending on scope. Crane load test typically 6-12 hours per crane.

### Classification Society Surveys

Class surveys are statutory requirements. Major class societies (DNV, Lloyd's Register, ABS, Bureau Veritas, ClassNK, RINA, KR, CCS) have surveyor offices at major ports worldwide.

**Annual survey:** Continuous inspection program, typically 1-2 surveyor days per visit
**Intermediate survey:** Between special surveys, typically 2-3 surveyor days
**Special survey:** Every 5 years, typically 5-15 surveyor days, often during drydock
**Damage survey:** As required after incidents
**ISM/ISPS audit:** Periodic, typically 1-2 auditor days

**Critical consideration:** Class survey scheduling has hard deadlines. Missing a survey window can result in certificate suspension and Port State Control detention.

### Ballast Water Treatment System (BWTS) Services

Since IMO BWM Convention full implementation, all vessels with BWTS require specialized service.

**Common BWTS services:**

- Annual servicing (manufacturer specific)
- UV lamp replacement (UV-type systems)
- Filter cleaning and renewal
- Sensor calibration
- Crew training and operational verification

**Time requirement:** 6-12 hours typical for annual service.

### Underwater Services

Hull and propeller services performed by certified diving companies, typically while at anchor or alongside.

**Common underwater services:**

- Hull cleaning (hull roughness reduction)
- Propeller polishing
- Anode renewal
- IWS (In-Water Survey) for class
- Sea chest inspection
- Underwater damage survey

**Time requirement:** 4-24 hours depending on vessel size and scope.

---

## Pre-Arrival Planning Framework

Technical service coordination requires the same disciplined planning horizon as crew change — three weeks minimum for routine services, six to eight weeks for major interventions requiring spare parts importation.

### Six Weeks Before Port Call (Major Services)

For major interventions requiring international spare parts shipment:

- Spare parts identified and ordered. Long-lead items (turbocharger rotors, cylinder liners, crankshaft components) may require 4-8 weeks lead time.
- Service company nominated. Quote obtained. Service agreement confirmed.
- Class society notified if survey involvement required.
- Hot work permit application initiated (some ports require 30-day notice for major hot work).
- Spare parts customs documentation prepared (commercial invoice, packing list, certificate of origin if required).
- Service engineer visa requirements verified for service company's nationality.

### Three Weeks Before Port Call

For routine technical services and standard parts shipments:

- All scheduled services confirmed: service company, scope, timing, cost.
- Spare parts air freight booked. Track expected arrival vs. vessel ETA.
- Service engineer flight booked. Hotel reserved.
- Vessel preparation requirements communicated to chief engineer: pre-cooling for boiler work, cooling water isolation for engine work, electrical isolation for navigation equipment service.
- Port agent briefed on technical service scope: customs clearance needed, hot work, special permits, multiple service engineers boarding.

### Two Weeks Before Port Call

- Spare parts in transit. Confirm tracking and expected port arrival.
- Service engineer travel finalized. Letter of invitation issued if required for visa.
- Class society surveyor scheduled and confirmed.
- Vessel preparation checklist issued to vessel: pre-arrival work to enable service efficiency (e.g., cylinder head removal preparation, system isolation, scaffolding requirements).

### One Week Before Port Call

- Spare parts arrived at port or confirmed arrival before vessel ETA.
- Customs clearance documentation in agent's hands.
- Service engineer confirmed travel.
- Hot work permits issued.
- Final scope confirmation with service company.

### 48 Hours Before Arrival

- Spare parts cleared customs, available at port.
- Service engineer arrived, hotel checked in.
- Vessel completes preparation work (engine cooldown, isolation, scaffolding).
- Final coordination call: service company, port agent, vessel, technical office.

---

## Spare Parts Logistics

Spare parts logistics is the highest-risk element of technical service coordination. A spare part stuck in customs can immobilise a vessel as effectively as a mechanical failure.

### Spare Parts Customs Clearance

Spare parts entering a port for vessel service typically benefit from "ship's spares" duty exemption, but the documentation requirements are strict.

**Required documentation:**

- Commercial invoice with vessel name, IMO number, port of delivery
- Packing list with serial numbers where applicable
- Bill of lading or air waybill
- Certificate of origin (some ports require)
- Manufacturer's declaration of compliance (for certain equipment)
- Vessel's port arrival notice from agent
- Master's request letter (some ports)

**Common documentation pitfalls:**

- Invoice not marked "Ship's spares — for vessel use only, not for resale"
- Vessel IMO number missing
- Description too generic ("engine parts" rather than specific part numbers)
- Country of origin missing
- HS commodity codes missing

### Air Freight vs Sea Freight

- **Air freight:** USD 4-15 per kg international, 2-5 days transit. Used for urgent and small-medium items.
- **Sea freight:** USD 0.50-2 per kg, 14-45 days transit. Used for large, heavy, or non-urgent items.

**Hybrid strategy:** Send major items by sea freight 6-8 weeks before service. Send last-minute critical items by air freight close to service date.

### Spare Parts Storage at Port

If parts arrive significantly before vessel arrival, secure storage is required. Port agents typically arrange bonded warehouse storage. Cost approximately USD 5-15 per cubic meter per day.

---

## Service Engineer Coordination

Service engineers are highly skilled specialists, often flying in from manufacturer service centers. Coordination requires same rigor as crew change.

### Visa Requirements

Service engineers visiting vessels at port require business visas or specific seafarer transit visas depending on jurisdiction:

- **EU Schengen:** Schengen business visa or vessel transit arrangement
- **USA:** B1 business visa or transit arrangement (NOT C1/D which is for seafarers joining/leaving vessel)
- **UAE:** Business visa or visa on arrival depending on nationality
- **Turkey:** E-visa or visa on arrival for many nationalities
- **Singapore:** Many nationalities visa-free for short visits

**Critical consideration:** Service engineer visa requirements are NOT the same as seafarer visa requirements. Manning agency procedures don't apply.

### Service Engineer Transport and Accommodation

- Airport pickup by port agent's driver
- Hotel near port (typically agent's preferred network)
- Daily transport hotel-port-hotel
- Meal allowances per service company policy

Day rate (excluding spare parts) for major OEM service engineers typically USD 800-1,500 per day plus travel costs.

### Tool and Equipment Arrival

Service engineers often travel with specialized tools (torque wrenches, alignment equipment, electronic test equipment). These can trigger customs scrutiny:

- ATA Carnet recommended for temporary tool importation
- Tool list provided to customs in advance
- Tools clearly marked "for return after vessel service"

---

## Port-by-Port Service Capability

Different ports offer different service capability levels. Understanding capability tier is critical for service planning.

### Tier 1 — Full Service Capability

**Singapore:** Comprehensive service capability across all categories. Major OEMs maintain Singapore offices. Spare parts logistics excellent through Changi cargo. Service quality high, cost moderate. Time-to-service typically 24-48 hours.

**Rotterdam:** Premium European service hub. All major OEMs present. Excellent spare parts logistics. Higher cost than Asian hubs but superior efficiency. Time-to-service typically 12-36 hours.

**Hamburg:** Strong service capability, particularly for European-flag vessels. Boiler, engine, electrical specialists well-represented. Premium pricing.

**Houston:** Strong US service hub. Higher cost. Spare parts often available locally. Excellent for vessels in US trade.

### Tier 2 — Strong Service Capability

**Fujairah:** Major bunker hub with growing service capability. OPL anchorage allows multiple services in single port call. Cost-effective. Some services require flying engineers from Dubai or Sharjah.

**Hong Kong:** Strong service capability though declining. Good for Asian-flag vessels. Higher cost than Singapore.

**Antwerp:** Capable European port with strong service infrastructure. Often used as alternative to Rotterdam for cost reasons.

**Istanbul / Tuzla:** Wärtsilä-authorised service partner in Tuzla. Cost-effective compared to Western European ports. Strong for engine, electrical, and welding services. Good for vessels in Black Sea or Eastern Mediterranean trade.

**Busan:** Strong service capability for Korean-built vessels. KR class society headquarters. Good for major repair work.

### Tier 3 — Specialised Service Capability

**Suez:** Service capability primarily for vessels transiting the canal. Limited major service capability — typically only emergency repairs and routine services.

**Mediterranean smaller ports:** Algeciras, Piraeus, Genoa — strong for specific services but full capability requires planning.

**Indian sub-continent:** Mumbai (JNPT), Chennai — growing service capability, cost-effective, increasingly used for major services.

### When to Avoid Port Service

Some services are better deferred to drydock or major ports:

- Major engine overhauls requiring crankshaft work
- Hull modifications
- Major piping renewals
- Major electrical switchboard overhauls

These should be scheduled with drydocking at specialized shipyards, not at general ports.

---

## Cost Framework

Technical service costs at port involve multiple components beyond the service company invoice.

### Service Cost Components

**Service company charges:**

- Day rate for service engineer(s): USD 800-1,500 per day per engineer
- Travel costs (flight, hotel, meals): USD 1,500-5,000 per engineer trip
- Specialized tool rental: variable

**Spare parts:**

- Major spare parts: USD 5,000-100,000+ depending on scope
- Air freight: USD 4-15 per kg
- Customs clearance fees: USD 200-1,500 per shipment

**Port and agent charges:**

- Customs clearance support: USD 200-800
- Hot work permit: USD 100-500
- Port authority permits: USD 100-1,000
- Additional agency time: USD 100-300

**Indirect costs:**

- Extended port stay (off-hire): vessel daily charter rate
- Pilotage and tugs if extended stay requires re-mooring: USD 2,000-8,000
- Berth charges for extended stay: variable per port

### Typical Service Visit Total Costs

- **ECDIS update + GMDSS survey:** USD 1,500-3,500 total
- **Liferaft annual service (per raft):** USD 800-1,500
- **Annual class survey attendance:** USD 2,000-5,000
- **Routine main engine service (1-2 days):** USD 8,000-25,000 plus parts
- **Major main engine top overhaul (3-5 days):** USD 25,000-150,000 plus parts
- **Boiler annual service:** USD 5,000-15,000
- **BWTS annual service:** USD 3,000-8,000

---

## Common Pitfalls and Solutions

### Pitfall 1: Spare Parts Customs Delay

Spare parts cleared by customs only after vessel departure. Service completed without parts. Vessel sails with deficiency.

**Solution:** Air freight critical parts to arrive 7 days before vessel. Have agent confirm customs clearance complete before vessel arrival. Maintain critical spare parts onboard inventory to bridge any delays.

### Pitfall 2: Service Engineer Visa Refusal

Engineer visa denied or delayed. Service cannot be performed in planned port window.

**Solution:** Apply for visas 6-8 weeks in advance. Have backup port options if primary port visa is problematic. Build relationships with service companies that maintain local service personnel.

### Pitfall 3: Hot Work Permit Denial

Hot work permit denied due to fire safety concerns, anchorage restrictions, or weather.

**Solution:** Apply for hot work permits during pre-arrival planning. Have fire watch crew briefed. Maintain backup port options for unavoidable hot work needs.

### Pitfall 4: Class Survey Scheduling Conflict

Class surveyor unavailable during vessel port stay window. Survey deadline missed.

**Solution:** Book class survey 6-8 weeks in advance. Track class deadline windows in vessel's planned maintenance system. Maintain dialogue with class society on planned schedule.

### Pitfall 5: Service Engineer Arrival Delays

Flight delays, missed connections, immigration issues delay service engineer arrival. Service window missed.

**Solution:** Build 24-48 hour buffer between engineer arrival and service start. Use airlines with reliable transit times. Have port agent confirm engineer arrival before vessel ETA.

### Pitfall 6: Vessel Preparation Inadequacy

Vessel not properly prepared for service work — system not isolated, equipment not cooled, scaffolding not in place. Service engineer waits, charged at full day rate.

**Solution:** Issue preparation checklist 7 days before service. Chief Engineer confirms preparation complete 24 hours before service. Service engineer briefed on vessel-specific arrangements before boarding.

### Pitfall 7: Multiple Service Conflicts

Two or three different service companies need same engine space, same crew attention, or same time slot. Conflicts cause cascading delays.

**Solution:** Centralise service coordination through single point of contact (vessel chief engineer or technical superintendent). Build detailed time-sequenced plan. Stagger services to avoid resource conflicts.

---

## The Role of Port Agency in Technical Service Coordination

A capable port agency is critical for successful technical service visits. The agent provides services that no other party can effectively coordinate:

- Spare parts customs clearance with port authorities
- Hot work permit applications
- Service engineer airport reception and transport
- Hotel accommodation arrangements
- Local authority permits
- Communication with vessel during service
- Crisis management when issues arise
- Local knowledge of service company capabilities

Vessel operators choosing port agents for technical service ports should evaluate agents specifically for their technical service experience — not all agents are equal in this domain. Agents specializing in technical service coordination understand the unique requirements: customs documentation precision, service company relationships, hot work permit familiarity, and the operational rhythm of complex service visits.

---

## Frequently Asked Questions

**Q: How far in advance should technical service visits be planned?**

A: Routine services (ECDIS, GMDSS, annual surveys): 3 weeks minimum. Services requiring spare parts shipment: 6-8 weeks. Major interventions (engine overhauls): 8-12 weeks. Class special surveys often plan 3-6 months ahead due to surveyor scheduling and pre-survey requirements.

**Q: What's the difference between manufacturer-authorised and third-party service?**

A: Manufacturer-authorised service is performed by service partners certified by the equipment manufacturer (MAN, Wärtsilä, etc.). Required for warranty compliance, often required by class society for certain interventions. Third-party service is performed by independent service companies — typically lower cost, sometimes equivalent technical capability, but may affect warranty status and class acceptance for major work.

**Q: How are spare parts customs duties handled?**

A: Most jurisdictions provide duty exemption for "ship's spares" — spare parts imported specifically for vessel use and not for resale. Documentation must clearly show parts are vessel-bound. The vessel must be in port or arriving imminently. Master's request letter often required. The port agent handles documentation submission and clearance.

**Q: Can technical services be performed at anchorage?**

A: Many services can be performed at anchorage: ECDIS updates, GMDSS surveys, LSA inspections, hull cleaning by divers, class surveys, document audits. Services requiring extensive shore-supplied utilities (high-current welding, large compressed air, water supply) typically require alongside berthing. Hot work at anchorage is heavily regulated and often restricted to emergencies only.

**Q: What happens if a class survey is missed?**

A: Class certificates have hard expiry windows (typically 3 months past due for annual surveys). Missing the window can result in: class certificate suspension, immediate Port State Control detention upon discovery, flag state administrative action, insurance complications. Recovery requires emergency survey arrangements, often at significant cost premium. Avoiding missed surveys through planned maintenance scheduling is essential.

**Q: How do liferaft services work given they need to be sent ashore?**

A: Liferafts are sent to certified service stations (RINA, Lloyd's Register, or manufacturer-approved facilities) ashore. Service takes 7-14 days typically. Vessels carry sufficient spare liferaft capacity or stagger servicing so the vessel always meets minimum LSA requirements. Some operators use a "rolling stock" approach where service-due liferafts are exchanged at major ports for already-serviced replacement units.

**Q: What is a hot work permit and when is it required?**

A: Hot work permits are required for any work involving open flame, welding, grinding, or high-temperature operations onboard. Issued by port authority or terminal operator, they verify fire safety precautions are in place. Required for: welding repairs, oxy-acetylene cutting, electrical work in flammable atmospheres, certain grinding operations. Application typically requires 24-48 hours notice. Tanker vessels and bulk carriers in grain cargo have additional restrictions.

**Q: How do operators manage service costs across the fleet?**

A: Established operators typically maintain frame agreements with major service providers (MAN, Wärtsilä, Lloyd's Register, etc.) providing standardized day rates and response times across multiple ports. Spare parts inventory managed centrally with strategic stocking at major hubs. Service scheduling consolidated to reduce mobilization costs. Smaller operators rely more on case-by-case service company selection through ship agents.

---

## Conclusion

Technical service visits are operationally complex but procedurally manageable when approached with proper planning discipline. The six-to-three-week planning horizon, spare parts logistics rigor, service engineer coordination, and port agent involvement are the controllable factors that distinguish smooth service visits from operational crises.

For vessel operators, the cost of inadequate service coordination is rarely limited to the direct service invoice. Extended port stays, missed regulatory deadlines, and cascading operational disruptions can multiply costs by ten or twenty times the original service value. The discipline of treating each technical service visit as a coordinated operation — with spare parts logistics, engineer coordination, vessel preparation, and contingency planning — pays for itself many times over.

For marine service providers seeking to grow their business — engine specialists, ECDIS service partners, class society surveyors, liferaft service stations, BWTS service companies — visibility to vessel operators at the moment they need service is critical. Traditional discovery channels (manning agency relationships, broker networks, word-of-mouth referrals) work but are slow and geographically limited.

PortServiceFinder is the global directory connecting vessel operators with verified marine service providers at every major port worldwide. Vessel operators can search by port and service category — main engine specialists at Singapore, ECDIS service at Rotterdam, class surveyors at Houston, liferaft service stations at Fujairah — and access verified contact details, service scope, and credentials directly. Free for vessel operators, subscription-based for providers, no commission on any transaction. The platform was designed by maritime professionals to solve exactly this discovery problem: connecting the operator who needs service today with the provider who can deliver it.
`,
};
