import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Listing',
  description:
    'Add the ports you serve, your services and contact details so vessel operators can find your company on PortServiceFinder port pages and contact you directly.',
  alternates: { canonical: '/for-providers/complete-profile' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
