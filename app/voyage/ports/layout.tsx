import type { Metadata } from 'next';
import { VOYAGE_SEO } from '@/lib/voyage-seo';
import { VoyageToolSeo } from '@/components/VoyageToolSeo';

const seo = VOYAGE_SEO['ports'];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: '/voyage/ports' },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: '/voyage/ports',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoyageToolSeo slug="ports" />
    </>
  );
}
