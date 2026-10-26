import type { Metadata } from 'next';
import { VOYAGE_SEO } from '@/lib/voyage-seo';
import { VoyageToolSeo } from '@/components/VoyageToolSeo';

const seo = VOYAGE_SEO['vault'];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: '/voyage/vault' },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: '/voyage/vault',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoyageToolSeo slug="vault" />
    </>
  );
}
