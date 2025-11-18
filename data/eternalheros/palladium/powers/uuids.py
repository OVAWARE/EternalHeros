import json
import uuid
import sys
from pathlib import Path

def add_missing_uuids(input_file, output_file):
    # Load JSON data
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Check abilities
    if "abilities" in data and isinstance(data["abilities"], dict):
        for ability_name, ability_data in data["abilities"].items():
            if (
                isinstance(ability_data, dict) 
                and ability_data.get("type") == "palladium:attribute_modifier"
            ):
                # Add UUID if missing
                if "uuid" not in ability_data:
                    ability_data["uuid"] = str(uuid.uuid4())

    # Save modified data
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_uuids.py <input.json> <output.json>")
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    add_missing_uuids(input_file, output_file)
    print(f"Processed {input_file} -> {output_file}")
