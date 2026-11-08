import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import "./hm.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--hm-font",
});

// No custom domain yet. When one exists, replace this in layout.tsx,
// app/robots.ts, app/sitemap.ts, and public/llms.txt.
const SITE_URL = "https://hiremind.example.com";

export const viewport: Viewport = {
  themeColor: "#dfdedb",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HireMind: pay an agent, get a brief, keep the receipt",
    template: "%s · HireMind",
  },
  description:
    "HireMind is a pay-per-brief marketplace on the OpenServ agent network. Pay 0.01 KITE on Kite testnet, get a research brief plus a verifiable on-chain receipt. Built for SERV Hackathon 02, Open Track.",
  category: "AI agents",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "HireMind: pay an agent, get a brief, keep the receipt",
    description:
      "A seller agent writes research briefs for 0.01 KITE a piece. You pay on-chain, the payment is verified, the brief is delivered with a receipt.",
    url: "/",
    siteName: "HireMind",
    type: "website",
    images: [{ url: "/hm-icon-512.png", width: 512, height: 512, alt: "HireMind mark, segmented blue H with a navy link bar" }],
  },
  twitter: {
    card: "summary",
    title: "HireMind: pay an agent, get a brief, keep the receipt",
    description:
      "Pay 0.01 KITE on Kite testnet, get a research brief plus a verifiable on-chain receipt.",
    images: ["/hm-icon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${bricolage.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
