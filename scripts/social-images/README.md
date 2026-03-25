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
        left: 100          # pixel offset from the gravity anchor (horizontal)
        top: 200           # pixel offset from the gravity anchor (vertical)
        max_width: 900     # text wraps within this box width
        max_height: 300    # text is clipped beyond this height
      description:
        font: scripts/social-images/fonts/HafferRegular.ttf
        size: 36
        color: "#d9d9d9"
        gravity: NorthWest
        left: 100
        anchor: title      # position below the rendered bottom of the title field
        gap: 20            # extra pixels of padding after the title
        max_width: 900     # text wraps within this box width
        max_height: 120    # text is clipped beyond this height
```

**Field reference:**

| Key | Required | Description |
|---|---|---|
| `font` | yes | Path to a TTF file (relative to repo root) |
| `size` | yes | Font size in points (matches Canva pt values at 96 DPI) |
| `color` | yes | Hex color string |
| `gravity` | yes | ImageMagick reference corner: `NorthWest`, `Center`, `South`, etc. |
| `left` | yes* | Horizontal pixel offset from the gravity anchor (*defaults to anchor's `left` when `anchor` is set) |
| `top` | yes* | Vertical pixel offset from the gravity anchor (*not needed when `anchor` is set) |
| `max_width` | yes | Caption box width in pixels (controls line wrapping) |
| `max_height` | yes | Caption box height in pixels (text is clipped if it overflows) |
| `anchor` | no | Name of another field; positions this field's top below that field's rendered bottom edge |
| `gap` | no | Extra pixels of padding below the anchor field (default: 0) |

**Dynamic positioning with `anchor`:** when set, the canvas position is computed so that exactly `gap` pixels of visual space appear between the anchor's last text pixel and this field's first text pixel:

```
canvas_top = anchor_field.top + anchor_bottom_offset + gap - this_field_top_offset
```

`gap: 0` means the two text blocks touch with no overlap and no extra space. Both offsets are measured from each field's own caption canvas using ImageMagick's trim geometry.

Available fonts (in `scripts/social-images/fonts/`):

- `GreycliffCFExtraBold.ttf` — headings
- `GreycliffCFBold.ttf`, `GreycliffCFDemiBold.ttf`, `GreycliffCFMedium.ttf`
- `HafferBold.ttf`, `HafferMedium.ttf`, `HafferRegular.ttf` — body text
- `CourierPrimeBold.ttf`, `CourierPrimeRegular.ttf` — monospace
- `Inter-Regular.ttf`, `Inter-Bold.ttf` — Inter (v4.1)

## How Hugo picks up the images

`themes/haystack/layouts/partials/opengraph.html` derives the expected image path from the page's content type and slug, then checks for the file with `os.FileExists`. Priority order:

1. Explicit `images` array in front matter (manual override)
2. Generated social image at `static/images/social/{type}/{slug}.png`
3. Site-wide default from `config.toml`
