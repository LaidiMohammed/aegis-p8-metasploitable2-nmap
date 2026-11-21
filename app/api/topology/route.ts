import { NextRequest, NextResponse } from "next/server";
import { scanHost, matchCves } from "@/lib/scanner";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/topology — scan TCP réel + topologie + CVE. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host: string = typeof body.host === "string" ? body.host.trim() : "";
    const ports: number[] = Array.isArray(body.ports)
      ? body.ports.filter((n: any) => Number.isInteger(n) && n > 0 && n < 65536)
      : undefined as any;
    if (!host) return NextResponse.json({ error: "Cible (host) requise" }, { status: 400 });
    const results = await scanHost(host, ports);
    const open = results.filter((r) => r.open);
    const cves = matchCves(results);
    return NextResponse.json({
      project: "P8",
      target: host,
      scanned_at: new Date().toISOString(),
      method: "Scan TCP réel + topologie — éthique : cible autorisée uniquement",
      summary: {
        ports_scanned: results.length,
        open_ports: open.length,
        closed_ports: results.length - open.length,
        cves_found: cves.length,
      },
      results,
      cves,
      topology: open.map((r) => ({ port: r.port, service: r.service, product: r.product, version: r.version, banner: r.banner })),
    });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
