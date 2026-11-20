"""Module principal — P8 Cartographie des services Nmap (Metasploitable2) — AEGIS.

Fonctions smoke : main() -> sortie résumée pro (voir tests).
Point d'entrée pour l'IA/eur : main(argv) avec argparse clair.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import requests

USER_AGENT = "aegis-p8-metasploitable2-nmap/1.0.0 (+https://aegis-p8-metasploitable2-nmap.vercel.app)"
NVD_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"


def smoke(label: str, detail: str) -> dict[str, Any]:
    return {
        "project": "P8",
        "title": "Cartographie des services Nmap (Metasploitable2)",
        "label": label,
        "detail": detail,
        "ok": True,
    }


def nmap_scan_target(host: str, out_xml: Path, nmap_bin: str = "nmap", timeout: int = 120) -> str:
    """Exécute nmap -sV -p- sur la cible locale. Retourne le chemin du XML."""
    cmd = [shutil.which(nmap_bin) or nmap_bin, "-sV", "-p-", "-oX", str(out_xml), host]
    r = subprocess.run(cmd, timeout=timeout, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"nmap échec (code {r.returncode}) : {r.stderr[:200]}")
    return str(out_xml)


def parse_nmap_xml(xml_path: Path) -> list[dict[str, Any]]:
    """Parse le XML nmap et retourne une liste de services découverts."""
    out: list[dict[str, Any]] = []
    if not xml_path.exists():
        return out
    tree = ET.parse(xml_path)
    for host in tree.getroot().findall("host"):
        addr = host.find("address[@addrtype='ipv4']")
        if addr is None:
            continue
        hostname = addr.get("addr", "")
        for port in host.findall("ports/port"):
            entry: dict[str, Any] = {
                "host": hostname,
                "port": int(port.get("portid", "0")),
                "protocol": port.get("protocol", "tcp"),
                "service": "",
                "product": "",
                "version": "",
            }
            srv = port.find("service")
            if srv is not None:
                entry["service"] = srv.get("name", "")
                entry["product"] = srv.get("product", "")
                entry["version"] = srv.get("version", "")
            out.append(entry)
    return out


def nvd_cves_by_keyword(product: str, version: str, timeout: float = 8.0) -> list[dict[str, Any]]:
    """Interroge l'API NVD v2 (keywordSearch) pour un produit/version donné."""
    out: list[dict[str, Any]] = []
    if not product:
        return out
    query = f"{product} {version}".replace(" ", "+")
    try:
        r = requests.get(f"{NVD_URL}?keywordSearch={query}", timeout=timeout,
                         headers={"User-Agent": USER_AGENT})
        if r.status_code == 200:
            data = r.json()
            for v in data.get("vulnerabilities", [])[:20]:
                cve = v.get("cve", {})
                metrics = cve.get("metrics", {})
                cvss_data = None
                for key in ("cvssMetricV31", "cvssMetricV30"):
                    if metrics.get(key):
                        cvss_data = metrics[key][0].get("cvssData")
                        if cvss_data:
                            break
                out.append({
                    "cve_id": cve.get("id", ""),
                    "cvss": cvss_data.get("baseScore", "") if cvss_data else "",
                    "severity": cvss_data.get("baseSeverity", "") if cvss_data else "",
                    "published": cve.get("publishedDate", ""),
                    "description": (cve.get("descriptions", [{}])[0].get("value", "")[:160]
                                    if cve.get("descriptions") else ""),
                })
    except Exception:  # noqa: BLE001
        pass
    return out


def run_audit(host: str = "127.0.0.1", host_for_nmap: str = "192.168.56.101",
              mock: bool = False, nmap_bin: str = "nmap", timeout: float = 8.0) -> dict[str, Any]:
    """Audit complet : scan nmap + CVE NVD par service."""
    services: list[dict[str, Any]] = []
    out_xml = Path("nmap_output.xml")
    nmap_status = None

    if mock:
        services = [
            {"host": host_for_nmap, "port": 21, "protocol": "tcp", "service": "ftp",
             "product": "vsftpd", "version": "2.3.4"},
            {"host": host_for_nmap, "port": 22, "protocol": "tcp", "service": "ssh",
             "product": "OpenSSH", "version": "4.7p1"},
            {"host": host_for_nmap, "port": 80, "protocol": "tcp", "service": "http",
             "product": "Apache httpd", "version": "2.2.8"},
            {"host": host_for_nmap, "port": 445, "protocol": "tcp", "service": "smb",
             "product": "Samba", "version": "3.0.20"},
        ]
        nmap_status = "mock"
    else:
        nmap_status = "ok" if shutil.which(nmap_bin) else "nmap absente (installez-la)"
        if shutil.which(nmap_bin):
            try:
                nmap_scan_target(host_for_nmap, out_xml, nmap_bin=nmap_bin, timeout=int(timeout * 10))
                services = parse_nmap_xml(out_xml)
            except Exception as exc:  # noqa: BLE001
                nmap_status = f"erreur nmap : {exc}"
                services = []

    cves: list[dict[str, Any]] = []
    if not mock:
        for s in services:
            cves += nvd_cves_by_keyword(s.get("product", ""), s.get("version", ""), timeout=timeout)

    top = sorted([c for c in cves if c.get("cvss")],
                 key=lambda c: -(c.get("cvss") or 0))[:10]
    severities: dict[str, int] = {}
    for c in cves:
        sev = c.get("severity", "?")
        severities[sev] = severities.get(sev, 0) + 1

    summary = {
        "project": "P8",
        "target": host,
        "nmap_binary": nmap_status,
        "n_services": len(services),
        "n_cves": len(cves),
        "severities": severities,
        "top_cves": top[:5],
    }
    return {"project": "P8", "summary": summary, "services": services, "cves": cves}


def main(argv: list[str] | None = None) -> int:
    import sys

    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    ap = argparse.ArgumentParser(prog="metasploitable2_nmap",
                                 description="AEGIS - P8 - Cartographie services Nmap")
    ap.add_argument("--target", default="127.0.0.1", help="Cible (host IP)")
    ap.add_argument("--host-nmap", default="192.168.56.101", help="Host à scanner nmap")
    ap.add_argument("--save-json", default=None, help="Écrire le résultat JSON")
    ap.add_argument("--pdf", default="outputs/rapport-p8.pdf", help="Chemin du PDF")
    ap.add_argument("--mock-audit", action="store_true", help="Scan mock (pas de nmap)")
    ap.add_argument("--json", action="store_true", help="Sortir en JSON")
    args = ap.parse_args(argv)

    try:
        out = run_audit(args.target, args.host_nmap, mock=args.mock_audit)
    except Exception as exc:  # noqa: BLE001
        print(f"[ERREUR] {exc}")
        return 1

    if args.save_json:
        p = Path(args.save_json)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[OK] écriture : {p}")

    if args.json:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        s = out["summary"]
        print(f"[SUMMARY] target={args.target} services={s['n_services']} cves={s['n_cves']}")
        print(f"  nmap: {s['nmap_binary']}  severités: {s['severities']}")
        for c in s.get("top_cves", [])[:5]:
            print(f"  {c.get('cve_id', '?')} CVSS={c.get('cvss', '-')} {c.get('severity', '-')}")

    if args.save_json and args.pdf:
        from src.generate_report import main as gen_main
        rc = gen_main(["--json", args.save_json, "--pdf", args.pdf])
        if rc != 0:
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())