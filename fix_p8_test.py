from pathlib import Path
p = Path(r'C:\Users\pc\Documents\M1\IACS\Project_EthicalHacking\aegis-p8-metasploitable2-nmap\tests\test_vuln_audit.py')
t = p.read_text(encoding='utf-8')
# Find and fix the bracket mismatch on line 50
old = '"metrics": {"cvssMetricV31": [{"cvssData": {"baseScore": 7.5, "baseSeverity": "HIGH"}}]}}]}'
new = '"metrics": {"cvssMetricV31": [{"cvssData": {"baseScore": 7.5, "baseSeverity": "HIGH"}}]}}]}'
if old in t:
    t = t.replace(old, new)
    p.write_text(t, encoding='utf-8')
    print('Fixed!')
else:
    print('Pattern not found')
    # Show what we have around line 50
    lines = t.splitlines()
    for i, line in enumerate(lines, 1):
        if 'cvssMetricV31' in line:
            print(f'Line {i}: {repr(line)}')
