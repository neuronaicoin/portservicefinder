// Regional port state control agreements (MoUs) and the coastal states that belong to them.
// Only links to each regime's own official site; no detention data is copied from them.
export type PscRegime = { key: string; name: string; region: string; url: string; countries: string[] };

export const PSC_REGIMES: PscRegime[] = [
  { key: 'uscg', name: 'U.S. Coast Guard', region: 'United States and territories', url: '/psc-detentions', countries: ['United States', 'Puerto Rico', 'Guam', 'Virgin Islands (US)'] },
  { key: 'paris', name: 'Paris MoU', region: 'Europe and the North Atlantic', url: 'https://parismou.org/detentions/', countries: ['Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Cyprus', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Malta', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovenia', 'Spain', 'Sweden', 'United Kingdom'] },
  { key: 'tokyo', name: 'Tokyo MoU', region: 'Asia-Pacific', url: 'https://www.tokyo-mou.org/inspections-detentions/detention-list/', countries: ['Australia', 'Canada', 'Chile', 'China', 'Fiji', 'Hong Kong', 'Indonesia', 'Japan', 'South Korea', 'Malaysia', 'Marshall Islands', 'New Zealand', 'Panama', 'Papua New Guinea', 'Peru', 'Philippines', 'Russia', 'Singapore', 'Thailand', 'Vanuatu', 'Vietnam'] },
  { key: 'iomou', name: 'Indian Ocean MoU', region: 'Indian Ocean', url: 'https://www.iomou.org/', countries: ['Australia', 'Bangladesh', 'Comoros', 'Eritrea', 'India', 'Iran', 'Kenya', 'Madagascar', 'Maldives', 'Mauritius', 'Mozambique', 'Myanmar', 'Oman', 'Seychelles', 'South Africa', 'Sri Lanka', 'Sudan', 'Tanzania', 'Yemen'] },
  { key: 'med', name: 'Mediterranean MoU', region: 'Eastern and southern Mediterranean', url: 'https://www.medmou.org/', countries: ['Algeria', 'Cyprus', 'Egypt', 'Israel', 'Jordan', 'Lebanon', 'Malta', 'Morocco', 'Tunisia', 'Turkey'] },
  { key: 'bsmou', name: 'Black Sea MoU', region: 'Black Sea', url: 'https://bsmou.org/', countries: ['Bulgaria', 'Georgia', 'Romania', 'Russia', 'Turkey', 'Ukraine'] },
  { key: 'vina', name: 'Viña del Mar Agreement', region: 'Latin America', url: 'https://alcances.org/', countries: ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Cuba', 'Ecuador', 'Guatemala', 'Honduras', 'Mexico', 'Panama', 'Peru', 'Uruguay', 'Venezuela', 'Dominican Republic', 'Costa Rica'] },
  { key: 'cmou', name: 'Caribbean MoU', region: 'Caribbean', url: 'https://www.caribbeanmou.org/', countries: ['Antigua and Barbuda', 'Aruba', 'Bahamas', 'Barbados', 'Belize', 'Cayman Islands', 'Cuba', 'Curacao', 'Grenada', 'Guyana', 'Jamaica', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent', 'Suriname', 'Trinidad and Tobago'] },
  { key: 'abuja', name: 'Abuja MoU', region: 'West and Central Africa', url: 'https://www.abujamou.org/', countries: ['Angola', 'Benin', 'Cameroon', 'Cape Verde', 'Congo (Republic)', 'Congo (DRC)', 'Ivory Coast', 'Equatorial Guinea', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Liberia', 'Mauritania', 'Namibia', 'Nigeria', 'Sao Tome and Principe', 'Senegal', 'Sierra Leone', 'South Africa', 'Togo'] },
  { key: 'riyadh', name: 'Riyadh MoU', region: 'Arabian Gulf', url: 'https://www.riyadhmou.org/', countries: ['Bahrain', 'Kuwait', 'Oman', 'Qatar', 'Saudi Arabia', 'UAE'] },
];

export function pscRegimesFor(country: string) {
  return PSC_REGIMES.filter((r) => r.countries.includes(country));
}
