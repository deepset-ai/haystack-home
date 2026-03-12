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
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Optional

import frontmatter
import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = Path(__file__).parent / "config.yaml"


@dataclass
class FieldConfig:
    font: str
    size: int
    color: str
    gravity: str
    max_width: float
    max_height: float
    left: float = 0.0
    top: float = 0.0
    anchor: Optional[str] = None
    gap: float = 0.0

    @classmethod
    def from_dict(cls, data: dict) -> "FieldConfig":
        return cls(
            font=data["font"],
            size=data["size"],
            color=data["color"],
            gravity=data["gravity"],
            max_width=data["max_width"],
            max_height=data["max_height"],
            left=data.get("left", 0.0),
            top=data.get("top", 0.0),
            anchor=data.get("anchor"),
            gap=data.get("gap", 0.0),
        )


@dataclass
class TemplateConfig:
    template: str
    output_dir: str
    fields: dict = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> "TemplateConfig":
        return cls(
            template=data["template"],
            output_dir=data["output_dir"],
            fields={
                name: FieldConfig.from_dict(cfg)
                for name, cfg in (data.get("fields") or {}).items()
            },
        )


class Config:
    def __init__(self, config_file: Path):
        with open(config_file) as f:
            raw = yaml.safe_load(f)["templates"]
        self._templates: dict[str, TemplateConfig] = {
            name: TemplateConfig.from_dict(data) for name, data in raw.items()
        }

    def resolve(self, content_type: str) -> Optional[TemplateConfig]:
        return self._templates.get(content_type) or self._templates.get("fallback")

    @property
    def fallback(self) -> Optional[TemplateConfig]:
        return self._templates.get("fallback")


@dataclass
class ContentFile:
    md_path: Path
    content_type: str
    slug: str
    title: str
    description: str
    _metadata: dict = field(default_factory=dict)

    @classmethod
    def load(cls, md_path: Path, repo_root: Path) -> "ContentFile":
        content_type = cls._detect_type(md_path, repo_root)
        slug = cls._derive_slug(md_path)
        post = frontmatter.load(str(md_path))
        return cls(
            md_path=md_path,
            content_type=content_type,
            slug=slug,
            title=post.get("title") or post.get("name") or "",
            description=post.get("description") or "",
            _metadata=dict(post.metadata),
        )

    @property
    def text_values(self) -> dict[str, str]:
        result: dict[str, str] = {"title": self.title, "description": self.description}
        for key, value in self._metadata.items():
            if key in result:
                continue
            if isinstance(value, list):
                result[key] = ", ".join(str(v) for v in value)
            elif value is not None:
                result[key] = str(value)
        return result

    @staticmethod
    def _detect_type(md_path: Path, repo_root: Path) -> str:
        try:
            rel = md_path.relative_to(repo_root / "content")
        except ValueError:
            return "fallback"
        return rel.parts[0]

    @staticmethod
    def _derive_slug(md_path: Path) -> str:
        if md_path.name in ("index.md", "_index.md"):
            return md_path.parent.name
        return md_path.stem


