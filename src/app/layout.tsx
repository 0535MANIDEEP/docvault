import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import { AppHeader } from "@/components/AppHeader";
import { SessionProvider } from "@/components/SessionProvider";
import { getCurrentUser } from "@/lib/auth";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocVault — records with enforced access",
  description:
    "Document management with role-based access control enforced on both the UI and the API.",
};

/**
 * The shell reads the session cookie, so it cannot be prerendered into the
 * static shell. This opts the layout out of instant navigation and lets it
 * block on the server instead.
 */
export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider user={user} />
        <AppHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
