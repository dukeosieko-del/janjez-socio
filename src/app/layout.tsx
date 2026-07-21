import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthContext";
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
  title: "janjez.social — Pata Clout Chapchap",
  description: "Kenya's plug for instant social clout. Automated SMM panel for YouTube, WhatsApp, Instagram, Facebook, TikTok, Telegram, Google Maps, and X (Twitter). Lipa na M-Pesa.",
  keywords: ["SMM panel Kenya", "social media marketing", "M-Pesa", "YouTube views", "Instagram followers", "TikTok views", "janjez.social"],
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
      <body className="min-h-full flex flex-col bg-kenya-black text-kenya-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
