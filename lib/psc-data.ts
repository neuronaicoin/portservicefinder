// ============================================================
// PSC DATA — Port State Control
// Sources:
//   - IMO MEPC/MSC public deficiency code lists
//   - Paris MoU, Tokyo MoU, USCG public deficiency taxonomies
//   - GISIS Module 4 (Port State Control)
// All codes are public-domain regulatory references.
// ============================================================

// ============================================================
// MOU REGIONAL ORGANIZATIONS
// ============================================================
export interface MoUInfo {
  key: string;
  name: string;
  region: string;
  region2: string;
  homepage: string;
  inspectionSearch: string;
  detentionList: string;
  flagPerformance?: string;
  description: string;
}

export const MOUS: MoUInfo[] = [
  {
    key: 'PARIS',
    name: 'Paris MoU',
    region: 'Europe & North Atlantic',
    region2: '🇪🇺',
    homepage: 'https://www.parismou.org',
    inspectionSearch: 'https://www.parismou.org/inspection-search',
    detentionList: 'https://www.parismou.org/detentions-banning/current-detentions',
    flagPerformance: 'https://www.parismou.org/detentions-banning/white-grey-and-black-list',
    description: '27 maritime administrations in Europe and the North Atlantic basin. Most active PSC regime globally.',
  },
  {
    key: 'TOKYO',
    name: 'Tokyo MoU',
    region: 'Asia-Pacific',
    region2: '🌏',
    homepage: 'https://www.tokyo-mou.org',
    inspectionSearch: 'https://www.tokyo-mou.org/inspections_detentions/psc_database.php',
    detentionList: 'https://www.tokyo-mou.org/inspections_detentions/detention_list.php',
    flagPerformance: 'https://www.tokyo-mou.org/organization/black_grey_white_list.php',
    description: '21 member authorities including Japan, China, Korea, Singapore, Australia. Real-time APCIS database.',
  },
  {
    key: 'USCG',
    name: 'USCG',
    region: 'United States',
    region2: '🇺🇸',
    homepage: 'https://www.dco.uscg.mil/Our-Organization/NMC/Port-State-Control',
    inspectionSearch: 'https://cgmix.uscg.mil/PSIX',
    detentionList: 'https://www.dco.uscg.mil/Our-Organization/NMC/Port-State-Control/Annual-Reports',
    description: 'United States Coast Guard PSC program. PSIX (Port State Information eXchange) database publicly searchable.',
  },
  {
    key: 'AMSA',
    name: 'AMSA',
    region: 'Australia',
    region2: '🇦🇺',
    homepage: 'https://www.amsa.gov.au/vessels-operators/port-state-control',
    inspectionSearch: 'https://www.amsa.gov.au/vessels-operators/port-state-control/psc-inspection-data',
    detentionList: 'https://www.amsa.gov.au/vessels-operators/port-state-control/detentions',
    description: 'Australian Maritime Safety Authority. Standalone PSC regime (also Tokyo MoU member).',
  },
  {
    key: 'BSMOU',
    name: 'Black Sea MoU',
    region: 'Black Sea Region',
    region2: '🌊',
    homepage: 'http://www.bsmou.org',
    inspectionSearch: 'http://www.bsmou.org/bsis/',
    detentionList: 'http://www.bsmou.org/detentions/',
    description: '6 Black Sea states: Bulgaria, Georgia, Romania, Russia, Turkey, Ukraine.',
  },
  {
    key: 'MEDMOU',
    name: 'Mediterranean MoU',
    region: 'Mediterranean',
    region2: '🌊',
    homepage: 'http://www.medmou.org',
    inspectionSearch: 'http://www.medmou.org/MED-Inspections.aspx',
    detentionList: 'http://www.medmou.org/Detentions.aspx',
    description: '10 Mediterranean authorities including Algeria, Cyprus, Egypt, Israel, Jordan, Lebanon, Malta, Morocco, Tunisia, Turkey.',
  },
  {
    key: 'CARIBMOU',
    name: 'Caribbean MoU',
    region: 'Caribbean',
    region2: '🏝️',
    homepage: 'https://www.caribbeanmou.org',
    inspectionSearch: 'https://www.caribbeanmou.org/inspections',
    detentionList: 'https://www.caribbeanmou.org/detentions',
    description: '18 Caribbean states. Active in cruise ship and yacht PSC inspections.',
  },
  {
    key: 'IOMOU',
    name: 'Indian Ocean MoU',
    region: 'Indian Ocean',
    region2: '🌊',
    homepage: 'https://www.iomou.org',
    inspectionSearch: 'https://www.iomou.org/inspections',
    detentionList: 'https://www.iomou.org/detentions',
    description: '20 member states around the Indian Ocean. India, South Africa, Iran, UAE among members.',
  },
  {
    key: 'ABUJAMOU',
    name: 'Abuja MoU',
    region: 'West & Central Africa',
    region2: '🌍',
    homepage: 'https://www.abujamou.org',
    inspectionSearch: 'https://www.abujamou.org/inspections',
    detentionList: 'https://www.abujamou.org/detentions',
    description: '20 West and Central African states. Nigeria, Ghana, Côte d\'Ivoire, etc.',
  },
  {
    key: 'RIYADHMOU',
    name: 'Riyadh MoU',
    region: 'GCC States',
    region2: '🕌',
    homepage: 'https://www.riyadhmou.org',
    inspectionSearch: 'https://www.riyadhmou.org/inspections',
    detentionList: 'https://www.riyadhmou.org/detentions',
    description: '6 Gulf Cooperation Council states: Saudi Arabia, UAE, Oman, Bahrain, Kuwait, Qatar.',
  },
  {
    key: 'VINADMAR',
    name: 'Viña del Mar Agreement',
    region: 'Latin America',
    region2: '🌎',
    homepage: 'https://acuerdolatino.int.ar',
    inspectionSearch: 'https://acuerdolatino.int.ar/cialia/',
    detentionList: 'https://acuerdolatino.int.ar',
    description: '15 Latin American countries: Argentina, Brazil, Chile, Colombia, Mexico, Peru, etc.',
  },
];

