import json
import glob
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("jsonschema library not found. Install with: pip install jsonschema")
    sys.exit(1)

schema_path = Path("schemas/entry.schema.json")
if not schema_path.exists():
    print(f"Error: Schema file not found at {schema_path}")
    sys.exit(1)

with open(schema_path, "r", encoding="utf-8") as f:
    schema = json.load(f)

example_files = glob.glob("examples/*.json")
if not example_files:
    print("No examples found to validate.")
    sys.exit(0)

has_error = False
for file_path in example_files:
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            jsonschema.validate(instance=data, schema=schema)
            print(f"[OK] {file_path} is valid.")
        except jsonschema.exceptions.ValidationError as e:
            print(f"[ERROR] {file_path} failed validation: {e.message}")
            has_error = True
        except Exception as e:
            print(f"[ERROR] {file_path} parse failed: {e}")
            has_error = True

if has_error:
    sys.exit(1)
print("All reference entries valid.")

