import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Provider Dashboard',
  description:
    'Your PortServiceFinder provider dashboard: quote requests, leads from vessel operators, search appearances by port and your listing details in one place.',
  alternates: { canonical: '/for-providers/dashboard' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
