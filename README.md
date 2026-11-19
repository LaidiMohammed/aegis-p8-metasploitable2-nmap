# AEGIS — P8 — Cartographie des services Nmap (Metasploitable2)

[![Vercel](https://img.shields.io/badge/Vercel-aegis-p8--blue?logo=vercel)](https://aegis-p8-metasploitable2-nmap.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-passing-brightgreen)]

Cartographie des services Nmap (Metasploitable2) — PFE P13 style AEGIS (Master 1 Sécurité informatique).

## Infos rapides

| Élément | Valeur |
|---|---|
| **GitHub** | https://github.com/LaidiMohammed/aegis-p8-metasploitable2-nmap |
| **Vercel** | https://aegis-p8-metasploitable2-nmap.vercel.app |
| **Stacks** | nmap CLI, python-nmap, reportlab |
| **Type** | pen |
| **Ethique** | Labo local, anti-GPU, anti-cloud, stand-alone |

## Install

```bash
pip install -r requirements.txt
make install  # (venv)
```

## Smoke & tests (démo à la prof)

```bash
make smoke   # ou: scripts/run_smoke.sh
make test
```

## Fonctions à exécuter à la démo

Voir [`docs/ETHICS.md`](docs/ETHICS.md), [`docs/SPEC.md`](docs/SPEC.md).
