import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LORE MACHINE",
  description: "Decentralized collaborative lore generator for Base tokens. Transform meme momentum into canonical community IP.",
  manifest: "/manifest.json",
  openGraph: {
    title: "LORE MACHINE",
    description: "Decentralized collaborative lore generator for Base tokens. Submit, vote, and earn rewards as stories become canonical community IP.",
    url: "https://lore-base.vercel.app",
    siteName: "LORE MACHINE",
    images: [
      {
        url: "https://lore-base.vercel.app/hero.png",
        width: 1200,
        height: 630,
        alt: "LORE MACHINE",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LORE MACHINE",
    description: "Decentralized collaborative lore generator for Base tokens",
    images: ["https://lore-base.vercel.app/hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
