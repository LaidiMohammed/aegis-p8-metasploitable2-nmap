"""Tests unitaires — P8 Cartographie Nmap (mocks — sans shell).

- parse_nmap_xml : parse XML nmap → liste de services
- nvd_cves_by_keyword : mock requests.get → CVE list
- run_audit : mock nmap + structure (summary/services/cves)
- generate_report : md + pdf
- main : smoke — exit 0
"""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src import metasploitable2_nmap_main as m
from src import generate_report as rep

XML_SAMPLE = """<nmaprun>
  <host>
    <address addr="192.168.56.101" addrtype="ipv4"/>
    <ports>
      <port portid="21" protocol="tcp"><service name="ftp" product="vsftpd" version="2.3.4"/></port>
      <port portid="22" protocol="tcp"><service name="ssh" product="OpenSSH" version="4.7p1"/></port>
      <port portid="80" protocol="tcp"><service name="http" product="Apache httpd" version="2.2.8"/></port>
    </ports>
  </host>
</nmaprun>"""


def test_parse_nmap_xml_mock(tmp_path):
    f = tmp_path / "scan.xml"
    f.write_text(XML_SAMPLE, encoding="utf-8")
    out = m.parse_nmap_xml(f)
    assert len(out) == 3
    assert out[0]["port"] == 21 and out[0]["product"] == "vsftpd"
    assert out[1]["port"] == 22 and out[0]["service"] == "ftp"


def test_nvd_cves_by_keyword_mock(monkeypatch):
    def mock_get(*args, **kwargs):
        class MockResponse:
            status_code = 200
            def json(self):
                return {
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
        return MockResponse()
    
    monkeypatch.setattr(m.requests, "get", mock_get)
    out = m.nvd_cves_by_keyword("vsftpd", "2.3.4")
    assert out[0]["cve_id"] == "CVE-2021-28926"
    assert out[0]["cvss"] == 7.5


def test_run_audit_mock_structure():
    out = m.run_audit("127.0.0.1", host_for_nmap="192.168.56.101", mock=True)
    assert set(out.keys()) == {"project", "summary", "services", "cves"}
    assert out["summary"]["n_services"] == 4
    assert out["summary"]["nmap_binary"] == "mock"


def test_run_audit_full_mock():
    out = m.run_audit("127.0.0.1", host_for_nmap="192.168.56.101", mock=True)
    services = out["services"]
    assert any(s["product"] == "vsftpd" for s in services)
    assert any(s["port"] == 445 for s in services)


def test_generate_report_produces_files(tmp_path):
    data = {"summary": {"target": "127.0.0.1", "nmap_binary": "mock", "n_services": 2,
                        "n_cves": 1, "severities": {}},
            "services": [{"port": 80, "service": "http", "product": "Apache httpd", "version": "2.2.8"}],
            "cves": [{"cve_id": "CVE-2021-28926", "cvss": 7.5, "severity": "HIGH",
                      "published": "2021-05-07", "description": "RCE"}]}
    md = rep.build_markdown(data)
    assert "CVE-2021-28926" in md
    out = tmp_path / "r.pdf"
    rep.build_pdf(md, out)
    assert out.exists() and out.stat().st_size > 400


def test_main_smoke(tmp_path):
    f = tmp_path / "scan.xml"
    f.write_text(XML_SAMPLE, encoding="utf-8")
    assert m.main(["--mock-audit"]) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-q"])