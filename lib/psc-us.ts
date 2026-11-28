// U.S. Coast Guard Port State Control, 2025 Annual Report (public U.S. government data).
// "2025 Port State Control Statistics by Port" (safety examinations and detentions by
// Captain of the Port zone) and the national detention deficiency breakdown.
export const PSC_US_SOURCE = {
  title: 'U.S. Coast Guard, 2025 Port State Control Annual Report',
  url: 'https://www.dco.uscg.mil/Our-Organization/Assistant-Commandant-for-Prevention-Policy-CG-5P/Inspections-Compliance-CG-5PC-/Commercial-Vessel-Compliance/Foreign-Offshore-Compliance-Division/Port-State-Control/Annual-Reports/',
  detentionsUrl: 'https://www.dco.uscg.mil/Our-Organization/Assistant-Commandant-for-Prevention-Policy-CG-5P/Inspections-Compliance-CG-5PC-/Commercial-Vessel-Compliance/Foreign-Offshore-Compliance-Division/Port-State-Control/Detentions/',
  year: 2025,
};

export const PSC_US_TOTAL = { visits: 76351, exams: 8999, detentions: 78 };

export type PscZone = { zone: string; district: string; exams: number; detentions: number; ports: string[] };

export const PSC_US_ZONES: PscZone[] = [
  { zone: 'Sector Boston', district: 'Northeast', exams: 96, detentions: 0, ports: ['boston'] },
  { zone: 'Sector Charleston', district: 'Southeast', exams: 208, detentions: 6, ports: ['charleston'] },
  { zone: 'Sector Columbia River', district: 'Northwest', exams: 356, detentions: 1, ports: [] },
  { zone: 'Sector Corpus Christi', district: 'Heartland', exams: 456, detentions: 1, ports: ['corpus-christi'] },
  { zone: 'Sector Delaware Bay', district: 'East', exams: 312, detentions: 4, ports: ['philadelphia'] },
  { zone: 'Sector Detroit', district: 'Great Lakes', exams: 50, detentions: 0, ports: [] },
  { zone: 'MSU Duluth', district: 'Great Lakes', exams: 31, detentions: 0, ports: [] },
  { zone: 'Sector Eastern Great Lakes', district: 'Great Lakes', exams: 35, detentions: 0, ports: [] },
  { zone: 'Sector Guam', district: 'Oceania', exams: 52, detentions: 0, ports: [] },
  { zone: 'Sector Honolulu', district: 'Oceania', exams: 161, detentions: 0, ports: ['honolulu'] },
  { zone: 'Sector Houston/Galveston', district: 'Heartland', exams: 1166, detentions: 6, ports: ['houston', 'galveston', 'texas-city'] },
  { zone: 'Sector Jacksonville', district: 'Southeast', exams: 208, detentions: 1, ports: ['jacksonville'] },
  { zone: 'Sector Key West', district: 'Southeast', exams: 1, detentions: 0, ports: [] },
  { zone: 'Sector Lake Michigan', district: 'Great Lakes', exams: 40, detentions: 1, ports: [] },
  { zone: 'Sector Long Island Sound', district: 'Northeast', exams: 45, detentions: 0, ports: [] },
  { zone: 'Sector Los Angeles/Long Beach', district: 'Southwest', exams: 556, detentions: 2, ports: ['los-angeles', 'long-beach'] },
  { zone: 'Sector Maryland-NCR', district: 'East', exams: 266, detentions: 5, ports: ['baltimore'] },
  { zone: 'Sector Miami', district: 'Southeast', exams: 438, detentions: 14, ports: ['miami', 'port-everglades'] },
  { zone: 'Sector Mobile', district: 'Heartland', exams: 379, detentions: 9, ports: ['mobile', 'pascagoula'] },
  { zone: 'MSU Morgan City', district: 'Heartland', exams: 6, detentions: 0, ports: [] },
  { zone: 'Sector Northern Great Lakes', district: 'Great Lakes', exams: 8, detentions: 0, ports: [] },
  { zone: 'Sector New Orleans', district: 'Heartland', exams: 901, detentions: 5, ports: ['new-orleans'] },
  { zone: 'Sector New York', district: 'Northeast', exams: 754, detentions: 4, ports: [] },
  { zone: 'Sector North Carolina', district: 'East', exams: 113, detentions: 2, ports: ['wilmington-nc'] },
  { zone: 'Sector Northern New England', district: 'Northeast', exams: 41, detentions: 0, ports: [] },
  { zone: 'MSU Port Arthur', district: 'Heartland', exams: 502, detentions: 3, ports: ['port-arthur', 'beaumont'] },
  { zone: 'Sector Puget Sound', district: 'Northwest', exams: 272, detentions: 2, ports: ['seattle', 'tacoma'] },
  { zone: 'Sector San Diego', district: 'Southwest', exams: 74, detentions: 0, ports: ['san-diego'] },
  { zone: 'Sector San Francisco', district: 'Southwest', exams: 266, detentions: 1, ports: ['san-francisco', 'oakland'] },
  { zone: 'Sector San Juan', district: 'Southeast', exams: 324, detentions: 1, ports: ['san-juan'] },
  { zone: 'MSU Savannah', district: 'Southeast', exams: 222, detentions: 2, ports: ['savannah', 'brunswick'] },
  { zone: 'Sector Southeast Alaska', district: 'Arctic', exams: 34, detentions: 1, ports: [] },
  { zone: 'Sector Southeastern New England', district: 'Northeast', exams: 107, detentions: 1, ports: [] },
  { zone: 'Sector St. Petersburg', district: 'Southeast', exams: 151, detentions: 3, ports: ['tampa'] },
  { zone: 'Sector Virginia', district: 'East', exams: 277, detentions: 3, ports: ['norfolk'] },
  { zone: 'Sector Western Alaska & U.S. Arctic', district: 'Arctic', exams: 91, detentions: 0, ports: ['anchorage'] },
];

export function pscZoneForPort(slug: string) {
  return PSC_US_ZONES.find((z) => z.ports.includes(slug)) || null;
}

export const pscRate = (z: { exams: number; detentions: number }) => (z.exams ? (z.detentions / z.exams) * 100 : 0);

// National detention deficiency breakdown (2025): share of deficiencies within each category
export const PSC_US_BREAKDOWN = [
  { cat: 'Safety management systems', total: 62, svc: 'imo-flag-documentation', items: [['Maintenance of ship & equipment', 55], ['Shipboard operations', 13], ['Company responsibility & authority', 8], ['Emergency preparedness', 6], ['Other ISM items', 18]] },
  { cat: 'Fire safety', total: 53, svc: 'firefighting-safety', items: [['Fire detection & alarm systems', 28], ['Oil accumulation in engine room', 26], ['Fixed fire extinguishing installations', 13], ['Fire doors / openings in fire-resisting divisions', 9], ['Fire drills / crew performance', 9], ['Remote means of control', 8], ['Other', 6]] },
  { cat: 'Ship certificates', total: 14, svc: 'classification-survey', items: [['Safety Management Certificate', 36], ['Cargo Ship Safety Construction', 29], ['Minimum Safe Manning Document', 14], ['International Ship Security Certificate', 14], ['Load Line Certificate', 7]] },
] as const;
