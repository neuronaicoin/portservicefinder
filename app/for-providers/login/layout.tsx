import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Provider Log In',
  description:
    'Log in to your PortServiceFinder provider account to update your listing, see quote requests from vessel operators and check how often your ports are searched.',
  alternates: { canonical: '/for-providers/login' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
