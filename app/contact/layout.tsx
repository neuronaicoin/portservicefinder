import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact PortServiceFinder in London about listings, partnerships, data corrections or technical issues. Email contact@portservicefinder.com, we reply in 24 hours.',
  alternates: { canonical: '/contact' },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact PortServiceFinder',
  url: `${siteConfig.url}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    address: { '@type': 'PostalAddress', ...siteConfig.address },
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: siteConfig.email, availableLanguage: ['English'] },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema).replace(/</g, '\\u003c') }} />
      {children}
    </>
  );
}
