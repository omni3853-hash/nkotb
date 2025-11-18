import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import UserProvider from "@/contexts/UserContext";
import { SupportFloatingButton } from "@/components/support/SupportFloatingButton";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nkotb.com'),
  title: "NKOTB - New Kids On The Block",
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
  authors: [{ name: "NKOTB" }],
  creator: "NKOTB",
  publisher: "NKOTB",
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
    url: "https://nkotb.com",
    siteName: "NKOTB",
    title: "NKOTB - New Kids On The Block",
    description: "Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "NKOTB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NKOTB - New Kids On The Block",
    description: "Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.",
    images: ["/logo.png"],
    creator: "@nkotb",
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
      <body className={`${anton.variable} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
        <SupportFloatingButton />
      </body>
    </html>
  );
}
