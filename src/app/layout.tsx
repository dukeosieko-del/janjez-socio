import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthContext";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_URL } from "./lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#00A859",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "janjez.social — Pata Clout Chapchap",
    template: "%s | janjez.social",
  },
  description: "Kenya's plug for instant social clout. Automated SMM panel for YouTube, WhatsApp, Instagram, Facebook, TikTok, Telegram, Google Maps, and X (Twitter). Lipa na M-Pesa.",
  keywords: ["SMM panel Kenya", "social media marketing", "M-Pesa", "YouTube views", "Instagram followers", "TikTok views", "janjez.social"],
  authors: [{ name: "janjez.social" }],
  creator: "janjez.social",
  publisher: "janjez.social",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "janjez.social",
    title: "janjez.social — Pata Clout Chapchap",
    description: "Kenya's plug for instant social clout. Automated SMM panel for YouTube, WhatsApp, Instagram, Facebook, TikTok, Telegram, Google Maps, and X (Twitter). Lipa na M-Pesa.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "janjez.social — Pata Clout Chapchap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "janjez.social — Pata Clout Chapchap",
    description: "Kenya's plug for instant social clout. Lipa na M-Pesa.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-icon-180x180.png",
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
      suppressHydrationWarning
    >
      <head>
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00A859" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="janjez" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://api.brevo.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preload" as="image" href="/og-image.png" fetchPriority="low" />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-full flex flex-col bg-kenya-black text-kenya-white">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        <ServiceWorkerRegistrar />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
