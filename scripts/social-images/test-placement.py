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

from generate import Config, FieldConfig, ImageCompositor

REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = Path(__file__).parent / "config.yaml"

SAMPLE_TEXTS = {
    "title": "Retrieval-Augmented Generation with Custom Embeddings",
    "description": "Learn how to build a production-ready RAG pipeline using Haystack 2.x with custom embedding models and vector stores.",
}

FIELD_COLORS = ["#ff4444", "#44aaff", "#44ff88", "#ffaa44"]


def build_cmd(
    compositor: ImageCompositor,
    template_path: Path,
    fields: dict[str, FieldConfig],
    text_values: dict[str, str],
    output_path: Path,
) -> list[str]:
    """Build the base composite command then inject bounding-box debug overlays."""
    # Use the shared compositor to get the base command (without the output path)
    base = compositor.build_command(template_path, fields, text_values, output_path)
    # Remove the output path appended by build_command — we'll re-add it at the end
    base = base[:-1]

    # Pre-compute positions for bounding boxes using the compositor's internals.
    # We replicate the anchor measurement to know x/y per field.
    measured_heights = compositor._measure_anchors(fields, text_values)

    for i, (field_name, field_cfg) in enumerate(fields.items()):
        text = text_values.get(field_name, "")
        if not text:
            continue
        x, y = compositor._resolve_position(field_cfg, fields, measured_heights)
        box_color = FIELD_COLORS[i % len(FIELD_COLORS)]

        base += [
            "-fill", "none",
            "-stroke", box_color,
            "-strokewidth", "2",
            "-draw", f"rectangle {int(x)},{int(y)} {int(x + field_cfg.max_width)},{int(y + field_cfg.max_height)}",
        ]
        base += [
            "-fill", box_color,
            "-font", str(REPO_ROOT / field_cfg.font),
            "-pointsize", "18",
            "-annotate", f"+{int(x) + 4}+{int(y) + 18}",
            f"{field_name} (left={int(x)}, top={int(y)})",
        ]

    base.append(str(output_path))
    return base


def main():
    parser = argparse.ArgumentParser(description="Visual placement test for social image fields.")
    parser.add_argument("--type", default="cookbook", metavar="TYPE", help="Content type to test (default: cookbook)")
    parser.add_argument("--title", metavar="TEXT", help="Override sample title text")
    parser.add_argument("--description", metavar="TEXT", help="Override sample description text")
    args = parser.parse_args()

    if not shutil.which("convert"):
        print("Error: ImageMagick `convert` not found. Install with: brew install imagemagick")
        sys.exit(1)

    config = Config(CONFIG_FILE)
    compositor = ImageCompositor(REPO_ROOT)

    template_cfg = config.resolve(args.type)
    if not template_cfg:
        print(f"Error: no template config found for type '{args.type}'")
        sys.exit(1)

    template_path = REPO_ROOT / template_cfg.template
    if not template_path.exists():
        fallback = config.fallback
        fallback_path = REPO_ROOT / fallback.template if fallback else None
        if fallback_path and fallback_path.exists():
            print(f"Template not found, using fallback: {fallback_path.name}")
            template_path = fallback_path
        else:
            print(f"Error: no template found at {template_path}")
            sys.exit(1)

    output_dir = REPO_ROOT / template_cfg.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "_placement-test.png"

    text_values = dict(SAMPLE_TEXTS)
    if args.title:
        text_values["title"] = args.title
    if args.description:
        text_values["description"] = args.description

    fields = template_cfg.fields
    print(f"Type:     {args.type}")
    print(f"Template: {template_path}")
    print(f"Output:   {output_path}")
    print()
    for field_name, field_cfg in fields.items():
        if field_cfg.anchor:
            print(f"  {field_name}: left=inherited from '{field_cfg.anchor}', top=anchored below '{field_cfg.anchor}' + gap={int(field_cfg.gap)}, "
                  f"max_width={int(field_cfg.max_width)}, max_height={int(field_cfg.max_height)}")
        else:
            print(f"  {field_name}: left={int(field_cfg.left)}, top={int(field_cfg.top)}, "
                  f"max_width={int(field_cfg.max_width)}, max_height={int(field_cfg.max_height)}")
    print()

    cmd = build_cmd(compositor, template_path, fields, text_values, output_path)
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Generated: {output_path}")
    except subprocess.CalledProcessError as exc:
        print(f"ImageMagick failed:\n{exc.stderr.strip()}")
        sys.exit(1)


if __name__ == "__main__":
    main()