// Common platforms (not regional MoUs)
export const PLATFORMS = [
  {
    key: 'EQUASIS',
    name: 'Equasis',
    region: 'Global Aggregator',
    region2: '🌍',
    homepage: 'https://www.equasis.org',
    description: '85,000+ vessels. Aggregates data from 5+ PSC regimes, classification societies, P&I clubs. Free registration required.',
  },
  {
    key: 'GISIS',
    name: 'IMO GISIS',
    region: 'IMO Official',
    region2: '🏛️',
    homepage: 'https://gisis.imo.org',
    description: 'IMO Global Integrated Shipping Information System. Module 4 = PSC. Free registration required.',
  },
];

// ============================================================
// PSC DEFICIENCY CODES (most common categories)
// Based on IMO/Paris MoU/Tokyo MoU standardized taxonomy
// Format: 01xxx-18xxx (chapter.subchapter.item)
// ============================================================
export interface DeficiencyCode {
  code: string;
  category: string;
  subcategory: string;
  description: string;
  convention: string;
  typicalAction: string;
  rectification: string;
  detentionRisk: 'low' | 'medium' | 'high' | 'very_high';
}

export const DEFICIENCY_CATEGORIES = [
  { code: '01', name: 'Certificates & Documentation' },
  { code: '02', name: 'Structural Conditions' },
  { code: '03', name: 'Water/Weathertight Conditions' },
  { code: '04', name: 'Emergency Systems' },
  { code: '05', name: 'Radio Communications' },
  { code: '06', name: 'Cargo Operations Including Equipment' },
  { code: '07', name: 'Fire Safety' },
  { code: '08', name: 'Alarms' },
  { code: '09', name: 'Working & Living Conditions' },
  { code: '10', name: 'Safety of Navigation' },
  { code: '11', name: 'Life-saving Appliances' },
  { code: '12', name: 'Dangerous Goods' },
  { code: '13', name: 'Propulsion & Auxiliary Machinery' },
  { code: '14', name: 'Pollution Prevention (MARPOL Annex I — Oil)' },
  { code: '15', name: 'ISM Code' },
  { code: '16', name: 'Pollution Prevention (MARPOL Annex II — NLS)' },
  { code: '17', name: 'Pollution Prevention (MARPOL Annex III, IV, V)' },
  { code: '18', name: 'MARPOL Annex VI — Air Pollution & EEDI/CII/SEEMP' },
  { code: '19', name: 'MLC (Maritime Labour Convention)' },
];

