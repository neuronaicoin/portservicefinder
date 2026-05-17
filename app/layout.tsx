import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortServiceFinder — Global Maritime Services Directory",
  description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search. List your business from $99/month.",
  keywords: ["ship agent", "shipchandler", "marine services", "port services", "ship supply", "maritime directory", "port agent", "vessel services"],
  openGraph: {
    title: "PortServiceFinder — Global Maritime Services Directory",
    description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide.",
    url: "https://www.portservicefinder.com",
    siteName: "PortServiceFinder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortServiceFinder — Global Maritime Services Directory",
    description: "Find verified ship agents, shipchandlers and marine service companies at any port worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
