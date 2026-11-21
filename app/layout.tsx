import type { Metadata } from "next";
import { Space_Mono, Outfit } from "next/font/google";
const monoFont = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });
const displayFont = Outfit({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-display", display: "swap" });
import "./globals.css";
export const metadata: Metadata = {
  title: "P8 / TOPOLOGY — Cartographie Nmap (Metasploitable2)",
  description: "P8 — Cartographie des services réseau via Nmap et lookup CVE NVD. Cible locale autorisée, 9 tests mocks.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr" className={`${monoFont.variable} ${displayFont.variable}`}><body>{children}</body></html>;
}
