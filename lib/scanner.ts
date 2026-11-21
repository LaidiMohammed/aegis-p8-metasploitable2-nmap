/**
 * P5 — Scanner TCP réel (Node net) + détection service + correspondance CVE.
 * Aucune dépendance externe. Le scan est une vraie tentative de connexion TCP.
 *
 * ÉTHIQUE : ne scannez que des cibles que vous possédez ou pour lesquelles vous
 * avez une autorisation écrite. Le site l'indique clairement.
 */
import net from "node:net";

export interface PortResult {
  port: number;
  open: boolean;
  service: string;
  banner: string;
  product: string;
  version: string;
  response_ms: number;
}

const PORT_SERVICES: Record<number, string> = {
  21: "ftp", 22: "ssh", 53: "dns", 80: "http", 110: "pop3", 143: "imap",
  443: "https", 445: "smb", 993: "imaps", 995: "pop3s", 1433: "mssql",
  1521: "oracle", 3306: "mysql", 3389: "rdp", 5432: "postgresql", 5900: "vnc",
  6379: "redis", 8080: "http-alt", 8443: "https-alt", 27017: "mongodb",
};

const DEFAULT_PORTS = Object.keys(PORT_SERVICES).map(Number);

const CVE_DB: Record<string, Array<{ cve: string; cvss: number; severity: string; note: string }>> = {
  ftp: [{ cve: "CVE-2011-2523", cvss: 10.0, severity: "CRITICAL", note: "vsftpd 2.3.4 backdoor" }],
  ssh: [{ cve: "CVE-2008-0166", cvss: 5.0, severity: "MEDIUM", note: "OpenSSH weak keygen" }],
  http: [{ cve: "CVE-2021-41773", cvss: 7.5, severity: "HIGH", note: "Apache path traversal" }],
  https: [{ cve: "CVE-2021-41773", cvss: 7.5, severity: "HIGH", note: "Apache path traversal" }],
  smb: [{ cve: "CVE-2007-2447", cvss: 10.0, severity: "CRITICAL", note: "Samba trans2open RCE" }],
  mysql: [{ cve: "CVE-2009-4484", cvss: 4.0, severity: "MEDIUM", note: "MySQL protocol" }],
  postgresql: [{ cve: "CVE-2019-10164", cvss: 9.8, severity: "CRITICAL", note: "PostgreSQL RCE" }],
  redis: [{ cve: "CVE-2022-0543", cvss: 10.0, severity: "CRITICAL", note: "Redis Lua sandbox escape" }],
  mongodb: [{ cve: "CVE-2019-2391", cvss: 6.5, severity: "MEDIUM", note: "MongoDB auth" }],
  rdp: [{ cve: "CVE-2019-0708", cvss: 9.8, severity: "CRITICAL", note: "BlueKeep" }],
};

/** Tente une connexion TCP. Résout true si le port est ouvert. */
export function tryConnect(host: string, port: number, timeoutMs = 1500): Promise<{ open: boolean; ms: number; banner: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let banner = "";
    let done = false;
    const finish = (open: boolean) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve({ open, ms: Date.now() - start, banner });
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      // Tentative de bannière : envoyer une requête HTTP minimale pour les ports web
      const isWeb = port === 80 || port === 8080 || port === 443 || port === 8443;
      if (isWeb) {
        socket.write("HEAD / HTTP/1.0\r\nHost: " + host + "\r\n\r\n");
      }
      socket.once("data", (d) => {
        banner = d.toString("utf-8").split("\r\n")[0].slice(0, 120);
        finish(true);
      });
      socket.once("timeout", () => finish(true)); // connecté mais pas de bannière
      setTimeout(() => finish(true), 400);
    });
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

function detectProduct(banner: string, port: number): { product: string; version: string } {
  const b = banner.toLowerCase();
  const m = banner.match(/Server:\s*([^\r\n]+)/i);
  if (m) {
    const parts = m[1].trim().split(/\s+/);
    const product = parts[0] || "http";
    const version = parts[1] || "";
    return { product, version };
  }
  if (b.includes("ssh")) return { product: "OpenSSH", version: (banner.match(/ssh-([\d.]+)/i) || [])[1] || "" };
  if (b.includes("ftp")) return { product: "vsftpd", version: (banner.match(/[\d.]+/) || [])[0] || "" };
  return { product: "", version: "" };
}

/** Scan réel d'une liste de ports. */
export async function scanHost(host: string, ports: number[] = DEFAULT_PORTS): Promise<PortResult[]> {
  const results: PortResult[] = [];
  // scan séquentiel léger pour rester dans les limites serverless
  for (const port of ports) {
    const r = await tryConnect(host, port);
    const { product, version } = r.open ? detectProduct(r.banner, port) : { product: "", version: "" };
    results.push({
      port,
      open: r.open,
      service: PORT_SERVICES[port] || "unknown",
      banner: r.banner,
      product,
      version,
      response_ms: r.ms,
    });
  }
  return results;
}

export function matchCves(results: PortResult[]) {
  const cves: Array<{ port: number; service: string; cve: string; cvss: number; severity: string; note: string }> = [];
  for (const r of results) {
    if (!r.open) continue;
    for (const c of CVE_DB[r.service] || []) {
      cves.push({ port: r.port, service: r.service, ...c });
    }
  }
  return cves.sort((a, b) => b.cvss - a.cvss);
}
