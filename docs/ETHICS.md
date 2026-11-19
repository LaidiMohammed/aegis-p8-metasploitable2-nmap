# ETHICS — P8 — Cartographie des services Nmap (Metasploitable2) (AEGIS)

Engagements éthiques du projet — stand-alone, labo local, GPU refused, anti-cloud.

- **Cible** : [AEGIS Cartographie des services Nmap (Metasploitable2)](https://github.com/LaidiMohammed/aegis-p8-metasploitable2-nmap)
- **Périmètre** : [AEGIS Cartographie des services Nmap (Metasploitable2)](https://aegis-p8-metasploitable2-nmap.vercel.app) — smoke + fonctions CLI.
- **GPU refused** : implementation uniquement CPU/pure Python.
- **Données locales** : sources acceptées : labo local (localhost, Juice Shop, DVWA, etc.).
- **Smoke au prof** : cmds à exécuter — voir README/scripts/run_smoke.sh.
- **Smoke clé de validation** : voir `smoke()` dans `src/metasploitable2_nmap_main.py` — doit retourner `{"ok": true, ...}`.
- **Site statique Vercel** : disponible pour la démo statique (smoke uniquement).

See SPEC.md (avec use cases + tableaux attendus).
