import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteConfig, getKeywordsString, getOrganizationSchema, getWebsiteSchema } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Global Maritime Services Directory | PSF`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Global Maritime Services Directory`,
    description: `${siteConfig.tagline} Find verified ship agents, shipchandlers and marine service companies worldwide. Free to search.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Global Maritime Services Directory`,
    description: `${siteConfig.tagline} Find verified ship agents, shipchandlers and marine service companies worldwide.`,
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
    google: siteConfig.googleVerification,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: "maritime",
  other: {
    // Additional meta tags for AI crawlers (ChatGPT, Perplexity, Claude, Gemini)
    "ai-content-declaration": "PortServiceFinder is a global maritime services marketplace and directory.",
  },
};

// Schema.org structured data — Generated from site-config
const organizationSchema = getOrganizationSchema();
const websiteSchema = getWebsiteSchema();

// Additional Service schema — tells AI/Google what PSF offers
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Maritime Services Directory",
  provider: {
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.alternateName,
    url: siteConfig.url,
  },
  areaServed: {
    "@type": "Place",
    name: siteConfig.areaServed,
  },
  description: "Global directory connecting vessel operators with verified marine service providers at ports worldwide. Categories include ship agents, shipchandlers, bunker suppliers, engine service, BWTS, boiler service, ECDIS/GMDSS, hull cleaning, marine surveyors, and 30+ other maritime service categories.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Maritime Service Categories",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ship Agency Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ship Chandlery" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bunker Supply" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Marine Engine Service" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hull Cleaning" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ballast Water Treatment Service" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Boiler Service" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "ECDIS Service" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "GMDSS Radio Survey" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Marine Surveys" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Crew Change Coordination" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ship Repair" } },
    ],
  },
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
        <Script
          id="schema-service"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
