import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "P8 / TOPOLOGY — Cartographie Nmap (Metasploitable2)",
  description: "P8 — Cartographie des services réseau via Nmap et lookup CVE NVD. Cible locale autorisée, 9 tests mocks.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
