import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.portservicefinder.com"),
  title: {
    default: "PortServiceFinder — Global Maritime Services Directory",
    template: "%s | PortServiceFinder",
  },
  description:
    "Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search. Subscription for providers — no commission, ever.",
  keywords: [
    "ship agent directory",
    "shipchandler directory",
    "marine services",
    "port services",
    "maritime directory",
    "global ports",
    "vessel operators",
    "port agency",
    "ship supply",
    "maritime industry",
  ],
  authors: [{ name: "PortServiceFinder" }],
  creator: "PortServiceFinder",
  publisher: "PortServiceFinder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Icons (favicon, apple-icon, opengraph-image) are auto-detected by Next.js
  // from app/icon.tsx, app/apple-icon.tsx, app/opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.portservicefinder.com",
    siteName: "PortServiceFinder",
    title: "PortServiceFinder — Global Maritime Services Directory",
    description:
      "Every Port. Every Service. One Platform. Find verified ship agents, shipchandlers and marine service companies worldwide. Free to search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortServiceFinder — Global Maritime Services Directory",
    description:
      "Every Port. Every Service. One Platform. Find verified ship agents, shipchandlers and marine service companies worldwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "3fDgLOOxUGm9843wNeYRE53K2bwHogMRq22_acvu8qo",
  },
  alternates: {
    canonical: "https://www.portservicefinder.com",
  },
  category: "maritime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CFQV3SY7LX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CFQV3SY7LX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
