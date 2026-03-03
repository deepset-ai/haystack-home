# Social image generation

Generates Open Graph / Twitter Card preview images for Hugo content by compositing text onto PNG templates using ImageMagick.

Images are placed at `static/images/social/{type}/{slug}.png`. Hugo's `opengraph.html` partial automatically detects a generated image at that path and uses it — no front-matter changes needed in any content file.

## Prerequisites

```bash
brew install imagemagick
pip3 install -r scripts/social-images/requirements.txt
```

## Build integration

`build.sh` calls `generate.py` automatically after all content (including auto-generated tutorials, cookbook, and integrations) is in place and before Hugo runs.

## Local usage

```bash
# Preview everything without writing files
python3 scripts/social-images/generate.py --dry-run

# Generate for all content types
python3 scripts/social-images/generate.py

# One content type only
python3 scripts/social-images/generate.py --type release-notes

# Single file
python3 scripts/social-images/generate.py --file content/release-notes/2.25.0.md
```

## Adding templates

Place one PNG per content type in `scripts/social-images/templates/`:

| File | Used for |
|---|---|
| `blog.png` | `content/blog/` posts |
| `release-notes.png` | `content/release-notes/` pages |
| `overview.png` | `content/overview/` pages |
| `tutorials.png` | `content/tutorials/` and `content/cookbook/` |
| `integrations.png` | `content/integrations/` pages |
| `fallback.png` | Everything else (also used by `pages/`) |

Recommended size: **1200 × 630 px** (standard OG image ratio).

## Configuration

`config.yaml` controls text placement for each template. Each content type can define multiple named fields (`title`, `description`, etc.) that map to front-matter values:

```yaml
templates:
  blog:
    template: scripts/social-images/templates/blog.png
    output_dir: static/images/social/blog
    fields:
      title:
        font: scripts/social-images/fonts/GreycliffCFExtraBold.ttf
        size: 72           # font size in points
        color: "#fefefd"
        gravity: NorthWest # ImageMagick anchor: NorthWest, Center, South, etc.
        x: 100             # pixel offset from the gravity anchor
        y: 200
        max_width: 900     # text wraps within this box width
        max_height: 300    # text is clipped beyond this height
      description:
        ...
```

Available fonts (in `scripts/social-images/fonts/`):

- `GreycliffCFExtraBold.ttf` — headings
- `GreycliffCFBold.ttf`, `GreycliffCFDemiBold.ttf`, `GreycliffCFMedium.ttf`
- `HafferBold.ttf`, `HafferMedium.ttf`, `HafferRegular.ttf` — body text
- `CourierPrimeBold.ttf`, `CourierPrimeRegular.ttf` — monospace

## How Hugo picks up the images

`themes/haystack/layouts/partials/opengraph.html` derives the expected image path from the page's content type and slug, then checks for the file with `os.FileExists`. Priority order:

1. Explicit `images` array in front matter (manual override)
2. Generated social image at `static/images/social/{type}/{slug}.png`
3. Site-wide default from `config.toml`
