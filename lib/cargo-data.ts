// ============================================================
// Cargo Database — stowage factors, IMSBC groups, hazards
// Data based on the IMSBC Code (International Maritime Solid
// Bulk Cargoes Code) and standard maritime stowage references.
// Stowage factors are typical/approximate; always verify with
// the shipper's declaration and the vessel's cargo documents.
// ============================================================

export type ImsbcGroup = 'A' | 'B' | 'C' | 'A&B' | 'GENERAL';

export interface Cargo {
  name: string;
  category: string;
  group: ImsbcGroup;       // IMSBC group (A liquefiable / B chemical hazard / C neither)
  sfMin: number;           // stowage factor m³/MT (low)
  sfMax: number;           // stowage factor m³/MT (high)
  angleOfRepose?: number;  // degrees (Group A / granular)
  unNo?: string;           // UN number (Group B dangerous)
  hazards: string[];       // key hazards / properties
  care: string;            // carriage & care note
}

// Helper note: ft³/LT ≈ m³/MT × 35.88 (35.314 ft³/m³ × 1.016 t/LT)

export const CARGO_CATEGORIES = [
  'Mineral Ores & Concentrates',
  'Coal & Coke',
  'Grains & Agri',
  'Fertilizers',
  'Cement & Clinker',
  'Steel & Scrap',
  'Aggregates & Sand',
  'Pellets & Pig Iron',
  'Sulphur & Chemicals',
  'Wood & Forest',
  'Salt & Minerals',
  'Project & Break Bulk',
] as const;

