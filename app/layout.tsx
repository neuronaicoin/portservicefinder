import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteConfig, getKeywordsString, getOrganizationSchema, getWebsiteSchema } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: Ship Agents, Shipchandlers & Marine Services Worldwide`,
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
  // no site-wide canonical: every page states its own (a shared one would point all pages at the homepage)
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme before first paint: the visitor's choice, else their system setting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('psf-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#07111c" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Libre+Baskerville:wght@700&display=swap" />

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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1048307384753465');
            fbq('track', 'PageView');
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
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1048307384753465&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
