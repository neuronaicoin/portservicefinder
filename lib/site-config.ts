// ============================================================
// SITE CONFIG — Brand identity, keywords, AI/SEO optimization
// Used by layout.tsx and other pages for consistent metadata
// ============================================================

export const siteConfig = {
  // Brand identity
  name: 'PortServiceFinder',
  alternateName: ['PSF', 'Port Service Finder'],
  url: 'https://www.portservicefinder.com',
  email: 'contact@portservicefinder.com',
  foundingDate: '2025',

  // Tagline & description
  tagline: 'Every Port. Every Service. One Platform.',
  description:
    'Global maritime services directory connecting vessel operators with verified ship agents, shipchandlers and marine service companies at 1,200+ ports worldwide. Free for vessel operators. No commission, ever.',
  shortDescription:
    'Find verified ship agents, shipchandlers and marine service companies at any port worldwide.',

  // Geographic coverage
  areaServed: 'Worldwide',

  // Keywords for SEO - comprehensive
  keywords: [
    // Brand
    'PortServiceFinder',
    'PSF',
    'Port Service Finder',

    // Core service categories
    'ship agent',
    'ship agency',
    'shipchandler',
    'ship chandler',
    'port agent',
    'port agency',
    'marine services',
    'maritime services',
    'maritime directory',
    'ship services directory',
    'B2B maritime marketplace',
    'global port services',

    // Operational services
    'bunker supply',
    'fresh provisions',
    'spare parts delivery',
    'crew change',
    'crew change logistics',
    'hull cleaning',
    'underwater diving',
    'ship repair',
    'marine engine service',
    'boiler service',
    'BWTS service',
    'ballast water treatment',
    'ECDIS service',
    'GMDSS radio survey',
    'marine surveyor',
    'classification survey',
    'NDT services',
    'welding services',
    'painting blasting',
    'tank cleaning',
    'cargo hold cleaning',
    'refrigeration HVAC',
    'electrical automation',
    'hydraulics service',
    'navigation communication',
    'crane hatch covers',
    'liferaft LSA',
    'pilot ladder inspection',
    'gas free certification',
    'pest control fumigation',
    'sewage MARPOL',
    'garbage disposal',
    'slop bilge disposal',
    'lashing securing',
    'mooring rigging',
    'anchor chain service',
    'firefighting safety',
    'lubricant supply',
    'fresh water supply',
    'IMO documentation',
    'flag documentation',

    // Vessel types
    'tanker services',
    'bulk carrier services',
    'container vessel services',
    'cruise vessel services',
    'offshore vessel services',
    'vessel operators',
    'shipowners',

    // Major maritime ports — Asia
    'Singapore',
    'Shanghai',
    'Hong Kong',
    'Busan',
    'Yokohama',
    'Tokyo',
    'Ningbo',
    'Qingdao',
    'Tianjin',
    'Mumbai',
    'JNPT',
    'Port Klang',
    'Tanjung Pelepas',
    'Jakarta',

    // Major maritime ports — Middle East
    'Dubai',
    'Jebel Ali',
    'Fujairah',
    'Jeddah',
    'Dammam',

    // Major maritime ports — Europe
    'Rotterdam',
    'Hamburg',
    'Antwerp',
    'Felixstowe',
    'Piraeus',
    'Algeciras',
    'Genoa',
    'Marseille',
    'Le Havre',
    'Bremerhaven',

    // Major maritime ports — Americas
    'Houston',
    'New York',
    'New Orleans',
    'Los Angeles',
    'Long Beach',
    'Santos',
    'Buenos Aires',
    'Vancouver',
    'Panama',

    // Major maritime ports — Africa & Oceania
    'Durban',
    'Cape Town',
    'Casablanca',
    'Sydney',
    'Melbourne',

    // Major canals & straits
    'Suez Canal',
    'Panama Canal',
    'Bosphorus',
    'Strait of Malacca',
    'Turkish Straits',
    'Istanbul transit',

    // Industry compliance
    'SOLAS compliance',
    'BWMC compliance',
    'MARPOL compliance',
    'IMO regulations',
    'EU ETS shipping',
    'UK ETS shipping',
    'FuelEU Maritime',
    'PSC inspection',
    'class survey support',

    // Discovery & marketplace terms
    'find marine services',
    'find ship agents',
    'find shipchandlers',
    'maritime service marketplace',
    'global maritime industry',
    'vessel service discovery',
    'maritime B2B directory',
  ],

  // All service categories that PortServiceFinder helps discover
  // Used for schema.org knowsAbout — tells AI what PSF is the authority on
  knowsAbout: [
    'Maritime industry',
    'Global shipping operations',
    'Port operations',
    'Vessel operators',
    'Ship agency services',
    'Port agency services',
    'Ship chandlery',
    'Marine provisioning',
    'Bunker supply',
    'Marine fuel supply',
    'Crew change coordination',
    'Crew logistics',
    'Hull cleaning services',
    'Underwater diving services',
    'Marine engine service',
    'Main engine overhaul',
    'Auxiliary engine service',
    'Marine boiler service',
    'Exhaust gas economiser cleaning',
    'Ballast water treatment system service',
    'BWTS commissioning',
    'BWMC compliance',
    'ECDIS service',
    'Electronic chart system service',
    'GMDSS radio survey',
    'SOLAS compliance',
    'Marine surveyors',
    'Cargo surveys',
    'P&I surveys',
    'Classification society surveys',
    'Non-destructive testing',
    'Marine welding',
    'Ship repair',
    'Drydock services',
    'Marine painting',
    'Surface preparation',
    'Tank cleaning',
    'Cargo hold cleaning',
    'Refrigeration and HVAC',
    'Marine electrical service',
    'Automation and control systems',
    'Marine hydraulics',
    'Navigation equipment',
    'Communication equipment',
    'Crane and hatch cover service',
    'Liferaft service',
    'LSA equipment service',
    'Pilot ladder inspection',
    'Gas free certification',
    'Pest control and fumigation',
    'Sewage system service',
    'MARPOL compliance',
    'Garbage disposal',
    'Slop and bilge disposal',
    'Lashing and securing',
    'Mooring and rigging',
    'Anchor and chain service',
    'Firefighting equipment service',
    'Lubricant supply',
    'Fresh water supply',
    'Spare parts logistics',
    'IMO documentation',
    'Flag state documentation',
    'PSC inspection support',
    'Port state control preparation',
    'Maritime regulatory compliance',
    'EU ETS for shipping',
    'UK ETS for shipping',
    'FuelEU Maritime regulation',
    'Maritime decarbonization',
    'LNG bunkering',
    'Methanol bunkering',
    'Ammonia bunkering',
    'Biofuel marine',
    'Singapore maritime services',
    'Rotterdam maritime services',
    'Shanghai maritime services',
    'Dubai maritime services',
    'Houston maritime services',
    'Suez Canal transit',
    'Panama Canal transit',
    'Turkish Straits transit',
    'Bosphorus transit',
    'Strait of Malacca',
  ],

  // Social media (for sameAs schema)
  social: {
    linkedin: 'https://www.linkedin.com/company/portservicefinder',
  },

  // Open Graph & Twitter defaults
  defaultOgImage: 'https://www.portservicefinder.com/og-image.jpg',

  // Google verification (already in your layout)
  googleVerification: '3fDgLOOxUGm9843wNeYRE53K2bwHogMRq22_acvu8qo',
};

// Helper: get all service categories as comma-separated string
export function getKeywordsString(): string {
  return siteConfig.keywords.join(', ');
}

// Helper: get organization schema for AI/SEO
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    alternateName: siteConfig.alternateName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon`,
    description: siteConfig.description,
    foundingDate: siteConfig.foundingDate,
    areaServed: {
      '@type': 'Place',
      name: siteConfig.areaServed,
    },
    knowsAbout: siteConfig.knowsAbout,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: siteConfig.email,
      availableLanguage: 'English',
    },
    sameAs: Object.values(siteConfig.social),
  };
}

// Helper: get website schema with SearchAction
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: siteConfig.alternateName,
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      alternateName: siteConfig.alternateName,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/?country={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}
