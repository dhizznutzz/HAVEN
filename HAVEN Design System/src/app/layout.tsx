import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tumbuh — Grow Together",
  description:
    "A youth-focused AI-powered social platform for Malaysia. Skill development, community, mental health — all in one place.",
  keywords: ["youth", "Malaysia", "skills", "mental health", "community"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="md:pt-14 pb-16 md:pb-0">{children}</main>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
