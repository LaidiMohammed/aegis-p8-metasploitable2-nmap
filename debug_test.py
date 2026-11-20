import sys
sys.path.insert(0, r'C:\Users\pc\Documents\M1\IACS\Project_EthicalHacking\aegis-p8-metasploitable2-nmap')

from unittest.mock import patch
from src import metasploitable2_nmap_main as m

# Test 1: patch object method
print("=== Test 1: patch.object(m.requests, 'get') ===")
with patch.object(m.requests, 'get') as rg:
    rg.return_value.status_code = 200
    rg.return_value.json = lambda: {
        'vulnerabilities': [{
            'cve': {
                'id': 'CVE-2021-28926',
                'publishedDate': '2021-05-07',
                'descriptions': [{'value': 'RCE dans vsftpd'}],
                'metrics': {
                    'cvssMetricV31': [{'cvssData': {'baseScore': 7.5, 'baseSeverity': 'HIGH'}}]
                }
            }
        }]
    }
    out = m.nvd_cves_by_keyword('vsftpd', '2.3.4')
    print('CVE:', out[0]['cve_id'] if out else 'NO RESULTS')

# Test 2: patch string
print("\n=== Test 2: patch('requests.get') ===")
with patch('requests.get') as rg:
    rg.return_value.status_code = 200
    rg.return_value.json = lambda: {
        'vulnerabilities': [{
            'cve': {
                'id': 'CVE-2021-28926',
                'publishedDate': '2021-05-07',
                'descriptions': [{'value': 'RCE dans vsftpd'}],
                'metrics': {
                    'cvssMetricV31': [{'cvssData': {'baseScore': 7.5, 'baseSeverity': 'HIGH'}}]
                }
            }
        }]
    }
    out = m.nvd_cves_by_keyword('vsftpd', '2.3.4')
    print('CVE:', out[0]['cve_id'] if out else 'NO RESULTS')

# Test 3: What does the function actually see?
print("\n=== Test 3: direct call without mock ===")
out = m.nvd_cves_by_keyword('vsftpd', '2.3.4')
print('CVE (real):', out[0]['cve_id'] if out else 'NO RESULTS')