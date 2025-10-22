import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import UserProvider from "@/contexts/UserContext";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premier Talent Agency - Celebrity Booking Platform",
  description: "Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.",
  keywords: [
    "celebrity booking",
    "talent agency",
    "celebrity appearances",
    "event planning",
    "celebrity meet and greet",
    "private events",
    "corporate events",
    "celebrity entertainment",
    "A-list celebrities",
    "musicians booking",
    "influencer booking"
  ],
  authors: [{ name: "Premier Talent Agency" }],
  creator: "Premier Talent Agency",
  publisher: "Premier Talent Agency",
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
    locale: "en_US",
    url: "https://premiertalentagency.com",
    siteName: "Premier Talent Agency",
    title: "Premier Talent Agency - Celebrity Booking Platform",
    description: "Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Premier Talent Agency Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premier Talent Agency - Celebrity Booking Platform",
    description: "Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.",
    images: ["/logo.png"],
    creator: "@PremierTalentAgency",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
