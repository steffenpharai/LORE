import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LORE MACHINE",
  description: "Decentralized collaborative lore generator for Base/Farcaster tokens",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
