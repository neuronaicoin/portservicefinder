import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Quote from Port Service Providers',
  description:
    'Send one quote request to ship agents, shipchandlers and marine service companies at your port. Free for vessel operators, no sign-up, providers reply directly.',
  alternates: { canonical: '/request-quote' },
};

export default function RequestQuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
