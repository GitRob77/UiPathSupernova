import type { Metadata } from "next";
import { Noto_Sans, Inconsolata } from "next/font/google";
import { NavWidget } from "@/components/app-specific/nav-widget";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
});

export const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "Apollo Prime",
  description: "Prototype playground for apollo-wind components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body className={`${notoSans.className} ${inconsolata.variable} light studio antialiased`}>{children}<NavWidget /></body></html>
  );
}
