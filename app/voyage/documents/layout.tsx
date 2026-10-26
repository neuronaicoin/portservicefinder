import type { Metadata } from 'next';
import { VOYAGE_SEO } from '@/lib/voyage-seo';
import { VoyageToolSeo } from '@/components/VoyageToolSeo';

const seo = VOYAGE_SEO['documents'];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: '/voyage/documents' },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: '/voyage/documents',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoyageToolSeo slug="documents" />
    </>
  );
}
