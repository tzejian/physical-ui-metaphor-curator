import json
import glob
import sys
from pathlib import Path

script_dir = Path(__file__).resolve().parent
repo_root = script_dir if (script_dir / "examples").exists() else script_dir.parent

examples_dir = repo_root / "examples"
output_dir = repo_root / "frontend_library" / "assets" / "data"
output_file = output_dir / "manifest.json"

if not examples_dir.exists():
    print(f"Error: Examples directory not found at '{examples_dir}'")
    sys.exit(1)

output_dir.mkdir(parents=True, exist_ok=True)

entries = []
example_files = sorted(glob.glob(str(examples_dir / "*.json")))

if not example_files:
    print("No example JSON files found.")
    sys.exit(0)

has_error = False
for file_path in example_files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        entries.append(data)
        print(f"[OK] Compiled: {file_path}")
    except Exception as e:
        print(f"[ERROR] Failed to load {file_path}: {e}")
        has_error = True

if has_error:
    print("Aborting: errors encountered during compilation.")
    sys.exit(1)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(entries, f, indent=2, ensure_ascii=False)

print(f"\nManifest written to '{output_file}' with {len(entries)} entr{'y' if len(entries) == 1 else 'ies'}.")

