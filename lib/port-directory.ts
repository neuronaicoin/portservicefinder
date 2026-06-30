// ============================================================
// Major maritime hub port database for the Voyage Hub.
// Reference data for orientation — always confirm operational
// details (draft, restrictions, VHF, working hours) with the
// local agent, port authority and current Notices to Mariners.
// ============================================================

export interface Port {
  id: string;
  name: string;
  country: string;
  region: Region;
  flag: string;
  locode: string;       // UN/LOCODE
  lat: number;
  lon: number;
  timezone: string;
  maxDraftM: number;    // typical max draft (m) — varies by berth
  maxLoaM: number;      // indicative
  terminals: string[];
  pilotage: 'compulsory' | 'recommended' | 'optional';
  vhf: string;          // port control / VTS channel(s)
  working: string;      // working hours pattern
  notes: string;
}

export type Region = 'Asia' | 'Middle East' | 'Europe' | 'Americas' | 'Africa' | 'Oceania';

export const REGIONS: Region[] = ['Asia', 'Middle East', 'Europe', 'Americas', 'Africa', 'Oceania'];

export const DIRECTORY_PORTS: Port[] = [
  // ---- Asia ----
  { id: 'sgsin', name: 'Singapore', country: 'Singapore', region: 'Asia', flag: '🇸🇬', locode: 'SGSIN', lat: 1.264, lon: 103.840, timezone: 'UTC+8', maxDraftM: 20, maxLoaM: 400, terminals: ['Container (PSA)', 'Bunkering', 'Anchorages', 'Tanker (Jurong)'], pilotage: 'compulsory', vhf: 'VTS Ch 12/14/73', working: '24/7', notes: 'World\u2019s busiest bunkering port and a major transhipment & crew-change hub. Dense traffic — strict VTS reporting in the Singapore Strait.' },
  { id: 'cnsha', name: 'Shanghai', country: 'China', region: 'Asia', flag: '🇨🇳', locode: 'CNSHA', lat: 31.230, lon: 121.474, timezone: 'UTC+8', maxDraftM: 17.5, maxLoaM: 400, terminals: ['Container (Yangshan/Waigaoqiao)', 'Bulk', 'Tanker'], pilotage: 'compulsory', vhf: 'VTS Ch 08/13', working: '24/7', notes: 'World\u2019s largest container port. Deep-water Yangshan terminal offshore. Tidal constraints on the Yangtze approaches; agent arranges seaman landing permits.' },
  { id: 'krpus', name: 'Busan', country: 'South Korea', region: 'Asia', flag: '🇰🇷', locode: 'KRPUS', lat: 35.103, lon: 129.040, timezone: 'UTC+9', maxDraftM: 17, maxLoaM: 400, terminals: ['Container (BNCT/PNC)', 'Bulk', 'Bunkering'], pilotage: 'compulsory', vhf: 'VTS Ch 12/67', working: '24/7', notes: 'Major NE-Asia transhipment hub and growing bunkering port. New Port (Busan New Port) handles the largest boxships.' },
  { id: 'jpyok', name: 'Yokohama', country: 'Japan', region: 'Asia', flag: '🇯🇵', locode: 'JPYOK', lat: 35.453, lon: 139.667, timezone: 'UTC+9', maxDraftM: 16, maxLoaM: 350, terminals: ['Container', 'Bulk', 'Car (Ro-Ro)'], pilotage: 'compulsory', vhf: 'Tokyo Wan VTS Ch 16/11', working: '24/7', notes: 'Part of the Tokyo Bay complex. Tokyo Bay VTS governs the approach; typhoon season planning essential.' },
  { id: 'lkcmb', name: 'Colombo', country: 'Sri Lanka', region: 'Asia', flag: '🇱🇰', locode: 'LKCMB', lat: 6.951, lon: 79.842, timezone: 'UTC+5:30', maxDraftM: 18, maxLoaM: 400, terminals: ['Container (CICT/SAGT)', 'Bunkering'], pilotage: 'compulsory', vhf: 'Port Control Ch 16/12', working: '24/7', notes: 'Key Indian-Ocean transhipment hub on the Asia–Europe route. Deep-water CICT terminal.' },

  // ---- Middle East ----
  { id: 'aejea', name: 'Jebel Ali (Dubai)', country: 'UAE', region: 'Middle East', flag: '🇦🇪', locode: 'AEJEA', lat: 25.010, lon: 55.060, timezone: 'UTC+4', maxDraftM: 17, maxLoaM: 400, terminals: ['Container (DP World)', 'Bulk', 'Free Zone'], pilotage: 'compulsory', vhf: 'Port Control Ch 16/06', working: '24/7', notes: 'Largest man-made harbour and the Middle East\u2019s leading container hub. Crew change via agent-arranged permits.' },
  { id: 'aukhl', name: 'Khor Fakkan', country: 'UAE', region: 'Middle East', flag: '🇦🇪', locode: 'AEKLF', lat: 25.348, lon: 56.357, timezone: 'UTC+4', maxDraftM: 16, maxLoaM: 400, terminals: ['Container (Gulftainer)', 'Anchorage'], pilotage: 'compulsory', vhf: 'Port Control Ch 16/14', working: '24/7', notes: 'East-coast UAE transhipment port outside the Strait of Hormuz — popular for bunkering & crew change.' },
  { id: 'sajed', name: 'Jeddah', country: 'Saudi Arabia', region: 'Middle East', flag: '🇸🇦', locode: 'SAJED', lat: 21.483, lon: 39.150, timezone: 'UTC+3', maxDraftM: 16, maxLoaM: 400, terminals: ['Container (RSGT/DP World)', 'Bulk', 'General'], pilotage: 'compulsory', vhf: 'Port Control Ch 16/12', working: '24/7', notes: 'Main Red-Sea gateway near the Suez–Bab-el-Mandeb route. Religious-season (Hajj) congestion possible.' },

  // ---- Europe ----
  { id: 'nlrtm', name: 'Rotterdam', country: 'Netherlands', region: 'Europe', flag: '🇳🇱', locode: 'NLRTM', lat: 51.949, lon: 4.140, timezone: 'UTC+1', maxDraftM: 24, maxLoaM: 400, terminals: ['Container (Maasvlakte)', 'Bulk', 'Tanker', 'Bunkering'], pilotage: 'compulsory', vhf: 'Maas Approach Ch 03; HCC Ch 11/13', working: '24/7', notes: 'Europe\u2019s largest port and a leading bunkering hub. Deep-water Maasvlakte 2. ECA — 0.10% sulphur applies.' },
  { id: 'beanr', name: 'Antwerp', country: 'Belgium', region: 'Europe', flag: '🇧🇪', locode: 'BEANR', lat: 51.260, lon: 4.380, timezone: 'UTC+1', maxDraftM: 16, maxLoaM: 366, terminals: ['Container', 'Bulk', 'Chemicals', 'Breakbulk'], pilotage: 'compulsory', vhf: 'Antwerp Port Control Ch 18/12', working: '24/7', notes: 'Major chemical & container port up the Scheldt — tidal river passage with locks. ECA area.' },
  { id: 'dehum', name: 'Hamburg', country: 'Germany', region: 'Europe', flag: '🇩🇪', locode: 'DEHAM', lat: 53.541, lon: 9.950, timezone: 'UTC+1', maxDraftM: 15.1, maxLoaM: 400, terminals: ['Container (HHLA/Eurogate)', 'Bulk', 'Breakbulk'], pilotage: 'compulsory', vhf: 'Hamburg Port Traffic Ch 13/14', working: '24/7', notes: 'Up the tidal Elbe (~110 km) — passage tide-dependent. Germany\u2019s largest port. ECA area.' },
  { id: 'grpir', name: 'Piraeus', country: 'Greece', region: 'Europe', flag: '🇬🇷', locode: 'GRPIR', lat: 37.940, lon: 23.630, timezone: 'UTC+2', maxDraftM: 16.5, maxLoaM: 400, terminals: ['Container (COSCO PCT)', 'Ferry', 'Cruise', 'Ship repair'], pilotage: 'compulsory', vhf: 'Piraeus Traffic Ch 12/14', working: '24/7', notes: 'Leading Med transhipment hub & cruise port. Mediterranean SOx ECA — 0.10% sulphur from May 2025.' },
  { id: 'esalg', name: 'Algeciras', country: 'Spain', region: 'Europe', flag: '🇪🇸', locode: 'ESALG', lat: 36.133, lon: -5.440, timezone: 'UTC+1', maxDraftM: 18.5, maxLoaM: 400, terminals: ['Container (APMT/TTI)', 'Bunkering'], pilotage: 'compulsory', vhf: 'Tarifa Traffic Ch 10/16', working: '24/7', notes: 'Strait of Gibraltar transhipment & bunkering hub. Strong currents; Tarifa VTS controls the strait. Med ECA.' },

  // ---- Türkiye (Istanbul focus) ----
  { id: 'tribosp', name: 'Istanbul — Bosphorus Transit', country: 'Türkiye', region: 'Europe', flag: '🇹🇷', locode: 'TRIST', lat: 41.100, lon: 29.060, timezone: 'UTC+3', maxDraftM: 0, maxLoaM: 0, terminals: ['Strait transit (TSS)', 'Anchorages'], pilotage: 'recommended', vhf: 'Turkeli / Kavak Traffic Ch 11/13/71', working: '24/7', notes: 'Bosphorus transit under Turkish Straits VTS — pilotage & tug strongly recommended for large/loaded ships. Traffic regulated by Montreux/Turkish Straits regulations; SOLAS reporting required.' },
  { id: 'trambar', name: 'Istanbul — Ambarlı', country: 'Türkiye', region: 'Europe', flag: '🇹🇷', locode: 'TRAMB', lat: 40.962, lon: 28.690, timezone: 'UTC+3', maxDraftM: 15, maxLoaM: 366, terminals: ['Container (Kumport/Marport/Mardaş)', 'General'], pilotage: 'compulsory', vhf: 'Ambarlı Port Ch 16/12', working: '24/7', notes: 'Istanbul\u2019s main container complex on the Marmara (west of the city). Within Turkish Straits VTS area.' },
  { id: 'trtuz', name: 'Tuzla', country: 'Türkiye', region: 'Europe', flag: '🇹🇷', locode: 'TRTUZ', lat: 40.826, lon: 29.300, timezone: 'UTC+3', maxDraftM: 9, maxLoaM: 250, terminals: ['Ship repair / yards', 'Shipbuilding', 'Anchorage'], pilotage: 'compulsory', vhf: 'Tuzla Ch 16/12', working: 'Yard hours / 24h afloat', notes: 'Türkiye\u2019s main ship-repair & shipbuilding cluster on the Anatolian side of the Marmara. Many drydocks.' },
  { id: 'tryar', name: 'Yarımca / Körfez (İzmit Bay)', country: 'Türkiye', region: 'Europe', flag: '🇹🇷', locode: 'TRYAR', lat: 40.760, lon: 29.760, timezone: 'UTC+3', maxDraftM: 16, maxLoaM: 366, terminals: ['Container (DP World Yarımca)', 'Tanker', 'Chemicals'], pilotage: 'compulsory', vhf: 'İzmit Bay Traffic Ch 16/14', working: '24/7', notes: 'Deep İzmit Bay industrial & container hub east of Istanbul. Compulsory pilotage in the bay.' },

  // ---- Egypt / Suez ----
  { id: 'egsuez', name: 'Suez Canal', country: 'Egypt', region: 'Africa', flag: '🇪🇬', locode: 'EGSUZ', lat: 30.000, lon: 32.550, timezone: 'UTC+2', maxDraftM: 20.1, maxLoaM: 400, terminals: ['Canal transit (convoy)', 'Port Said', 'Suez anchorages'], pilotage: 'compulsory', vhf: 'Canal Authority Ch 16/12/13', working: 'Convoy schedule', notes: 'Suez Canal Authority convoy transit; pilots embark for the passage. SCNT tonnage governs tolls. Port Said & Suez crew changes via agent.' },
  { id: 'egpsd', name: 'Port Said', country: 'Egypt', region: 'Africa', flag: '🇪🇬', locode: 'EGPSD', lat: 31.260, lon: 32.300, timezone: 'UTC+2', maxDraftM: 16.5, maxLoaM: 400, terminals: ['Container (SCCT — East Port Said)', 'Anchorage', 'Bunkering'], pilotage: 'compulsory', vhf: 'Port Said Ch 16/12', working: '24/7', notes: 'Northern gateway to the Suez Canal; East Port Said is a major transhipment terminal. Convoy assembly anchorage.' },

  // ---- Americas ----
  { id: 'papty', name: 'Panama Canal', country: 'Panama', region: 'Americas', flag: '🇵🇦', locode: 'PAONX', lat: 9.080, lon: -79.680, timezone: 'UTC-5', maxDraftM: 15.2, maxLoaM: 366, terminals: ['Canal transit (locks)', 'Balboa', 'Cristóbal'], pilotage: 'compulsory', vhf: 'Canal Signal Station Ch 12/13', working: 'Booking / TRP system', notes: 'Neopanamax locks: max ~366 m LOA, 49 m beam, ~15.2 m TFW draft (subject to Gatun Lake level — draft restrictions in drought). ACP pilots take control during transit.' },
  { id: 'ushou', name: 'Houston', country: 'United States', region: 'Americas', flag: '🇺🇸', locode: 'USHOU', lat: 29.730, lon: -95.270, timezone: 'UTC-6', maxDraftM: 13.7, maxLoaM: 330, terminals: ['Container (Bayport/Barbours Cut)', 'Tanker', 'Chemicals', 'Bulk'], pilotage: 'compulsory', vhf: 'Houston Traffic Ch 11/12/13', working: '24/7', notes: 'Long Houston Ship Channel transit (~50 nm). Major petrochemical complex. US visa (C1/D) needed for crew change/shore leave.' },
  { id: 'brsantos', name: 'Santos', country: 'Brazil', region: 'Americas', flag: '🇧🇷', locode: 'BRSSZ', lat: -23.960, lon: -46.300, timezone: 'UTC-3', maxDraftM: 15, maxLoaM: 366, terminals: ['Container (BTP/Santos Brasil)', 'Bulk (sugar/grain)', 'Tanker'], pilotage: 'compulsory', vhf: 'Santos Pilots / Port Ch 16/14', working: '24/7', notes: 'Latin America\u2019s busiest port and a key sugar/soy/coffee export gateway. Tidal & current restrictions in the channel.' },
  { id: 'usnyc', name: 'New York / New Jersey', country: 'United States', region: 'Americas', flag: '🇺🇸', locode: 'USNYC', lat: 40.670, lon: -74.080, timezone: 'UTC-5', maxDraftM: 15.2, maxLoaM: 366, terminals: ['Container (APM/Maher/GCT)', 'Bulk', 'Cruise'], pilotage: 'compulsory', vhf: 'New York VTS Ch 12/14', working: '24/7', notes: 'US East-coast\u2019s largest container port. Air-draft limited by the Bayonne Bridge (~66 m). North-American ECA — 0.10% sulphur.' },

  // ---- Africa ----
  { id: 'zadur', name: 'Durban', country: 'South Africa', region: 'Africa', flag: '🇿🇦', locode: 'ZADUR', lat: -29.870, lon: 31.030, timezone: 'UTC+2', maxDraftM: 12.8, maxLoaM: 350, terminals: ['Container (DCT)', 'Bulk', 'Car'], pilotage: 'compulsory', vhf: 'Durban Port Control Ch 16/09', working: '24/7', notes: 'Busiest port in sub-Saharan Africa. Entrance channel & strong swells can cause weather delays; congestion common.' },
  { id: 'matng', name: 'Tanger Med', country: 'Morocco', region: 'Africa', flag: '🇲🇦', locode: 'MAPTM', lat: 35.880, lon: -5.500, timezone: 'UTC+1', maxDraftM: 18, maxLoaM: 400, terminals: ['Container (APMT/Eurogate)', 'Ro-Ro', 'Bunkering'], pilotage: 'compulsory', vhf: 'Tanger Med Port Ch 16/12', working: '24/7', notes: 'Strait of Gibraltar transhipment giant. Strong currents in the strait; rapidly grown to a top-Med container hub.' },

  // ---- Oceania ----
  { id: 'aubne', name: 'Brisbane', country: 'Australia', region: 'Oceania', flag: '🇦🇺', locode: 'AUBNE', lat: -27.380, lon: 153.170, timezone: 'UTC+10', maxDraftM: 14, maxLoaM: 347, terminals: ['Container (DP World/Patrick)', 'Bulk', 'Car'], pilotage: 'compulsory', vhf: 'Brisbane VTS Ch 12/14', working: '24/7', notes: 'Maritime Crew Visa (MCV) required for foreign crew. Strict biosecurity (AMSA/DAFF) inspections; tidal channel.' },
];