export const CARGOES: Cargo[] = [
  // ---------- Mineral Ores & Concentrates ----------
  { name: 'Iron Ore', category: 'Mineral Ores & Concentrates', group: 'C', sfMin: 0.34, sfMax: 0.50, angleOfRepose: 35, hazards: ['High density', 'Structural overstress risk'], care: 'Trim level. Heavy cargo — watch tank-top loading & uneven distribution. May cause hogging if poorly trimmed.' },
  { name: 'Iron Ore Fines', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.30, sfMax: 0.46, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'High density'], care: 'GROUP A — may liquefy. Check TML/MC certificate, can-test on board. Do not load if MC > TML.' },
  { name: 'Iron Ore Concentrate', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.29, sfMax: 0.40, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'Very high density'], care: 'GROUP A — liquefiable concentrate. Verify moisture content vs TML before & during loading.' },
  { name: 'Bauxite', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.60, sfMax: 0.85, angleOfRepose: 30, hazards: ['Liquefaction (fine bauxite, Group A)', 'Dust'], care: 'Fine bauxite reclassified Group A — verify TML/MC. Some lumpy bauxite is Group C. Confirm shipper declaration.' },
  { name: 'Manganese Ore', category: 'Mineral Ores & Concentrates', group: 'C', sfMin: 0.34, sfMax: 0.56, angleOfRepose: 35, hazards: ['High density'], care: 'Heavy. Trim level, monitor hold structure. Generally Group C unless fine concentrate.' },
  { name: 'Nickel Ore', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.42, sfMax: 0.66, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'Loss of stability'], care: 'GROUP A — high-risk liquefaction (multiple casualties). Strict TML/MC verification. Refuse if wet.' },
  { name: 'Chrome Ore', category: 'Mineral Ores & Concentrates', group: 'C', sfMin: 0.32, sfMax: 0.46, angleOfRepose: 35, hazards: ['Very high density'], care: 'Extremely heavy. Spread load, avoid overstress. Concentrates may be Group A.' },
  { name: 'Copper Concentrate', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.27, sfMax: 0.40, angleOfRepose: 35, hazards: ['Liquefaction (Group A)', 'Very high density'], care: 'GROUP A — heavy concentrate, liquefiable. Verify TML/MC. Watch tank-top strength.' },
  { name: 'Zinc Concentrate', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.30, sfMax: 0.45, angleOfRepose: 35, hazards: ['Liquefaction (Group A)'], care: 'GROUP A — liquefiable. TML/MC certificate required.' },
  { name: 'Lead Concentrate', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.24, sfMax: 0.35, angleOfRepose: 35, hazards: ['Liquefaction', 'Toxic dust'], care: 'GROUP A — very dense, toxic. Avoid dust inhalation. Verify TML/MC.' },
  { name: 'Ilmenite Sand', category: 'Mineral Ores & Concentrates', group: 'A', sfMin: 0.27, sfMax: 0.34, angleOfRepose: 30, hazards: ['Liquefaction (Group A)'], care: 'GROUP A — mineral sand, can liquefy. TML/MC required.' },

  // ---------- Coal & Coke ----------
  { name: 'Coal (Bituminous)', category: 'Coal & Coke', group: 'A&B', sfMin: 0.79, sfMax: 0.93, angleOfRepose: 35, hazards: ['Self-heating', 'Methane emission', 'Liquefaction (fines)', 'Oxygen depletion'], care: 'GROUP A&B — monitor temperature & gas (CH4, CO). Surface ventilation only, no through-ventilation. No smoking/hot work.' },
  { name: 'Coal (Anthracite)', category: 'Coal & Coke', group: 'B', sfMin: 0.83, sfMax: 0.95, angleOfRepose: 35, hazards: ['Lower self-heating', 'Methane (low)'], care: 'GROUP B — lower reactivity than bituminous but monitor gases. Keep ignition sources away.' },
  { name: 'Steam Coal', category: 'Coal & Coke', group: 'A&B', sfMin: 0.80, sfMax: 0.92, angleOfRepose: 35, hazards: ['Self-heating', 'Methane', 'Liquefaction (fines)'], care: 'GROUP A&B — gas & temperature monitoring. Confirm shipper schedule for self-heating tendency.' },
  { name: 'Coke / Petcoke', category: 'Coal & Coke', group: 'B', sfMin: 1.10, sfMax: 1.40, angleOfRepose: 40, hazards: ['Dust', 'Abrasive', 'Self-heating (some petcoke)'], care: 'GROUP B. Bulky, abrasive dust. Some petroleum coke self-heats — verify cargo schedule.' },
  { name: 'Coal Slurry / Fines', category: 'Coal & Coke', group: 'A', sfMin: 0.75, sfMax: 0.90, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'Self-heating'], care: 'GROUP A — fine coal liquefies. TML/MC verification essential.' },

  // ---------- Grains & Agri ----------
  { name: 'Wheat', category: 'Grains & Agri', group: 'C', sfMin: 1.25, sfMax: 1.40, angleOfRepose: 25, hazards: ['Shifting (free surface)', 'Infestation', 'Oxygen depletion'], care: 'Comply with International Grain Code — stability/heeling. Hold cleanliness & fumigation. Ventilate to control sweat.' },
  { name: 'Corn / Maize', category: 'Grains & Agri', group: 'C', sfMin: 1.30, sfMax: 1.45, angleOfRepose: 25, hazards: ['Shifting', 'Self-heating if wet', 'Infestation'], care: 'Grain Code stability. Watch moisture/heating. Ventilate against sweat.' },
  { name: 'Soya Beans', category: 'Grains & Agri', group: 'C', sfMin: 1.30, sfMax: 1.45, angleOfRepose: 25, hazards: ['Self-heating', 'Oxygen depletion', 'Shifting'], care: 'High self-heating & O2 depletion risk. Enclosed space precautions. Grain Code compliance.' },
  { name: 'Barley', category: 'Grains & Agri', group: 'C', sfMin: 1.30, sfMax: 1.45, angleOfRepose: 25, hazards: ['Shifting', 'Infestation'], care: 'Grain Code. Keep dry, ventilate. Pre-load hold inspection for cleanliness.' },
  { name: 'Rice (in bulk)', category: 'Grains & Agri', group: 'C', sfMin: 1.25, sfMax: 1.40, angleOfRepose: 25, hazards: ['Sweat / caking', 'Infestation'], care: 'Sensitive to moisture — careful ventilation. Often bagged; in bulk apply Grain Code.' },
  { name: 'Soybean Meal', category: 'Grains & Agri', group: 'B', sfMin: 1.35, sfMax: 1.65, angleOfRepose: 30, hazards: ['Self-heating', 'Oxygen depletion', 'Flammable (seed cake)'], care: 'GROUP B (seed cake) — self-heating & O2 depletion. Verify solvent extraction & oil/moisture content. Monitor temperature.' },
  { name: 'Sugar (raw bulk)', category: 'Grains & Agri', group: 'C', sfMin: 1.00, sfMax: 1.20, angleOfRepose: 30, hazards: ['Caking', 'Moisture'], care: 'Keep dry, prevent water ingress (sets hard). Clean holds, no contamination.' },
  { name: 'Wood Pellets', category: 'Grains & Agri', group: 'B', sfMin: 1.40, sfMax: 1.60, angleOfRepose: 30, hazards: ['Oxygen depletion', 'CO emission', 'Self-heating', 'Swelling if wet'], care: 'GROUP B — severe O2 depletion & CO. Enclosed-space entry strictly controlled. Keep dry (swelling). No ventilation if self-heating.' },
  { name: 'Tapioca / Cassava', category: 'Grains & Agri', group: 'C', sfMin: 1.50, sfMax: 1.80, angleOfRepose: 35, hazards: ['Dust', 'Self-heating if wet', 'Infestation'], care: 'Dusty. Keep dry. Ventilate to control heating.' },

  // ---------- Fertilizers ----------
  { name: 'Urea', category: 'Fertilizers', group: 'C', sfMin: 0.70, sfMax: 0.85, angleOfRepose: 28, hazards: ['Caking', 'Hygroscopic', 'Ammonia odour'], care: 'Hygroscopic — keep dry, seal holds. Cakes if wet. Clean holds (contamination claims).' },
  { name: 'Ammonium Nitrate', category: 'Fertilizers', group: 'B', sfMin: 0.80, sfMax: 1.00, angleOfRepose: 28, unNo: '1942', hazards: ['Oxidizer', 'Explosion if contaminated/heated', 'Supports combustion'], care: 'GROUP B / Class 5.1 — DANGEROUS. No contamination (oils, organics), no heat. Strict segregation. Follow IMSBC/IMDG.' },
  { name: 'Ammonium Sulphate', category: 'Fertilizers', group: 'C', sfMin: 0.75, sfMax: 0.90, angleOfRepose: 30, hazards: ['Caking', 'Corrosive to steel (damp)'], care: 'Keep dry — corrodes steel when damp. Cakes. Protect bilge/structure.' },
  { name: 'DAP (Diammonium Phosphate)', category: 'Fertilizers', group: 'C', sfMin: 0.80, sfMax: 0.95, angleOfRepose: 30, hazards: ['Caking', 'Ammonia release if wet'], care: 'Keep dry. Releases ammonia if wet/heated. Clean holds.' },
  { name: 'MOP / Potash (KCl)', category: 'Fertilizers', group: 'C', sfMin: 0.85, sfMax: 1.05, angleOfRepose: 30, hazards: ['Caking', 'Corrosive (chloride)'], care: 'Chloride — corrosive when damp. Keep dry, protect tank top. Cakes hard.' },
  { name: 'NPK Compound', category: 'Fertilizers', group: 'B', sfMin: 0.75, sfMax: 0.95, angleOfRepose: 30, hazards: ['Self-sustaining decomposition (some grades)', 'Caking'], care: 'Some NPK grades undergo self-sustaining decomposition — verify schedule. Keep dry & cool.' },
  { name: 'Rock Phosphate', category: 'Fertilizers', group: 'C', sfMin: 0.70, sfMax: 0.95, angleOfRepose: 30, hazards: ['Dust', 'Caking when wet'], care: 'Dusty. Keep dry. Generally inert. Clean holds.' },

  // ---------- Cement & Clinker ----------
  { name: 'Cement (bulk)', category: 'Cement & Clinker', group: 'C', sfMin: 0.45, sfMax: 0.62, angleOfRepose: 35, hazards: ['Fine dust', 'Aeration/fluidization', 'Sets hard if wet'], care: 'Very fine — aerates & flows; watch free-surface effect during loading. Keep absolutely dry. Dust hazard.' },
  { name: 'Cement Clinker', category: 'Cement & Clinker', group: 'C', sfMin: 0.55, sfMax: 0.75, angleOfRepose: 35, hazards: ['Dust', 'Abrasive', 'Heat (fresh clinker)'], care: 'Abrasive. Fresh clinker may be hot — check temperature. Keep dry (sets). Hold protection.' },
  { name: 'Fly Ash', category: 'Cement & Clinker', group: 'A', sfMin: 0.70, sfMax: 0.95, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'Very fine dust'], care: 'GROUP A — fine ash can liquefy. TML/MC. Severe dust. Keep dry.' },
  { name: 'GGBS / Slag (ground)', category: 'Cement & Clinker', group: 'C', sfMin: 0.55, sfMax: 0.75, angleOfRepose: 32, hazards: ['Dust', 'Caking when wet'], care: 'Ground slag — fine, dusty. Keep dry. Some granulated slag is Group A — confirm.' },

  // ---------- Steel & Scrap ----------
  { name: 'Steel Scrap (HMS)', category: 'Steel & Scrap', group: 'C', sfMin: 0.50, sfMax: 1.10, hazards: ['Sharp/heavy pieces', 'Hull/tank-top damage', 'Shifting'], care: 'Watch tank-top damage from heavy drops. Secure to prevent shifting. Magnet loading — uneven distribution risk.' },
  { name: 'Shredded Scrap', category: 'Steel & Scrap', group: 'C', sfMin: 0.70, sfMax: 1.30, hazards: ['Self-heating (oily/organic)', 'Dust'], care: 'Oily/organic content may self-heat. Monitor. Distribute evenly.' },
  { name: 'Pig Iron', category: 'Steel & Scrap', group: 'C', sfMin: 0.30, sfMax: 0.45, hazards: ['Very high density', 'Tank-top overstress'], care: 'Extremely heavy & concentrated — strict attention to tank-top strength & distribution. Avoid point loading.' },
  { name: 'Steel Coils', category: 'Steel & Scrap', group: 'GENERAL', sfMin: 0.20, sfMax: 0.40, hazards: ['Shifting/rolling', 'Point loading', 'Rust/wet damage'], care: 'Secure against rolling (eye-to-sky/athwart). Dunnage & lashing. Protect from moisture (rust claims).' },
  { name: 'Steel Plates / Slabs', category: 'Steel & Scrap', group: 'GENERAL', sfMin: 0.13, sfMax: 0.25, hazards: ['Heavy', 'Sharp edges', 'Sliding'], care: 'Heavy flat cargo — even distribution, anti-slip dunnage, lashing. Watch local loading.' },

  // ---------- Aggregates & Sand ----------
  { name: 'Sand (silica)', category: 'Aggregates & Sand', group: 'A', sfMin: 0.55, sfMax: 0.70, angleOfRepose: 30, hazards: ['Liquefaction (fine/wet, Group A)', 'High density'], care: 'Fine/wet sand may liquefy (Group A). Verify moisture. Heavy — trim level.' },
  { name: 'Gravel / Aggregate', category: 'Aggregates & Sand', group: 'C', sfMin: 0.55, sfMax: 0.70, angleOfRepose: 35, hazards: ['High density'], care: 'Heavy, generally inert. Trim level, watch tank-top loading.' },
  { name: 'Gypsum', category: 'Aggregates & Sand', group: 'C', sfMin: 0.65, sfMax: 0.85, angleOfRepose: 30, hazards: ['Dust', 'Caking when wet'], care: 'Dusty. Keep dry (cakes). Clean holds. Generally inert.' },
  { name: 'Limestone', category: 'Aggregates & Sand', group: 'C', sfMin: 0.60, sfMax: 0.80, angleOfRepose: 35, hazards: ['Dust', 'Abrasive'], care: 'Dusty, abrasive. Keep reasonably dry. Inert.' },
  { name: 'Bentonite', category: 'Aggregates & Sand', group: 'A', sfMin: 0.70, sfMax: 0.95, angleOfRepose: 30, hazards: ['Liquefaction (Group A)', 'Swelling', 'Fine dust'], care: 'GROUP A — clay swells with water, can liquefy. Keep dry, verify TML/MC.' },

  // ---------- Pellets & Pig Iron ----------
  { name: 'Iron Ore Pellets', category: 'Pellets & Pig Iron', group: 'C', sfMin: 0.40, sfMax: 0.50, angleOfRepose: 30, hazards: ['High density', 'Rolling/avalanche'], care: 'Spherical — flow/avalanche risk during loading. Heavy. Trim carefully, watch shifting.' },
  { name: 'DRI (A) Briquettes (HBI)', category: 'Pellets & Pig Iron', group: 'B', sfMin: 0.35, sfMax: 0.50, angleOfRepose: 35, hazards: ['Hydrogen on contact with water', 'Self-heating (low for HBI)'], care: 'GROUP B — hot-briquetted iron. Reacts with water → hydrogen & heat. Keep dry, inert/ventilate per schedule, monitor temp & H2.' },
  { name: 'DRI (B) Lumps/Pellets/Fines', category: 'Pellets & Pig Iron', group: 'B', sfMin: 0.35, sfMax: 0.55, angleOfRepose: 35, hazards: ['Severe self-heating', 'Hydrogen with water', 'Oxygen depletion'], care: 'GROUP B — HIGH RISK. Aged/passivated cargo only. Inert atmosphere, strict moisture control, temperature & gas monitoring.' },

  // ---------- Sulphur & Chemicals ----------
  { name: 'Sulphur (crushed lump)', category: 'Sulphur & Chemicals', group: 'C', sfMin: 0.65, sfMax: 0.85, angleOfRepose: 35, unNo: '1350', hazards: ['Combustible dust', 'Corrosive (wet → acid)', 'Toxic SO2 if burning'], care: 'GROUP C (formed) — dust is flammable. Corrodes steel when damp (sulphuric acid). Clean holds, lime-wash protection, no ignition.' },
  { name: 'Sulphur (fine/powder)', category: 'Sulphur & Chemicals', group: 'B', sfMin: 0.60, sfMax: 0.80, angleOfRepose: 30, unNo: '1350', hazards: ['Flammable dust', 'Static ignition', 'Corrosive'], care: 'GROUP B — fine sulphur, dust explosion risk. Earth equipment, no sparks. Corrosion protection.' },
  { name: 'Borax', category: 'Sulphur & Chemicals', group: 'C', sfMin: 0.70, sfMax: 0.90, angleOfRepose: 30, hazards: ['Caking', 'Dust'], care: 'Keep dry (cakes). Dusty. Generally inert.' },
  { name: 'Soda Ash', category: 'Sulphur & Chemicals', group: 'C', sfMin: 0.80, sfMax: 1.10, angleOfRepose: 32, hazards: ['Caking', 'Alkaline dust (irritant)', 'Corrosive when wet'], care: 'Keep dry (cakes & corrodes). Alkaline dust irritates skin/eyes. Clean holds.' },
  { name: 'Salt Cake (Sodium Sulphate)', category: 'Sulphur & Chemicals', group: 'C', sfMin: 0.65, sfMax: 0.85, angleOfRepose: 30, hazards: ['Caking', 'Corrosive when damp'], care: 'Keep dry. Corrodes steel when damp. Cakes.' },

  // ---------- Wood & Forest ----------
  { name: 'Logs (round)', category: 'Wood & Forest', group: 'GENERAL', sfMin: 1.60, sfMax: 2.40, hazards: ['Shifting/rolling', 'Stability (deck cargo)', 'Water absorption'], care: 'Follow Timber Deck Cargo Code if on deck. Lashing & uprights. Absorbs water → stability change. Even stowage.' },
  { name: 'Sawn Timber / Lumber', category: 'Wood & Forest', group: 'GENERAL', sfMin: 1.70, sfMax: 2.50, hazards: ['Shifting', 'Moisture/staining'], care: 'Block-stow & lash. Ventilate against staining/mould. Timber Code for deck cargo.' },
  { name: 'Wood Chips', category: 'Wood & Forest', group: 'B', sfMin: 2.30, sfMax: 3.00, angleOfRepose: 30, hazards: ['Oxygen depletion', 'CO/CO2 emission', 'Self-heating'], care: 'GROUP B — depletes oxygen, emits CO2/CO. Enclosed-space entry precautions mandatory. High SF (bulky).' },
  { name: 'Wood Logs (fumigated)', category: 'Wood & Forest', group: 'GENERAL', sfMin: 1.60, sfMax: 2.40, hazards: ['Fumigant gas', 'Shifting'], care: 'Fumigated holds — toxic gas. Display warnings, ventilate before entry, gas-test.' },

  // ---------- Salt & Minerals ----------
  { name: 'Salt (rock/sea, bulk)', category: 'Salt & Minerals', group: 'C', sfMin: 0.85, sfMax: 1.10, angleOfRepose: 30, hazards: ['Corrosive (chloride)', 'Caking', 'Hygroscopic'], care: 'Chloride — corrosive to steel, especially damp. Wash down well after discharge. Keep dry (cakes).' },
  { name: 'Potash (mineral)', category: 'Salt & Minerals', group: 'C', sfMin: 0.85, sfMax: 1.05, angleOfRepose: 30, hazards: ['Corrosive', 'Caking'], care: 'Keep dry — corrosive & cakes. Protect structure.' },
  { name: 'Talc / Magnesite', category: 'Salt & Minerals', group: 'C', sfMin: 0.70, sfMax: 0.95, angleOfRepose: 30, hazards: ['Very fine dust'], care: 'Fine dusty mineral — respiratory protection. Keep dry. Inert.' },
  { name: 'Fluorspar', category: 'Salt & Minerals', group: 'A', sfMin: 0.45, sfMax: 0.60, angleOfRepose: 35, hazards: ['Liquefaction (fine, Group A)', 'High density'], care: 'Fine fluorspar may liquefy (Group A). Verify TML/MC. Heavy.' },
  { name: 'Barytes (Barium Sulphate)', category: 'Salt & Minerals', group: 'A', sfMin: 0.30, sfMax: 0.45, angleOfRepose: 35, hazards: ['Liquefaction (Group A)', 'Very high density'], care: 'GROUP A — very dense, liquefiable. TML/MC required. Watch tank-top strength.' },

  // ---------- Project & Break Bulk ----------
  { name: 'Bagged Cement', category: 'Project & Break Bulk', group: 'GENERAL', sfMin: 0.55, sfMax: 0.75, hazards: ['Bag damage', 'Moisture (sets hard)'], care: 'Block-stow, dunnage off tank top. Keep dry. Tally bags, watch for torn/wet bags.' },
  { name: 'Bagged Rice / Sugar', category: 'Project & Break Bulk', group: 'GENERAL', sfMin: 1.20, sfMax: 1.60, hazards: ['Moisture/sweat', 'Infestation', 'Bag tearing'], care: 'Ventilate against sweat. Dunnage, keep bilges clear. Fumigation/cleanliness.' },
  { name: 'Project Cargo (general)', category: 'Project & Break Bulk', group: 'GENERAL', sfMin: 0.50, sfMax: 3.00, hazards: ['Heavy lift', 'Point loading', 'Lashing'], care: 'Per cargo securing manual & lashing plan. Heavy-lift spreaders, load-spreading dunnage. Check deck/tank-top limits.' },
  { name: 'Containers (on bulker hatch)', category: 'Project & Break Bulk', group: 'GENERAL', sfMin: 1.50, sfMax: 2.50, hazards: ['Securing', 'Stack weight'], care: 'Secure per approved plan. Watch hatch-cover strength & stack weights.' },
  { name: 'Big Bags / FIBC', category: 'Project & Break Bulk', group: 'GENERAL', sfMin: 0.60, sfMax: 1.40, hazards: ['Bag integrity', 'Shifting'], care: 'Stow tight to prevent shifting. Check bag condition. Dunnage. Content-specific care applies.' },
];

// Quick reference constants
export const FT3_PER_M3 = 35.3147;
export const T_PER_LT = 1.01605;
// ft³/LT ≈ m³/MT × 35.88
export const M3MT_TO_FT3LT = FT3_PER_M3 * T_PER_LT; // ≈ 35.88
