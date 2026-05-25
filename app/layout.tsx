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

// Schema.org structured data — Organization + WebSite
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PortServiceFinder",
  url: "https://www.portservicefinder.com",
  logo: "https://www.portservicefinder.com/icon",
  description:
    "Global maritime services directory connecting vessel operators with verified ship agents, shipchandlers and marine service companies at ports worldwide.",
  foundingDate: "2025",
  areaServed: {
    "@type": "Place",
    name: "Worldwide",
  },
  knowsAbout: [
    "Maritime industry",
    "Ship agency services",
    "Ship chandlery",
    "Marine services",
    "Port operations",
    "Vessel supply",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "contact@portservicefinder.com",
    availableLanguage: "English",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PortServiceFinder",
  alternateName: "PSF",
  url: "https://www.portservicefinder.com",
  description:
    "Find verified ship agents, shipchandlers and marine service companies at any port worldwide.",
  publisher: {
    "@type": "Organization",
    name: "PortServiceFinder",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.portservicefinder.com/?country={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-US",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts — saves 200-300ms */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Load Google Fonts directly as stylesheet with display=swap — no render block */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap"
        />

        {/* Preload hero image for faster LCP on homepage */}
        <link
          rel="preload"
          as="image"
          href="/hero-bg.jpg"
          fetchPriority="high"
        />

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
        <Script
          id="schema-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
