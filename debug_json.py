import sys
sys.path.insert(0, r'C:\Users\pc\Documents\M1\IACS\Project_EthicalHacking\aegis-p8-metasploitable2-nmap')
from src import metasploitable2_nmap_main as m
import json, io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    rc = m.main(['--json'])
data = json.loads(buf.getvalue())
print('keys:', list(data.keys()))
print('project:', data.get('project'))