import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.portservicefinder.com'),
  title: {
    default: "PortServiceFinder — Global Maritime Services Directory",
    template: "%s | PortServiceFinder",
  },
  description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search. Subscription for providers — no commission, ever.",
  keywords: [
    "ship agent directory",
    "shipchandler directory",
    "marine services",
    "port services",
    "maritime directory",
    "global ports",
    "vessel operators",
    "port agency",
  ],
  authors: [{ name: "PortServiceFinder" }],
  creator: "PortServiceFinder",
  publisher: "PortServiceFinder",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.portservicefinder.com",
    siteName: "PortServiceFinder",
    title: "PortServiceFinder — Global Maritime Services Directory",
    description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PortServiceFinder — Global Maritime Services Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortServiceFinder — Global Maritime Services Directory",
    description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide.",
    images: ["/og-image.png"],
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
