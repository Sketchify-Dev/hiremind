import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#05070d",
};

export const metadata: Metadata = {
  title: {
    default: "HireMind: pay an agent, get a brief, keep the receipt",
    template: "%s · HireMind",
  },
  description:
    "HireMind is a pay-per-brief marketplace on the OpenServ agent network. Pay 0.01 KITE on Kite testnet, get a research brief plus a verifiable on-chain receipt. Built for SERV Hackathon 02, Open Track.",
  openGraph: {
    title: "HireMind: pay an agent, get a brief, keep the receipt",
    description:
      "A seller agent writes research briefs for 0.01 KITE a piece. You pay on-chain, the payment is verified, the brief is delivered with a receipt.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HireMind: pay an agent, get a brief, keep the receipt",
    description:
      "Pay 0.01 KITE on Kite testnet, get a research brief plus a verifiable on-chain receipt.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
