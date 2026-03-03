"""
Generate social preview (OG) images for Hugo content files.

For each content file the script:
  1. Detects the content type from the file path.
  2. Loads the matching template config from config.yaml (falls back to "fallback").
  3. Reads the front matter (title, description) with python-frontmatter.
  4. Composites text onto the PNG template using ImageMagick.
  5. Saves the result to static/images/social/{type}/{slug}.png.

The Hugo opengraph partial picks up generated images automatically by checking
for a file at that predictable path — no front matter changes are needed.

Usage:
    python3 scripts/social-images/generate.py                        # all content types
    python3 scripts/social-images/generate.py --type blog             # one type
    python3 scripts/social-images/generate.py --file content/release-notes/2.25.0.md
    python3 scripts/social-images/generate.py --dry-run               # preview only

Dependencies:
    pip install python-frontmatter PyYAML
    brew install imagemagick   (or equivalent)
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

import frontmatter
import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = Path(__file__).parent / "config.yaml"


def load_config():
    with open(CONFIG_FILE) as f:
        return yaml.safe_load(f)["templates"]


def detect_content_type(md_path: Path) -> str:
    """Infer content type from the file's path relative to content/."""
    try:
        rel = md_path.relative_to(REPO_ROOT / "content")
    except ValueError:
        return "fallback"
    return rel.parts[0]  # first directory under content/


def derive_slug(md_path: Path) -> str:
    """
    For  content/blog/my-post/index.md   →  my-post
    For  content/release-notes/2.25.0.md →  2.25.0
    For  content/tutorials/_index.md     →  tutorials
    """
    if md_path.name in ("index.md", "_index.md"):
        return md_path.parent.name
    return md_path.stem


def build_imagemagick_cmd(
    template_path: Path, fields: dict, text_values: dict, output_path: Path
) -> list[str]:
    """
    Build an ImageMagick `convert` command that composites one caption layer
    per configured field onto the template image.

    Uses ImageMagick's `caption:` type which handles automatic word-wrapping
    within the specified -size box.
    """
    cmd = ["convert", str(template_path)]

    for field_name, field_cfg in fields.items():
        text = text_values.get(field_name, "")
        if not text:
            continue

        font = str(REPO_ROOT / field_cfg["font"])
        size = field_cfg["size"]
        color = field_cfg["color"]
        gravity = field_cfg["gravity"]
        x = field_cfg["x"]
        y = field_cfg["y"]
        max_width = field_cfg["max_width"]
        max_height = field_cfg["max_height"]

        safe_text = text.replace("\\", "\\\\").replace("'", "\\'")

        cmd += [
            "(",
            "-background", "none",
            "-fill", color,
            "-font", font,
            "-pointsize", str(size),
            "-size", f"{max_width}x{max_height}",
            f"caption:{safe_text}",
            ")",
            "-gravity", gravity,
            "-geometry", f"+{x}+{y}",
            "-composite",
        ]

    cmd.append(str(output_path))
    return cmd


def process_file(md_path: Path, config: dict, dry_run: bool) -> bool:
    """Process a single content file. Returns True on success."""
    content_type = detect_content_type(md_path)
    template_cfg = config.get(content_type) or config.get("fallback")

    if not template_cfg:
        print(f"  error {md_path}: no template config and no fallback defined in config.yaml")
        return False

    template_path = REPO_ROOT / template_cfg["template"]
    if not template_path.exists():
        print(f"  skip  {md_path}: template not found at {template_path}")
        return True

    slug = derive_slug(md_path)
    output_dir = REPO_ROOT / template_cfg["output_dir"]
    output_path = output_dir / f"{slug}.png"

    post = frontmatter.load(str(md_path))
    text_values = {
        "title": post.get("title") or post.get("name") or "",
        "description": post.get("description") or "",
    }

    if dry_run:
        print(f"  dry   {md_path}")
        print(f"        type={content_type}  slug={slug}")
        print(f"        output={output_path}")
        for field, text in text_values.items():
            preview = (text[:60] + "…") if len(text) > 60 else text
            print(f"        {field}: {preview!r}")
        return True

    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = build_imagemagick_cmd(template_path, template_cfg["fields"], text_values, output_path)

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except FileNotFoundError:
        print("  error: ImageMagick `convert` not found. Install with: brew install imagemagick")
        return False
    except subprocess.CalledProcessError as exc:
        print(f"  error {md_path}: ImageMagick failed\n{exc.stderr.strip()}")
        return False

    print(f"  ok    {output_path}")
    return True


def collect_files(content_type: Optional[str], single_file: Optional[Path]) -> list:
    """Return the list of markdown files to process."""
    if single_file:
        return [single_file.resolve()]

    content_root = REPO_ROOT / "content"
    if content_type:
        dirs = [content_root / content_type]
    else:
        dirs = [d for d in content_root.iterdir() if d.is_dir()]

    files = []
    for d in dirs:
        if d.exists():
            files.extend(d.rglob("*.md"))

    return sorted(files)


def main():
    parser = argparse.ArgumentParser(
        description="Generate social preview images for Haystack Hugo content."
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--type",
        metavar="TYPE",
        help="Only process files of this content type (e.g. blog, release-notes, tutorials).",
    )
    group.add_argument(
        "--file",
        metavar="PATH",
        type=Path,
        help="Process a single markdown file.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be generated without writing any files.",
    )
    args = parser.parse_args()

    if not shutil.which("convert"):
        print("Error: ImageMagick `convert` command not found.")
        print("Install with:  brew install imagemagick")
        sys.exit(1)

    config = load_config()
    files = collect_files(args.type, args.file)

    if not files:
        print("No matching content files found.")
        sys.exit(0)

    print(f"Processing {len(files)} file(s)…\n")
    ok = 0
    failed = 0
    for md_path in files:
        success = process_file(md_path, config, args.dry_run)
        if success:
            ok += 1
        else:
            failed += 1

    print(f"\nDone: {ok} ok, {failed} failed.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
