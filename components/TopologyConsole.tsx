"use client";
import { useState } from "react";

interface PortResult { port: number; open: boolean; service: string; banner: string; product: string; version: string; response_ms: number; }
interface Report {
  project: string; target: string; scanned_at: string; method: string;
  summary: { ports_scanned: number; open_ports: number; closed_ports: number; cves_found: number };
  results: PortResult[]; topology: any[];
  cves: Array<{ port: number; service: string; cve: string; cvss: number; severity: string; note: string }>;
}

const COMMON = [21, 22, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 27017];

export default function TopologyConsole() {
  const [host, setHost] = useState("example.com");
  const [ports, setPorts] = useState<number[]>([21, 22, 80, 443, 445, 3306, 8080]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(p: number) { setPorts((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p])); }

  async function launch() {
    if (!host.trim()) return;
    setLoading(true); setReport(null);
    try {
      const res = await fetch("/api/topology", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim(), ports }),
      });
      setReport(await res.json());
    } catch { setReport(null); } finally { setLoading(false); }
  }

  const open = report?.results.filter((r) => r.open) || [];

  return (
    <div className="bracket cut-card scanlines overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-signal" /><span className="h-2.5 w-2.5 rounded-full bg-amber" /><span className="h-2.5 w-2.5 rounded-full bg-cyan" />
          <span className="ml-3 font-mono text-xs text-mist">POST /api/topology — scan réel</span>
        </div>
        <span className="tag text-slate-500">node:net</span>
      </div>
      <div className="p-5">
        <label className="tag mb-2 block text-cyan">Cible</label>
        <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="ex. 192.168.56.101"
          className="w-full border border-slate-700 bg-black/40 p-3 font-mono text-[12px] text-slate-200 outline-none focus:border-cyan" />
        <label className="tag mb-2 mt-4 block text-cyan">Ports</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON.map((p) => (
            <button key={p} onClick={() => toggle(p)}
              className={`border px-2 py-1 font-mono text-[10px] transition ${ports.includes(p) ? "border-cyan bg-cyan/15 text-cyan" : "border-slate-700 text-slate-500"}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={launch} disabled={loading || !host.trim()}
          className="mt-5 w-full bg-signal px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-ink disabled:opacity-50"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
          {loading ? "Scan…" : "▶ Scanner la cible"}
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-600">Éthique : cible possédée / autorisée uniquement.</p>

        {report && (
          <div className="mt-5 border-t border-slate-700/50 pt-4">
            <div className="mb-3 font-mono text-sm text-slate-300">
              [SUMMARY] {report.target} — {report.summary.open_ports}/{report.summary.ports_scanned} ouverts · {report.summary.cves_found} CVE
            </div>
            <svg viewBox="0 0 600 240" className="w-full">
              {open.map((r, i) => {
                const x = 60 + (i * 90) % 480; const y = 60 + Math.floor((i * 90) / 480) * 100;
                return (
                  <g key={r.port}>
                    <line x1={300} y1={120} x2={x} y2={y} stroke="#4f46e5" strokeWidth="1.5" opacity=".6" />
                    <circle cx={x} cy={y} r="20" fill="#4f46e5" opacity=".85" />
                    <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">{r.port}</text>
                    <text x={x} y={y - 26} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace">{r.service}</text>
                  </g>
                );
              })}
              <circle cx={300} cy={120} r="10" fill="#f59e0b" />
              <text x={300} y={150} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace">{report.target}</text>
            </svg>
            <div className="mt-3 space-y-1">
              {report.results.map((r) => (
                <div key={r.port} className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 px-3 py-1.5 font-mono text-[11px] ${r.open ? "border-emerald-400 bg-emerald-500/5" : "border-slate-700"}`}>
                  <span className={r.open ? "text-emerald-400" : "text-slate-600"}>{r.port}</span>
                  <span className="text-slate-400">{r.service}</span>
                  <span>{r.open ? "OPEN" : "closed"}</span>
                  {r.banner && <span className="text-amber">"{r.banner}"</span>}
                </div>
              ))}
            </div>
            {report.cves.length > 0 && (
              <div className="mt-3 space-y-1">
                {report.cves.map((c) => (
                  <div key={c.cve} className="flex flex-wrap items-center gap-x-3 border-l-2 border-signal bg-signal/5 px-3 py-1.5 font-mono text-[11px]">
                    <span className="text-signal">{c.cve}</span><span className="text-amber">CVSS {c.cvss}</span><span className="text-slate-400">{c.service}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
