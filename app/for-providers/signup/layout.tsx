import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Free Provider Listing',
  description:
    'Create a free PortServiceFinder listing for your ship agency, shipchandler or marine service company. Free during our launch period, no card needed.',
  alternates: { canonical: '/for-providers/signup' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
