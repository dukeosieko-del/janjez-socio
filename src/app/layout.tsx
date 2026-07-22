import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthContext";
import { SITE_URL } from "./lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-full flex flex-col bg-kenya-black text-kenya-white">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
