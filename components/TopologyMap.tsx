"use client";
import { useState } from "react";

const NODES = [
  { x: 130, y: 90, label: "FTP", port: "21", svc: "vsftpd 2.3.4", cve: "CVE-2011-2523" },
  { x: 300, y: 60, label: "SSH", port: "22", svc: "OpenSSH 4.7p1", cve: "CVE-2008-0166" },
  { x: 470, y: 90, label: "HTTP", port: "80", svc: "Apache 2.2.8", cve: "CVE-2021-41773" },
  { x: 130, y: 250, label: "SMB", port: "445", svc: "Samba 3.0.20", cve: "CVE-2007-2447" },
  { x: 470, y: 250, label: "MYSQL", port: "3306", svc: "MySQL 5.0", cve: "CVE-2009-4484" },
];
const CX = 300, CY = 170;

export default function TopologyMap() {
  const [sel, setSel] = useState<number | null>(null);
  const node = sel !== null ? NODES[sel] : null;
  return (
    <div className="topo rounded-xl border border-edge bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="coord text-iris">topologie · 192.168.56.101</span>
        <span className="coord text-slate-500">5 services</span>
      </div>
      <svg viewBox="0 0 600 320" className="mt-2 w-full">
        {NODES.map((n,i)=><line key={`l${i}`} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={sel===i?"#a3e635":"#818cf8"} strokeWidth="1.5" className="link" opacity=".55" />)}
        <circle cx={CX} cy={CY} r="26" fill="#818cf8" opacity=".12" />
        <circle cx={CX} cy={CY} r="9" fill="#818cf8" />
        <text x={CX} y={CY+44} textAnchor="middle" fill="#c7d2fe" fontSize="11" fontFamily="Space Mono">METASPLOITABLE2</text>
        {NODES.map((n,i)=>(
          <g key={n.label} onClick={()=>setSel(i)} style={{cursor:"pointer"}} className="node">
            <circle cx={n.x} cy={n.y} r={sel===i?20:16} fill={sel===i?"#a3e635":"#818cf8"} opacity={sel===i?.95:.7} />
            <text x={n.x} y={n.y+4} textAnchor="middle" fill="#0a0a1f" fontSize="10" fontFamily="Space Mono" fontWeight="700">{n.port}</text>
            <text x={n.x} y={n.y-26} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="Space Mono">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 min-h-[56px] rounded-lg border border-edge bg-deep p-3 font-mono text-[11px]">
        {node ? (<>
          <div><span className="text-lime">▸ {node.label}</span> port {node.port} · <span className="text-iris">{node.svc}</span></div>
          <div className="mt-1 text-slate-400">CVE NVD : <span className="text-lime">{node.cve}</span></div>
        </>) : <span className="text-slate-500">Cliquez sur un nœud pour voir le service et sa CVE…</span>}
      </div>
      <button onClick={()=>setSel(null)} className="mt-4 w-full rounded-lg bg-iris px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-deep hover:bg-white">
        ↺ Réinitialiser la carte
      </button>
    </div>
  );
}
