// ============================================================
// Seafarer Visa / Documentation reference for major maritime
// hub countries. GENERAL guidance only — rules change often and
// depend on nationality, vessel flag, and purpose. ALWAYS confirm
// with the local agent and the relevant embassy/consulate before
// any crew change, shore leave or transit.
// ============================================================

export interface VisaCountry {
  code: string;
  name: string;
  flag: string;
  // requirement levels per purpose
  shoreLeave: Requirement;
  signOnOff: Requirement;   // crew change (join/leave at this port)
  transit: Requirement;     // transit through airport to join/leave
  docs: string[];           // typical documents needed
  notes: string;
}

export type Requirement = 'none' | 'usually-none' | 'may-require' | 'required';

export const REQ_META: Record<Requirement, { label: string; color: string }> = {
  'none': { label: 'Not required', color: '#4caf76' },
  'usually-none': { label: 'Usually not required', color: '#8bc34a' },
  'may-require': { label: 'May be required', color: '#e8b85a' },
  'required': { label: 'Required', color: '#ff8a8a' },
};

export const VISA_COUNTRIES: VisaCountry[] = [
  {
    code: 'US', name: 'United States', flag: '🇺🇸',
    shoreLeave: 'required', signOnOff: 'required', transit: 'required',
    docs: ['C1/D visa (transit + crew)', 'Valid passport', "Seaman's book", 'Letter of guarantee / appointment'],
    notes: 'The US is strict: a C1/D visa is needed for shore leave, sign-on/off and airport transit. CBP grants shore leave case-by-case (D-1 status). No visa-waiver for seafarers. Apply well in advance.',
  },
  {
    code: 'SCHENGEN', name: 'Schengen Area (EU)', flag: '🇪🇺',
    shoreLeave: 'may-require', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Schengen visa (type C) or Airport Transit Visa (type A) depending on nationality', "Seaman's book", 'Letter of guarantee'],
    notes: 'Depends heavily on nationality. Many nationalities need a Schengen visa to sign on/off; some need only an Airport Transit Visa (ATV). Visa-exempt nationals may transit/shore leave freely. Check the specific Schengen state.',
  },
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Transit visa (visa nationals)', "Seaman's book / Discharge book", 'Passport'],
    notes: 'Seafarers in transit may join/leave a ship; "visa nationals" need a Transit Visa. Shore leave usually permitted while the ship is in port. Confirm nationality status under UK rules.',
  },
  {
    code: 'AE', name: 'UAE', flag: '🇦🇪',
    shoreLeave: 'may-require', signOnOff: 'required', transit: 'may-require',
    docs: ['Sign-on/off requires agent-arranged permit', "Seaman's book", 'Passport', 'Crew list / NOC from agent'],
    notes: 'Crew change is handled through the local agent who arranges immigration permits. Shore leave generally allowed via shore pass. Transit via Dubai/Abu Dhabi may need an arranged visa — agent coordinates.',
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Disembarkation/Embarkation arranged by agent', 'Passport', "Seaman's book"],
    notes: 'Efficient crew-change hub. Shore leave generally allowed. Sign-on/off and airport transit are agent-coordinated; some nationalities need an entry visa for landside transit. Confirm with agent.',
  },
  {
    code: 'CN', name: 'China', flag: '🇨🇳',
    shoreLeave: 'may-require', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Chinese visa or Seaman landing permit', "Seaman's book", 'Crew list', 'Agent NOC'],
    notes: 'A seaman landing permit is typically issued at the port for shore leave. Crew change may need a Chinese visa arranged in advance; agent handles the landing permit and immigration. Rules vary by port.',
  },
  {
    code: 'KR', name: 'South Korea', flag: '🇰🇷',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Landing permit (agent-arranged)', 'Passport', "Seaman's book"],
    notes: 'Shore pass / landing permit usually arranged by agent. Crew change and transit may need a visa for some nationalities. Confirm with agent.',
  },
  {
    code: 'IN', name: 'India', flag: '🇮🇳',
    shoreLeave: 'may-require', signOnOff: 'required', transit: 'may-require',
    docs: ['Indian visa for sign-on/off (often e-visa not valid for seafarers)', "Seaman's book (CDC)", 'Passport', 'Agent letter'],
    notes: 'Sign-on/off generally requires a proper seafarer/transit visa arranged in advance; e-visa is usually not accepted for joining/leaving a vessel. Shore leave via shore pass. Plan early.',
  },
  {
    code: 'BR', name: 'Brazil', flag: '🇧🇷',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Visa depending on nationality', "Seaman's book", 'Passport', 'Agent support'],
    notes: 'Shore leave generally allowed. Sign-on/off may require a visa depending on nationality; agent coordinates immigration (Polícia Federal). Confirm nationality requirements.',
  },
  {
    code: 'PA', name: 'Panama', flag: '🇵🇦',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Crew visa / shore pass via agent', "Seaman's book", 'Passport'],
    notes: 'Transit and crew change common around the Canal. Shore leave usually allowed; sign-on/off and airport transit may need an arranged visa for some nationalities. Agent handles.',
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺',
    shoreLeave: 'may-require', signOnOff: 'required', transit: 'required',
    docs: ['Maritime Crew Visa (MCV)', 'Passport', "Seaman's book"],
    notes: 'A Maritime Crew Visa (MCV) is required for foreign crew arriving by sea. Sign-on/off and airport transit need an MCV / appropriate visa arranged in advance. Strict — apply early.',
  },
  {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Transit / crew visa per nationality', "Seaman's book", 'Passport'],
    notes: 'Shore leave generally permitted while in port. Sign-on/off and transit may require a visa for some nationalities — agent and immigration coordinate. Confirm in advance.',
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Agent-arranged permit', "Seaman's book", 'Passport', 'Crew list'],
    notes: 'Suez Canal transit and Port Said/Alexandria crew changes are agent-coordinated. Shore leave usually via shore pass; sign-on/off and transit handled by agent with immigration.',
  },
  {
    code: 'TR', name: 'Türkiye', flag: '🇹🇷',
    shoreLeave: 'usually-none', signOnOff: 'may-require', transit: 'may-require',
    docs: ['Visa per nationality (e-visa for some)', "Seaman's book", 'Passport', 'Agent support'],
    notes: 'Shore leave generally allowed in port. Sign-on/off and airport transit may need a visa depending on nationality (e-visa available for many). Agent coordinates with harbour master and immigration.',
  },
];
