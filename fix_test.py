from pathlib import Path
p = Path(r'C:\Users\pc\Documents\M1\IACS\Project_EthicalHacking\aegis-p8-metasploitable2-nmap\tests\test_vuln_audit.py')
t = p.read_text(encoding='utf-8')
lines = t.splitlines()

# New test_nvd_cves_by_keyword_mock block
new_block = """def test_nvd_cves_by_keyword_mock():
    with patch.object(m.requests, "get") as rg:
        rg.return_value.status_code = 200
        rg.return_value.json = lambda: {
            "vulnerabilities": [
                {
                    "cve": {
                        "id": "CVE-2021-28926",
                        "publishedDate": "2021-05-07",
                        "descriptions": [{"value": "RCE dans vsftpd"}],
                        "metrics": {
                            "cvssMetricV31": [
                                {"cvssData": {"baseScore": 7.5, "baseSeverity": "HIGH"}}
                            ]
                        }
                    }
                }
            ]
        }
    out = m.nvd_cves_by_keyword("vsftpd", "2.3.4")
    assert out[0]["cve_id"] == "CVE-2021-28926"
    assert out[0]["cvss"] == 7.5

"""

# Replace lines 44-52 (1-indexed) -> indices 43-51
# Keep lines 0-42, insert new_block, keep lines 52+
new_lines = lines[:43] + [new_block] + lines[52:]

# Check if the old line 50 (index 49) was the problematic one
# The old line 52 starts after the replaced section

p.write_text("\n".join(new_lines), encoding="utf-8")
print("Rewrote test file, lines:", len(new_lines))

# Verify the fix
t2 = p.read_text(encoding='utf-8')
for i, line in enumerate(t2.splitlines(), 1):
    if 'cvssMetricV31' in line:
        print(f"Line {i}: {repr(line[-20:])}")
        break