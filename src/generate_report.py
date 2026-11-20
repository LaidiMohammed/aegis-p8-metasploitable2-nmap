"""generate_report.py — Génère le PDF du rapport P8 — Cartographie Nmap (AEGIS).

Contenu : services découverts, CVEs NVD, score de risque, recommandations.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def build_markdown(data: dict) -> str:
    summary = data.get("summary", {})
    services = data.get("services", [])
    cves = data.get("cves", [])

    lines = [
        "# P8 — Cartographie des services réseau (Nmap / Metasploitable2) — AEGIS",
        "",
        f"- **Cible :** {summary.get('target', '-')}",
        f"- **Nmap :** {summary.get('nmap_binary', 'n/a')}",
        f"- **Services découverts :** {summary.get('n_services', 0)}",
        f"- **CVEs NVD :** {summary.get('n_cves', 0)}",
        f"- **Sévérités :** {summary.get('severities', {})}",
        "",
        "## 1. Services exposés (tableau Nmap)",
        "",
        "| Port | Proto | Service | Product | Version |",
        "|---|---|---|---|---|",
    ]
    for s in services[:30]:
        lines.append(f"| {s.get('port', '-')} | {s.get('protocol', '-')} | {s.get('service', '-')} | "
                     f"{s.get('product', '-')} | {s.get('version', '-')} |")
    if not services:
        lines.append("- Aucun service détecté (scan mock ou nmap indisponible).")

    lines += [
        "",
        "## 2. CVEs NVD (CVE ID | CVSS | Severity | Published | Description)",
        "",
        "| CVE | CVSS | Severity | Published | Description |",
        "|---|---|---|---|---|",
    ]
    for c in cves[:25]:
        lines.append(f"| {c.get('cve_id', '-')} | {c.get('cvss', '-')} | "
                     f"{c.get('severity', '-')} | {c.get('published', '-')} | "
                     f"{c.get('description', '')[:80]} |")
    if not cves:
        lines.append("- Aucun CVE trouvé (nmap indisponible ou aucun service avec product/version).")

    lines += [
        "",
        "## 3. Top CVE (critiques)",
        "",
    ]
    for c in summary.get("top_cves", [])[:5]:
        lines.append(f"- **{c.get('cve_id', '-')}** — CVSS {c.get('cvss', '-')} "
                     f"({c.get('severity', '-')}) — {c.get('description', '')[:100]}")
    if not summary.get("top_cves"):
        lines.append("- Aucun CVE critique à afficher.")

    lines += [
        "",
        "## 4. Recommandations",
        "- Désactiver les services inutiles (vsftpd, SMB si non requis).",
        "- Appliquer les correctifs CVE sur les services exposés.",
        "- Restreindre l'accès aux ports sensibles (445/SMB, 21/FTP) par pare-feu.",
        "- Mettre à jour vsftpd (vulnérable à la backdoor).",
        "",
        f"## 5. Exécutions à montrer au prof :",
        f"- `python -m src.metasploitable2_nmap_main --target 127.0.0.1 --host-nmap 192.168.56.101 --save-json outputs/results.json --pdf outputs/rapport-p8.pdf`",
        f"- `python -m src.metasploitable2_nmap_main --mock-audit --save-json outputs/results.json --pdf outputs/rapport-p8-mock.pdf`",
    ]
    return "\n".join(lines)


def build_pdf(markdown: str, out_path: Path) -> None:
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    def esc(t: str) -> str:
        return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(out_path), pagesize=LETTER, topMargin=0.5 * inch,
                            bottomMargin=0.5 * inch, leftMargin=0.75 * inch, rightMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    story = []
    for line in markdown.split("\n"):
        if not line.strip():
            story.append(Spacer(1, 6))
            continue
        if line.startswith("# "):
            story.append(Paragraph(esc(line[2:]), styles["h1"]))
        elif line.startswith("## "):
            story.append(Paragraph(esc(line[3:]), styles["h2"]))
        else:
            story.append(Paragraph(esc(line), styles["Normal"]))
    doc.build(story)
    print(f"[OK] PDF écrit : {out_path} ({out_path.stat().st_size} octets)")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generate_report", description="Génère le rapport P8 — Cartographie Nmap")
    ap.add_argument("--json", type=Path, default=None, help="Fichier JSON du résultat de nmap scan")
    ap.add_argument("--pdf", type=Path, default=Path("outputs/rapport-p8.pdf"),
                    help="Chemin du PDF")
    args = ap.parse_args(argv)
    data = json.loads(args.json.read_text(encoding="utf-8")) if args.json else {
        "summary": {"target": "n/a", "nmap_binary": "n/a", "n_services": 0, "n_cves": 0, "severities": {}},
        "services": [], "cves": []}
    md = build_markdown(data)
    args.pdf.parent.mkdir(parents=True, exist_ok=True)
    (args.pdf.parent / "report.md").write_text(md, encoding="utf-8")
    build_pdf(md, args.pdf)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