export const DEFICIENCIES: DeficiencyCode[] = [
  // 01 — Certificates
  { code: '01101', category: '01', subcategory: 'Cert validity', description: 'Cargo Ship Safety Construction Certificate expired', convention: 'SOLAS I/12', typicalAction: '30 — Rectify before departure / Detention if expired >3 months', rectification: 'Renew via recognized organization. Confirm class survey status.', detentionRisk: 'very_high' },
  { code: '01108', category: '01', subcategory: 'Cert validity', description: 'Cargo Ship Safety Equipment Certificate expired', convention: 'SOLAS I/12', typicalAction: '30 — Rectify before departure', rectification: 'Renew certificate. Confirm equipment survey.', detentionRisk: 'very_high' },
  { code: '01114', category: '01', subcategory: 'Cert validity', description: 'Cargo Ship Safety Radio Certificate expired', convention: 'SOLAS I/12', typicalAction: '30 — Rectify before departure', rectification: 'Renew certificate. Confirm radio survey.', detentionRisk: 'very_high' },
  { code: '01117', category: '01', subcategory: 'Cert validity', description: 'International Load Line Certificate expired', convention: 'LL 66', typicalAction: '30 — Rectify before departure', rectification: 'Renew via class society survey.', detentionRisk: 'very_high' },
  { code: '01133', category: '01', subcategory: 'Cert validity', description: 'IOPP (International Oil Pollution Prevention) Certificate expired', convention: 'MARPOL I/7', typicalAction: '30 — Rectify before departure', rectification: 'Renew via flag/class.', detentionRisk: 'very_high' },
  { code: '01218', category: '01', subcategory: 'SMC', description: 'Safety Management Certificate (SMC) missing or expired', convention: 'ISM Code 13', typicalAction: '30 — Rectify before departure / Detention', rectification: 'Contact DPA. Audit by RO required.', detentionRisk: 'very_high' },
  { code: '01219', category: '01', subcategory: 'DOC', description: 'Document of Compliance (DOC) missing/invalid', convention: 'ISM Code 13', typicalAction: '30 — Rectify before departure', rectification: 'Company DOC review with RO.', detentionRisk: 'very_high' },
  { code: '01220', category: '01', subcategory: 'ISSC', description: 'International Ship Security Certificate (ISSC) missing or invalid', convention: 'ISPS Part A 19', typicalAction: '30 — Rectify before departure', rectification: 'Audit & re-issue via RO.', detentionRisk: 'very_high' },
  { code: '01313', category: '01', subcategory: 'CSR', description: 'Continuous Synopsis Record not on board or not updated', convention: 'SOLAS XI-1/5', typicalAction: '17 — Rectify within 14 days', rectification: 'Request updated CSR from flag.', detentionRisk: 'low' },

  // 02 — Structural
  { code: '02105', category: '02', subcategory: 'Hull', description: 'Hull damage impairing seaworthiness', convention: 'SOLAS II-1', typicalAction: '30 — Rectify before departure / Detention', rectification: 'Class society survey, temporary or permanent repair.', detentionRisk: 'very_high' },
  { code: '02106', category: '02', subcategory: 'Hull', description: 'Excessive corrosion in cargo holds', convention: 'SOLAS II-1', typicalAction: '17 — Within 14 days / 30 — Before departure depending on severity', rectification: 'Steel renewal as per class.', detentionRisk: 'high' },
  { code: '02110', category: '02', subcategory: 'Steel', description: 'Deck plating wastage beyond allowable', convention: 'SOLAS II-1', typicalAction: '30 — Rectify before departure', rectification: 'Steel renewal under class supervision.', detentionRisk: 'high' },

  // 03 — Water/Weathertight
  { code: '03102', category: '03', subcategory: 'Hatches', description: 'Hatch covers not weathertight', convention: 'LL 66 Reg.16', typicalAction: '30 — Rectify before departure', rectification: 'Rubber seal renewal, ultrasonic test.', detentionRisk: 'high' },
  { code: '03103', category: '03', subcategory: 'Hatches', description: 'Hatch coaming corroded / damaged', convention: 'LL 66', typicalAction: '17 — Within 14 days', rectification: 'Steel renewal, paint preservation.', detentionRisk: 'medium' },
  { code: '03108', category: '03', subcategory: 'Doors', description: 'Watertight doors not operating properly', convention: 'SOLAS II-1/16', typicalAction: '30 — Before departure', rectification: 'Repair/replace seals & operating gear.', detentionRisk: 'high' },
  { code: '03115', category: '03', subcategory: 'Vents', description: 'Air pipes / ventilators damaged or missing closing devices', convention: 'LL 66 Reg.19,20', typicalAction: '30 — Before departure', rectification: 'Replace closing flaps, check non-return valves.', detentionRisk: 'high' },

  // 04 — Emergency
  { code: '04101', category: '04', subcategory: 'Emergency power', description: 'Emergency generator not operational', convention: 'SOLAS II-1/43', typicalAction: '30 — Rectify before departure / Detention', rectification: 'Service generator. Test 30 min black-out condition.', detentionRisk: 'very_high' },
  { code: '04102', category: '04', subcategory: 'Emergency switch', description: 'Emergency switchboard defective', convention: 'SOLAS II-1/43', typicalAction: '30 — Before departure', rectification: 'Electrical survey & repair.', detentionRisk: 'high' },
  { code: '04106', category: '04', subcategory: 'EGN', description: 'Emergency lighting defective', convention: 'SOLAS II-1/42', typicalAction: '17 — Within 14 days', rectification: 'Replace fixtures/batteries.', detentionRisk: 'medium' },
  { code: '04108', category: '04', subcategory: 'Steering', description: 'Emergency steering not operational', convention: 'SOLAS II-1/29', typicalAction: '30 — Before departure / Detention', rectification: 'Hydraulic system check & test.', detentionRisk: 'very_high' },

  // 05 — Radio
  { code: '05101', category: '05', subcategory: 'GMDSS', description: 'GMDSS radio equipment defective', convention: 'SOLAS IV/15', typicalAction: '17 — Within 14 days, 30 — Before departure if critical', rectification: 'Radio survey & repair.', detentionRisk: 'high' },
  { code: '05104', category: '05', subcategory: 'EPIRB', description: 'EPIRB defective, expired battery, or hydrostatic release expired', convention: 'SOLAS IV/7', typicalAction: '17 — Within 14 days', rectification: 'Service EPIRB; renew HRU & battery.', detentionRisk: 'medium' },
  { code: '05108', category: '05', subcategory: 'SART', description: 'SART defective or insufficient', convention: 'SOLAS III/6', typicalAction: '17 — Within 14 days', rectification: 'Replace/service SART.', detentionRisk: 'medium' },
  { code: '05113', category: '05', subcategory: 'Radio log', description: 'Radio log not maintained properly', convention: 'SOLAS IV/17', typicalAction: '17 — Within 14 days', rectification: 'Train operator, maintain log per format.', detentionRisk: 'low' },

  // 06 — Cargo Operations
  { code: '06104', category: '06', subcategory: 'Crane', description: 'Cargo crane defective / overdue test certificate', convention: 'SOLAS II-1, MLC 4.3', typicalAction: '17 — Within 14 days', rectification: 'Load test & certification.', detentionRisk: 'medium' },
  { code: '06108', category: '06', subcategory: 'Securing', description: 'Cargo securing manual not on board', convention: 'SOLAS VI/5.6', typicalAction: '17 — Within 14 days', rectification: 'Obtain approved manual from flag/RO.', detentionRisk: 'medium' },
  { code: '06112', category: '06', subcategory: 'Bulk', description: 'Bulk cargo BLU code not complied with', convention: 'SOLAS VI/7', typicalAction: '30 — Before departure', rectification: 'Train officers; implement procedures.', detentionRisk: 'high' },
  { code: '06114', category: '06', subcategory: 'IMSBC', description: 'IMSBC Code violation', convention: 'SOLAS VI', typicalAction: '30 — Before departure', rectification: 'Train officers on bulk cargo handling.', detentionRisk: 'high' },

  // 07 — Fire Safety
  { code: '07101', category: '07', subcategory: 'Fire pumps', description: 'Main fire pump defective', convention: 'SOLAS II-2/10', typicalAction: '30 — Before departure', rectification: 'Pump overhaul & test.', detentionRisk: 'very_high' },
  { code: '07103', category: '07', subcategory: 'Fixed FF', description: 'Fixed fire-fighting system (CO2 / foam) defective', convention: 'SOLAS II-2/10', typicalAction: '30 — Before departure', rectification: 'Service company test & recharge.', detentionRisk: 'very_high' },
  { code: '07105', category: '07', subcategory: 'Fire dampers', description: 'Fire dampers / closing devices not functional', convention: 'SOLAS II-2/9', typicalAction: '17 — Within 14 days', rectification: 'Repair/replace mechanisms.', detentionRisk: 'medium' },
  { code: '07110', category: '07', subcategory: 'Fire extinguishers', description: 'Portable fire extinguishers expired/missing', convention: 'SOLAS II-2/10', typicalAction: '17 — Within 14 days', rectification: 'Service/replace extinguishers per IMO MSC.1/Circ.1432.', detentionRisk: 'medium' },
  { code: '07112', category: '07', subcategory: 'Fire doors', description: 'Fire doors not closing properly / missing seals', convention: 'SOLAS II-2/9', typicalAction: '17 — Within 14 days', rectification: 'Replace seals, adjust closers.', detentionRisk: 'medium' },
  { code: '07120', category: '07', subcategory: 'Detection', description: 'Fire detection system defective', convention: 'SOLAS II-2/7', typicalAction: '30 — Before departure', rectification: 'System test & repair via service company.', detentionRisk: 'high' },
  { code: '07125', category: '07', subcategory: 'BA', description: 'Breathing apparatus defective / overdue test', convention: 'SOLAS II-2/10', typicalAction: '17 — Within 14 days', rectification: 'Service BA sets.', detentionRisk: 'medium' },
  { code: '07127', category: '07', subcategory: 'EEBD', description: 'EEBD missing or defective', convention: 'SOLAS II-2/13', typicalAction: '17 — Within 14 days', rectification: 'Replace EEBD; train crew.', detentionRisk: 'medium' },

  // 08 — Alarms
  { code: '08101', category: '08', subcategory: 'General', description: 'General alarm defective', convention: 'SOLAS III/6', typicalAction: '30 — Before departure', rectification: 'Test & repair alarm circuit.', detentionRisk: 'high' },
  { code: '08108', category: '08', subcategory: 'Bridge', description: 'Bridge navigation watch alarm defective', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Service BNWAS unit.', detentionRisk: 'medium' },

  // 09 — Working & Living (MLC overlap)
  { code: '09105', category: '09', subcategory: 'Sanitary', description: 'Inadequate sanitary facilities', convention: 'MLC 3.1', typicalAction: '17 — Within 14 days', rectification: 'Repair/clean toilets, showers.', detentionRisk: 'medium' },
  { code: '09108', category: '09', subcategory: 'Mess', description: 'Mess room inadequate', convention: 'MLC 3.1', typicalAction: '17 — Within 14 days', rectification: 'Comply with MLC standards.', detentionRisk: 'low' },
  { code: '09110', category: '09', subcategory: 'Galley', description: 'Galley unhygienic / equipment defective', convention: 'MLC 3.2', typicalAction: '17 — Within 14 days', rectification: 'Clean & repair; train cook.', detentionRisk: 'medium' },

  // 10 — Safety of Navigation
  { code: '10101', category: '10', subcategory: 'Charts', description: 'Nautical charts not corrected up to date', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Update charts using NTM. Consider ECDIS.', detentionRisk: 'medium' },
  { code: '10103', category: '10', subcategory: 'Charts', description: 'ECDIS not approved type or not functional', convention: 'SOLAS V/19', typicalAction: '30 — Before departure', rectification: 'Type-approved ECDIS with backup.', detentionRisk: 'high' },
  { code: '10105', category: '10', subcategory: 'Compass', description: 'Magnetic compass defective / not adjusted', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Adjust by certified compass adjuster.', detentionRisk: 'medium' },
  { code: '10108', category: '10', subcategory: 'Radar', description: 'Radar defective', convention: 'SOLAS V/19', typicalAction: '30 — Before departure', rectification: 'Radar service & repair.', detentionRisk: 'high' },
  { code: '10110', category: '10', subcategory: 'GPS', description: 'GPS / GNSS receiver defective', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Service GNSS; backup receiver.', detentionRisk: 'medium' },
  { code: '10115', category: '10', subcategory: 'AIS', description: 'AIS not transmitting correct data', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Update AIS static data; service unit.', detentionRisk: 'medium' },
  { code: '10116', category: '10', subcategory: 'VDR', description: 'VDR defective / annual performance test overdue', convention: 'SOLAS V/20', typicalAction: '17 — Within 14 days', rectification: 'Performance test by service company.', detentionRisk: 'medium' },
  { code: '10118', category: '10', subcategory: 'Bridge', description: 'BNWAS defective / not in use', convention: 'SOLAS V/19', typicalAction: '17 — Within 14 days', rectification: 'Service BNWAS unit.', detentionRisk: 'medium' },

  // 11 — Life-saving
  { code: '11101', category: '11', subcategory: 'Lifeboats', description: 'Lifeboat defective / launching gear inoperable', convention: 'SOLAS III/20', typicalAction: '30 — Before departure', rectification: 'Service per IMO Res. A.1156(32). Annual & 5-yearly test.', detentionRisk: 'very_high' },
  { code: '11102', category: '11', subcategory: 'Lifeboats', description: 'Lifeboat engine inoperable', convention: 'SOLAS III/20', typicalAction: '17 — Within 14 days', rectification: 'Service & test engine.', detentionRisk: 'high' },
  { code: '11105', category: '11', subcategory: 'Davits', description: 'Lifeboat davits / launching appliances defective', convention: 'SOLAS III/20', typicalAction: '30 — Before departure', rectification: 'Service & load test.', detentionRisk: 'very_high' },
  { code: '11108', category: '11', subcategory: 'Liferaft', description: 'Liferaft hydrostatic release / lashing defective', convention: 'SOLAS III/13', typicalAction: '17 — Within 14 days', rectification: 'Replace HRU; check lashing.', detentionRisk: 'medium' },
  { code: '11110', category: '11', subcategory: 'Liferaft', description: 'Liferaft service overdue', convention: 'SOLAS III/20', typicalAction: '17 — Within 14 days', rectification: 'Service via approved station.', detentionRisk: 'medium' },
  { code: '11115', category: '11', subcategory: 'Lifejackets', description: 'Lifejackets defective / insufficient', convention: 'SOLAS III/22', typicalAction: '17 — Within 14 days', rectification: 'Replace lifejackets; verify quantity.', detentionRisk: 'medium' },
  { code: '11118', category: '11', subcategory: 'Pyrotechnics', description: 'Pyrotechnic distress signals expired', convention: 'SOLAS III/35', typicalAction: '17 — Within 14 days', rectification: 'Replace flares/rockets.', detentionRisk: 'medium' },
  { code: '11120', category: '11', subcategory: 'Drills', description: 'Lifeboat drill not conducted / not recorded', convention: 'SOLAS III/19', typicalAction: '17 — Within 14 days', rectification: 'Conduct & document drills (weekly LB launching test).', detentionRisk: 'medium' },

  // 12 — Dangerous Goods
  { code: '12101', category: '12', subcategory: 'IMDG', description: 'IMDG Code violation — cargo declaration incomplete', convention: 'SOLAS VII, IMDG', typicalAction: '30 — Before departure', rectification: 'Verify shipper declaration, segregation.', detentionRisk: 'very_high' },
  { code: '12108', category: '12', subcategory: 'Documents', description: 'IMDG / DG manifest missing', convention: 'SOLAS VII/4', typicalAction: '17 — Within 14 days', rectification: 'Obtain manifest from shipper/charterer.', detentionRisk: 'high' },

  // 13 — Propulsion
  { code: '13101', category: '13', subcategory: 'ME', description: 'Main engine defective / unable to maintain manoeuvring speed', convention: 'SOLAS II-1/26', typicalAction: '30 — Before departure / Detention', rectification: 'Engine survey & repair.', detentionRisk: 'very_high' },
  { code: '13108', category: '13', subcategory: 'AE', description: 'Auxiliary engine defective', convention: 'SOLAS II-1/41', typicalAction: '17 — Within 14 days, 30 — If critical', rectification: 'Repair generator engine.', detentionRisk: 'high' },
  { code: '13115', category: '13', subcategory: 'Steering', description: 'Steering gear defective', convention: 'SOLAS II-1/29', typicalAction: '30 — Before departure', rectification: 'Steering survey & repair.', detentionRisk: 'very_high' },
  { code: '13120', category: '13', subcategory: 'Black-out', description: 'Black-out recovery procedure failed', convention: 'SOLAS II-1/43', typicalAction: '30 — Before departure', rectification: 'Test emergency restart; train crew.', detentionRisk: 'high' },

  // 14 — MARPOL Annex I (Oil)
  { code: '14101', category: '14', subcategory: 'OWS', description: '15 ppm Bilge separator / Oily Water Separator inoperative', convention: 'MARPOL I/14', typicalAction: '30 — Before departure / Detention', rectification: 'Service OWS; verify 15 ppm alarm.', detentionRisk: 'very_high' },
  { code: '14102', category: '14', subcategory: 'OWS', description: 'OWS bypass detected', convention: 'MARPOL I/14', typicalAction: '30 — Before departure / Detention', rectification: 'Remove bypass; rectify; legal consequences possible.', detentionRisk: 'very_high' },
  { code: '14103', category: '14', subcategory: 'ORB', description: 'Oil Record Book (ORB) Part I / II not properly kept', convention: 'MARPOL I/17,36', typicalAction: '30 — Before departure / Detention', rectification: 'Rectify entries; train officers.', detentionRisk: 'very_high' },
  { code: '14108', category: '14', subcategory: 'SOPEP', description: 'SOPEP / SMPEP plan not approved or not on board', convention: 'MARPOL I/37', typicalAction: '17 — Within 14 days', rectification: 'Obtain approved plan from flag/RO.', detentionRisk: 'medium' },

  // 15 — ISM
  { code: '15101', category: '15', subcategory: 'ISM general', description: 'ISM implementation failure — major non-conformity', convention: 'ISM Code', typicalAction: '30 — Before departure / Detention', rectification: 'DPA involvement; corrective action plan; external audit.', detentionRisk: 'very_high' },
  { code: '15102', category: '15', subcategory: 'ISM procedures', description: 'ISM procedures not followed (multiple deficiencies)', convention: 'ISM Code 7,10', typicalAction: '30 — Before departure / Detention if systemic', rectification: 'Internal audit; root cause analysis; training.', detentionRisk: 'very_high' },
  { code: '15110', category: '15', subcategory: 'Documents', description: 'SMS manual not available / not implemented', convention: 'ISM Code 11', typicalAction: '17 — Within 14 days', rectification: 'Distribute manual; train crew.', detentionRisk: 'medium' },

  // 18 — MARPOL Annex VI
  { code: '18101', category: '18', subcategory: 'Sulphur', description: 'Sulphur content of fuel exceeds limit (0.5% global / 0.1% ECA)', convention: 'MARPOL VI/14', typicalAction: '30 — Before departure / Detention + Sanctions', rectification: 'Switch compliant fuel; BDN verification; FONAR if available.', detentionRisk: 'very_high' },
  { code: '18102', category: '18', subcategory: 'BDN', description: 'Bunker Delivery Note (BDN) / sample missing or non-compliant', convention: 'MARPOL VI/18', typicalAction: '17 — Within 14 days', rectification: 'Obtain BDN from supplier; retain sample.', detentionRisk: 'medium' },
  { code: '18105', category: '18', subcategory: 'EEDI', description: 'EEDI Technical File missing or non-compliant', convention: 'MARPOL VI/22', typicalAction: '17 — Within 14 days', rectification: 'Obtain from flag/RO; verify SEEMP.', detentionRisk: 'low' },
  { code: '18108', category: '18', subcategory: 'CII/SEEMP', description: 'SEEMP Part III (CII) missing / not implemented', convention: 'MARPOL VI/26', typicalAction: '17 — Within 14 days', rectification: 'Develop SEEMP Part III via RO; submit reporting plan.', detentionRisk: 'low' },
  { code: '18112', category: '18', subcategory: 'EGCS', description: 'Exhaust Gas Cleaning System (Scrubber) defective', convention: 'MARPOL VI/14', typicalAction: '30 — Before departure', rectification: 'Service EGCS; switch to compliant fuel; emission test.', detentionRisk: 'high' },

  // 19 — MLC
  { code: '19101', category: '19', subcategory: 'MLC certs', description: 'Maritime Labour Certificate / DMLC Part I or II missing/invalid', convention: 'MLC 2006 Title 5', typicalAction: '30 — Before departure', rectification: 'Renew via flag/RO; resolve underlying issues.', detentionRisk: 'high' },
  { code: '19105', category: '19', subcategory: 'SEA', description: 'Seafarer Employment Agreement (SEA) not on board / not signed', convention: 'MLC 2.1', typicalAction: '17 — Within 14 days', rectification: 'Issue SEA per MLC; bilateral sign.', detentionRisk: 'medium' },
  { code: '19108', category: '19', subcategory: 'Wages', description: 'Wages not paid in due time / no records', convention: 'MLC 2.2', typicalAction: '30 — Before departure / Detention if systematic', rectification: 'Immediate payment; maintain wage records.', detentionRisk: 'very_high' },
  { code: '19110', category: '19', subcategory: 'Rest hours', description: 'Hours of rest / work non-compliant or no records', convention: 'MLC 2.3, STCW', typicalAction: '17 — Within 14 days', rectification: 'Maintain rest hour records (STCW format); train officers.', detentionRisk: 'medium' },
  { code: '19115', category: '19', subcategory: 'Catering', description: 'Insufficient/poor quality provisions or drinking water', convention: 'MLC 3.2', typicalAction: '17 — Within 14 days', rectification: 'Resupply; arrange medical inspection.', detentionRisk: 'medium' },
  { code: '19120', category: '19', subcategory: 'Medical', description: 'Medical certificate of seafarer expired', convention: 'MLC 1.2, STCW I/9', typicalAction: '17 — Within 14 days', rectification: 'Arrange medical exam; replace if necessary.', detentionRisk: 'medium' },
];

// ============================================================
// ACTION CODES (PSC inspector actions per IMO standard)
// ============================================================
export const ACTION_CODES = [
  { code: '10', desc: 'Deficiency rectified' },
  { code: '15', desc: 'Rectify deficiency at next port' },
  { code: '16', desc: 'Rectify deficiency within 14 days' },
  { code: '17', desc: 'Rectify deficiency within 14 days' },
  { code: '18', desc: 'Rectify deficiency at agreed repair port' },
  { code: '21', desc: 'Master instructed to ensure deficiency rectified before departure' },
  { code: '30', desc: 'Ship detained' },
  { code: '40', desc: 'Refused access (banning order)' },
  { code: '46', desc: 'Rectify deficiency before commencing operation' },
  { code: '47', desc: 'Rectify within 3 months' },
  { code: '48', desc: 'As in code agreement' },
  { code: '49', desc: 'Letter of warning issued' },
  { code: '50', desc: 'Flag State / RO informed' },
  { code: '55', desc: 'Next port informed' },
  { code: '85', desc: 'Investigation of contravention of discharge provisions (MARPOL)' },
  { code: '99', desc: 'Other (specify)' },
];

// ============================================================
// CONCENTRATED INSPECTION CAMPAIGNS (CIC) — recent and planned
// ============================================================
export interface CIC {
  year: number;
  topic: string;
  period: string;
  mous: string[];
  focus: string;
  checklistItems: string[];
}

export const CICS: CIC[] = [
  {
    year: 2026,
    topic: 'Crew Wages, MLC Compliance & Working Conditions',
    period: 'Sep 1 – Nov 30, 2026',
    mous: ['PARIS', 'TOKYO'],
    focus: 'MLC 2006 Title 2 (employment), Title 3 (accommodation), Title 4 (health protection). Wage records, SEAs, rest hours.',
    checklistItems: [
      'SEA on board for every crew member, signed by both parties',
      'Hours of rest records (STCW format) up to date',
      'Wage account statements for at least last 3 months',
      'Crew nationality vs flag state requirements',
      'Crew complaints procedure visible & explained',
      'Maritime Labour Certificate & DMLC Part I/II valid',
      'Catering: provisions stock, drinking water tests, galley hygiene',
      'Accommodation: bedding, ventilation, sanitary facilities',
      'Medical care: medical chest, medicines in date, medical guide',
      'Seafarer medical certificates valid',
    ],
  },
  {
    year: 2025,
    topic: 'SOLAS Lifeboat Launching Arrangements',
    period: 'Sep 1 – Nov 30, 2025',
    mous: ['PARIS', 'TOKYO'],
    focus: 'Lifeboat launching appliances, on-load release gear, maintenance per IMO Res. A.1156(32).',
    checklistItems: [
      'On-load release gear MSC.1/Circ.1206/Rev.1 compliance',
      'Davit maintenance records (annual + 5-yearly)',
      'Wires/falls service & renewal',
      'Hydrostatic release units (HRU) service',
      'Drill records — weekly launching test',
      'Crew familiarization with launching',
      'Lifeboat engine starting trials',
      'Lifeboat fuel & maintenance log',
    ],
  },
  {
    year: 2024,
    topic: 'Fire Safety (Fire Detection System)',
    period: 'Sep 1 – Nov 30, 2024',
    mous: ['PARIS', 'TOKYO'],
    focus: 'Fire detection systems per SOLAS II-2/7. Smoke detection, machinery spaces, accommodation.',
    checklistItems: [
      'Fire detection system functional in all required spaces',
      'Detection alarm panels & bridge indication',
      'Service records of detection system',
      'Detector heads clean & sensitive',
      'Cable insulation tests',
      'Fire control plan posted & accurate',
      'Crew familiarity with fire detection alarms',
      'Maintenance per manufacturer recommendations',
    ],
  },
  {
    year: 2023,
    topic: 'Fire Safety (Fire Doors)',
    period: 'Sep 1 – Nov 30, 2023',
    mous: ['PARIS', 'TOKYO'],
    focus: 'A-class fire doors per SOLAS II-2/9. Self-closing mechanisms, sealing, hold-open arrangements.',
    checklistItems: [
      'A-class fire doors close fully against rebates',
      'Self-closing mechanism operational',
      'Hold-open devices release on alarm',
      'Fire-rated rubber seals intact',
      'No unauthorized modifications (wedges, ropes)',
      'Maintenance log',
    ],
  },
];

// ============================================================
// SEARCH FUNCTION
// ============================================================
export function searchDeficiencies(q: string): DeficiencyCode[] {
  if (!q || q.length < 1) return DEFICIENCIES.slice(0, 30);
  const query = q.toLowerCase().trim();
  return DEFICIENCIES.filter(
    (d) =>
      d.code.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.convention.toLowerCase().includes(query) ||
      d.subcategory.toLowerCase().includes(query)
  ).slice(0, 40);
}
