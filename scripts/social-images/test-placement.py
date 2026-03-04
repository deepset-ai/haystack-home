"""
Visual placement test for social image text fields.

Generates an image with the configured text AND draws a colored bounding box
around each field so you can see exactly where left/top and max_width/max_height
land on the template.

Usage:
    python3 scripts/social-images/test-placement.py
    python3 scripts/social-images/test-placement.py --type blog
    python3 scripts/social-images/test-placement.py --type cookbook --title "My Long Recipe Title Here"
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = Path(__file__).parent / "config.yaml"

SAMPLE_TEXTS = {
    "title": "Retrieval-Augmented Generation with Custom Embeddings",
    "description": "Learn how to build a production-ready RAG pipeline using Haystack 2.x with custom embedding models and vector stores.",
}

FIELD_COLORS = ["#ff4444", "#44aaff", "#44ff88", "#ffaa44"]


def load_config():
    with open(CONFIG_FILE) as f:
        return yaml.safe_load(f)["templates"]


def measure_text_height(font, size, max_width, max_height, text):
    """Return the rendered height of caption text in pixels (trimmed content only)."""
    safe_text = text.replace("\\", "\\\\").replace("'", "\\'")
    result = subprocess.run([
        "convert", "-density", "96",
        "-background", "none", "-fill", "black",
        "-font", font, "-pointsize", str(size),
        "-size", f"{int(max_width)}x{int(max_height)}",
        f"caption:{safe_text}",
        "-trim", "-format", "%h\n", "info:",
    ], capture_output=True, text=True, check=True)
    return int(result.stdout.strip())


def build_cmd(template_path, fields, text_values, output_path):
    # Pre-pass: measure any field that is used as an anchor target.
    measured_heights = {}
    for field_cfg in fields.values():
        anchor = field_cfg.get("anchor")
        if anchor and anchor not in measured_heights and anchor in fields:
            anchor_cfg = fields[anchor]
            anchor_text = text_values.get(anchor, SAMPLE_TEXTS.get(anchor, ""))
            if anchor_text:
                anchor_text = anchor_text.replace("\\n", "\n")
                measured_heights[anchor] = measure_text_height(
                    str(REPO_ROOT / anchor_cfg["font"]),
                    anchor_cfg["size"],
                    anchor_cfg["max_width"],
                    anchor_cfg["max_height"],
                    anchor_text,
                )

    cmd = ["convert", "-density", "96", str(template_path)]

    for i, (field_name, field_cfg) in enumerate(fields.items()):
        text = text_values.get(field_name, SAMPLE_TEXTS.get(field_name, f"[{field_name}]"))
        if not text:
            continue

        font = str(REPO_ROOT / field_cfg["font"])
        size = field_cfg["size"]
        color = field_cfg["color"]
        gravity = field_cfg["gravity"]
        max_width = field_cfg["max_width"]
        max_height = field_cfg["max_height"]
        box_color = FIELD_COLORS[i % len(FIELD_COLORS)]

        anchor = field_cfg.get("anchor")
        if anchor and anchor in fields:
            x = field_cfg.get("left", fields[anchor].get("left", 0))
            y = fields[anchor]["top"] + measured_heights.get(anchor, 0) + field_cfg.get("gap", 0)
        else:
            x = field_cfg["left"]
            y = field_cfg["top"]

        # Draw bounding box
        cmd += [
            "-fill", "none",
            "-stroke", box_color,
            "-strokewidth", "2",
            "-draw", f"rectangle {int(x)},{int(y)} {int(x + max_width)},{int(y + max_height)}",
        ]

        # Draw field label
        cmd += [
            "-fill", box_color,
            "-font", font,
            "-pointsize", "18",
            "-annotate", f"+{int(x) + 4}+{int(y) + 18}",
            f"{field_name} (left={x}, top={y})",
        ]

        # Render actual text
        text = text.replace("\\n", "\n")
        safe_text = text.replace("\\", "\\\\").replace("'", "\\'")
        cmd += [
            "(",
            "-background", "none",
            "-fill", color,
            "-font", font,
            "-pointsize", str(size),
            "-size", f"{int(max_width)}x{int(max_height)}",
            f"caption:{safe_text}",
            ")",
            "-gravity", gravity,
            "-geometry", f"+{int(x)}+{int(y)}",
            "-composite",
        ]

    cmd.append(str(output_path))
    return cmd


def main():
    parser = argparse.ArgumentParser(description="Visual placement test for social image fields.")
    parser.add_argument("--type", default="cookbook", metavar="TYPE", help="Content type to test (default: cookbook)")
    parser.add_argument("--title", metavar="TEXT", help="Override sample title text")
    parser.add_argument("--description", metavar="TEXT", help="Override sample description text")
    args = parser.parse_args()

    if not shutil.which("convert"):
        print("Error: ImageMagick `convert` not found. Install with: brew install imagemagick")
        sys.exit(1)

    config = load_config()
    template_cfg = config.get(args.type) or config.get("fallback")

    template_path = REPO_ROOT / template_cfg["template"]
    if not template_path.exists():
        fallback_cfg = config.get("fallback")
        fallback_path = REPO_ROOT / fallback_cfg["template"] if fallback_cfg else None
        if fallback_path and fallback_path.exists():
            print(f"Template not found, using fallback: {fallback_path.name}")
            template_path = fallback_path
        else:
            print(f"Error: no template found at {template_path}")
            sys.exit(1)

    output_dir = REPO_ROOT / template_cfg["output_dir"]
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "_placement-test.png"

    text_values = dict(SAMPLE_TEXTS)
    if args.title:
        text_values["title"] = args.title
    if args.description:
        text_values["description"] = args.description

    fields = template_cfg["fields"]
    print(f"Type:     {args.type}")
    print(f"Template: {template_path}")
    print(f"Output:   {output_path}")
    print()
    for field_name, field_cfg in fields.items():
        anchor = field_cfg.get("anchor")
        left_display = field_cfg.get("left", f"inherited from '{anchor}'")
        if anchor:
            print(f"  {field_name}: left={left_display}, top=anchored below '{anchor}' + gap={field_cfg.get('gap', 0)}, "
                  f"max_width={field_cfg['max_width']}, max_height={field_cfg['max_height']}")
        else:
            print(f"  {field_name}: left={field_cfg['left']}, top={field_cfg['top']}, "
                  f"max_width={field_cfg['max_width']}, max_height={field_cfg['max_height']}")
    print()

    cmd = build_cmd(template_path, fields, text_values, output_path)
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Generated: {output_path}")
    except subprocess.CalledProcessError as exc:
        print(f"ImageMagick failed:\n{exc.stderr.strip()}")
        sys.exit(1)


if __name__ == "__main__":
    main()