class ImageCompositor:
    def __init__(self, repo_root: Path):
        self._repo_root = repo_root

    def measure_text_height(self, field_cfg: FieldConfig, text: str) -> int:
        """Return the pixel distance from the caption box top to the bottom of rendered text.

        Uses ImageMagick's %@ bounding-box format (WxH+X+Y) and returns Y+H so that
        the result accounts for any top padding the caption renderer adds above the glyphs.
        """
        safe_text = text.replace("\\", "\\\\").replace("'", "\\'")
        result = subprocess.run([
            "magick", "-density", "96",
            "-background", "none", "-fill", "black",
            "-font", str(self._repo_root / field_cfg.font),
            "-pointsize", str(field_cfg.size),
            "-size", f"{int(field_cfg.max_width)}x{int(field_cfg.max_height)}",
            f"caption:{safe_text}",
            "-format", "%@\n", "info:",
        ], capture_output=True, text=True, check=True)
        # %@ returns "WxH+X+Y" — Y is top offset of text, H is glyph height.
        # Y + H is the bottom edge of the text relative to the caption box top.
        m = re.match(r"\d+x(\d+)\+\d+\+(\d+)", result.stdout.strip())
        if m:
            return int(m.group(2)) + int(m.group(1))
        return int(result.stdout.strip())

    def fit_font_size(self, field_cfg: FieldConfig, text: str) -> int:
        """Binary-search for the largest font size where text fits within max_height.

        The size in field_cfg is treated as the maximum; returns a value in [1, size].
        Measurement uses an unconstrained height so ImageMagick clipping cannot mask overflow.
        """
        # Remove the height constraint so the bounding box reflects true text height.
        unconstrained = replace(field_cfg, max_height=10_000)
        lo, hi = 1, field_cfg.size
        best = lo
        while lo <= hi:
            mid = (lo + hi) // 2
            height = self.measure_text_height(replace(unconstrained, size=mid), text)
            if height <= field_cfg.max_height:
                best = mid
                lo = mid + 1
            else:
                hi = mid - 1
        return best

    def build_command(
        self,
        template_path: Path,
        fields: dict[str, FieldConfig],
        text_values: dict[str, str],
        output_path: Path,
    ) -> list[str]:
        """
        Build an ImageMagick `convert` command that composites one caption layer
        per configured field onto the template image.

        Fields may use `anchor` and `gap` instead of a fixed `top` value — the
        top edge is then computed as anchor_field.top + rendered_height + gap.

        Font sizes are treated as maximums: each field's size is reduced as needed
        so the full text always fits within max_height.
        """
        effective_fields = {
            name: (
                replace(cfg, size=self.fit_font_size(cfg, text_values[name].replace("\\n", "\n")))
                if text_values.get(name)
                else cfg
            )
            for name, cfg in fields.items()
        }
        measured_heights = self._measure_anchors(effective_fields, text_values)
        cmd = ["magick", "-density", "96", str(template_path)]

        for field_name, field_cfg in effective_fields.items():
            text = text_values.get(field_name, "")
            if not text:
                continue
            x, y = self._resolve_position(field_cfg, effective_fields, measured_heights)
            cmd += self._field_args(field_cfg, text, x, y)

        cmd.append(str(output_path))
        return cmd

    def composite(
        self,
        template_path: Path,
        fields: dict[str, FieldConfig],
        text_values: dict[str, str],
        output_path: Path,
    ) -> None:
        """Run ImageMagick. Raises FileNotFoundError or CalledProcessError on failure."""
        cmd = self.build_command(template_path, fields, text_values, output_path)
        subprocess.run(cmd, check=True, capture_output=True, text=True)

    def _measure_anchors(
        self, fields: dict[str, FieldConfig], text_values: dict[str, str]
    ) -> dict[str, int]:
        measured: dict[str, int] = {}
        for field_cfg in fields.values():
            anchor_name = field_cfg.anchor
            if anchor_name and anchor_name not in measured and anchor_name in fields:
                anchor_field = fields[anchor_name]
                anchor_text = text_values.get(anchor_name, "").replace("\\n", "\n")
                if anchor_text:
                    measured[anchor_name] = self.measure_text_height(anchor_field, anchor_text)
        return measured

    def _resolve_position(
        self,
        field_cfg: FieldConfig,
        all_fields: dict[str, FieldConfig],
        measured_heights: dict[str, int],
    ) -> tuple[float, float]:
        if field_cfg.anchor and field_cfg.anchor in all_fields:
            anchor_field = all_fields[field_cfg.anchor]
            x = field_cfg.left if field_cfg.left else anchor_field.left
            y = anchor_field.top + measured_heights.get(field_cfg.anchor, 0) + field_cfg.gap
        else:
            x, y = field_cfg.left, field_cfg.top
        return x, y

    def _field_args(
        self, field_cfg: FieldConfig, text: str, x: float, y: float
    ) -> list[str]:
        text = text.replace("\\n", "\n")
        safe_text = text.replace("\\", "\\\\").replace("'", "\\'")
        return [
            "(", "-background", "none",
            "-fill", field_cfg.color,
            "-font", str(self._repo_root / field_cfg.font),
            "-pointsize", str(field_cfg.size),
            "-size", f"{int(field_cfg.max_width)}x{int(field_cfg.max_height)}",
            f"caption:{safe_text}",
            ")", "-gravity", field_cfg.gravity,
            "-geometry", f"+{int(x)}+{int(y)}", "-composite",
        ]


