#!/bin/bash
set -e
cd "$(dirname "$0")/.."
exec "$( [ -d .venv ] && echo .venv/bin/python || echo python3 )" "src/metasploitable2-nmap_main.py"
