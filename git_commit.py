import subprocess
import os

repo_dir = r'C:\Users\pc\Documents\M1\IACS\Project_EthicalHacking\aegis-p8-metasploitable2-nmap'

# Reset all changes
subprocess.run(['git', 'reset', 'HEAD', '--', '.'], cwd=repo_dir, capture_output=True, text=True)

# Add all intended files (excluding debug files)
files_to_add = [
    'src/metasploitable2_nmap_main.py',
    'src/generate_report.py', 
    'tests/test_vuln_audit.py',
]
for f in files_to_add:
    full_path = os.path.join(repo_dir, f)
    if os.path.exists(full_path):
        subprocess.run(['git', 'add', f], cwd=repo_dir, capture_output=True, text=True)
        print(f"Added: {f}")

# Commit
result = subprocess.run(['git', 'commit', '-m', 'feat(P8): nmap cartographie Metasploitable2 (AEGIS P8)'], 
                       cwd=repo_dir, capture_output=True, text=True)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)