class FileProcessor:
    def __init__(self, config: Config, compositor: ImageCompositor, repo_root: Path):
        self._config = config
        self._compositor = compositor
        self._repo_root = repo_root

    def _rel(self, path: Path) -> Path:
        try:
            return path.relative_to(self._repo_root)
        except ValueError:
            return path

    def process(self, md_path: Path, dry_run: bool, force: bool = False) -> bool:
        """Process a single content file. Returns True on success or skip."""
        content_file = ContentFile.load(md_path, self._repo_root)

        base_cfg = self._config.resolve(content_file.content_type)
        if not base_cfg:
            print(f"  error {self._rel(md_path)}: no template config and no fallback defined in config.yaml")
            return False

        resolution = self._resolve_template(content_file, base_cfg)
        if resolution is None:
            # Template missing with no fallback — skip message already printed
            return True

        template_path, template_cfg = resolution
        output_dir = self._repo_root / template_cfg.output_dir
        output_path = output_dir / f"{content_file.slug}.png"

        if dry_run:
            self._print_dry_run(content_file, output_path)
            return True

        if output_path.exists() and not force:
            print(f"  skip  {self._rel(md_path)}  (already exists, use --force to regenerate)")
            return True

        output_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self._compositor.composite(
                template_path, template_cfg.fields, content_file.text_values, output_path
            )
        except FileNotFoundError:
            print("  error: ImageMagick `convert` not found. Install with: brew install imagemagick")
            return False
        except subprocess.CalledProcessError as exc:
            print(f"  error {self._rel(md_path)}: ImageMagick failed\n{exc.stderr.strip()}")
            return False

        print(f"  ok    {self._rel(md_path)}  →  {self._rel(output_path)}")
        return True

    def _resolve_template(
        self, content_file: ContentFile, template_cfg: TemplateConfig
    ) -> Optional[tuple[Path, TemplateConfig]]:
        template_path = self._repo_root / template_cfg.template
        if template_path.exists():
            return template_path, template_cfg

        fallback = self._config.fallback
        if fallback:
            fallback_path = self._repo_root / fallback.template
            if fallback_path.exists():
                print(f"  warn  {self._rel(content_file.md_path)}: template not found, using fallback")
                merged = TemplateConfig(
                    template=fallback.template,
                    output_dir=template_cfg.output_dir,
                    fields=template_cfg.fields or fallback.fields,
                )
                return fallback_path, merged

        print(f"  skip  {self._rel(content_file.md_path)}: template not found at {self._rel(template_path)}")
        return None

    def _print_dry_run(self, content_file: ContentFile, output_path: Path) -> None:
        print(f"  dry   {self._rel(content_file.md_path)}")
        print(f"        type={content_file.content_type}  slug={content_file.slug}")
        print(f"        output={self._rel(output_path)}")
        for field_name, text in content_file.text_values.items():
            preview = (text[:60] + "…") if len(text) > 60 else text
            print(f"        {field_name}: {preview!r}")


class FileCollector:
    def __init__(self, repo_root: Path):
        self._repo_root = repo_root

    def collect(
        self,
        content_type: Optional[str] = None,
        single_file: Optional[Path] = None,
    ) -> list[Path]:
        if single_file:
            return [single_file.resolve()]

        content_root = self._repo_root / "content"
        if content_type:
            dirs = [content_root / content_type]
        else:
            dirs = [d for d in content_root.iterdir() if d.is_dir()]

        files: list[Path] = []
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
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate images even if the output file already exists.",
    )
    args = parser.parse_args()

    if not shutil.which("magick"):
        print("Error: ImageMagick `magick` command not found.")
        print("Install with:  brew install imagemagick")
        sys.exit(1)

    config = Config(CONFIG_FILE)
    collector = FileCollector(REPO_ROOT)
    compositor = ImageCompositor(REPO_ROOT)
    processor = FileProcessor(config, compositor, REPO_ROOT)

    files = collector.collect(args.type, args.file)
    if not files:
        print("No matching content files found.")
        sys.exit(0)

    print(f"Processing {len(files)} file(s)…\n")
    ok = 0
    failed = 0
    for md_path in files:
        if processor.process(md_path, args.dry_run, args.force):
            ok += 1
        else:
            failed += 1

    print(f"\nDone: {ok} ok, {failed} failed.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
