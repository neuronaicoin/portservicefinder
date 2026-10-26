import type { Metadata } from 'next';
import { VOYAGE_SEO } from '@/lib/voyage-seo';
import { VoyageToolSeo } from '@/components/VoyageToolSeo';

const seo = VOYAGE_SEO['distance'];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: '/voyage/distance' },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: '/voyage/distance',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoyageToolSeo slug="distance" />
    </>
  );
}
