import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";

import Header from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Document.UA | Інтелектуальний портал документів міської ради",
  description:
    "Сучасна платформа для пошуку та аналізу документів міської ради з AI-асистентом",
  keywords: [
    "міська рада",
    "документи",
    "рішення",
    "розпорядження",
    "AI пошук",
  ],
  authors: [{ name: "Міська рада" }],
  openGraph: {
    title: "Document.UA",
    description: "Інтелектуальний портал документів міської ради",
    type: "website",
    locale: "uk_UA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      {" "}
      <html lang="en">
        <head>
          {/* Preconnect для оптимізації */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body className="antialiased font-sans bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
          <Header />
          <Providers>
            <main className="relative">{children}</main>
          </Providers>
          <ScrollToTop />
        </body>
      </html>
    </ClerkProvider>
  );
}
