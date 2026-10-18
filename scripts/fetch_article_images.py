#!/usr/bin/env python3
"""Download and normalize the audited article images used by the 2026-10-18 fix."""

from __future__ import annotations

import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts" / "article-image-sources-20261018.json"
OUTPUT_DIR = ROOT / "frontend" / "public" / "article_images" / "unique-20261018"


def download(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; KBBSaduniaImageAudit/1.0)",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def difference_hash(image: Image.Image) -> int:
    sample = ImageOps.grayscale(image).resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(sample.get_flattened_data())
    bits = 0
    for row in range(8):
        offset = row * 9
        for column in range(8):
            bits = (bits << 1) | int(pixels[offset + column] > pixels[offset + column + 1])
    return bits


def main() -> int:
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    hashes: dict[str, int] = {}
    perceptual_hashes: dict[int, int] = {}
    failures: list[str] = []

    for entry in entries:
        article_id = int(entry["article_id"])
        try:
            payload = download(entry["image_url"])
            with Image.open(io.BytesIO(payload)) as source:
                image = ImageOps.exif_transpose(source).convert("RGB")
                image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
                if image.width < 300 or image.height < 180:
                    raise ValueError(f"image is too small: {image.width}x{image.height}")

                output = OUTPUT_DIR / f"article_{article_id}.webp"
                image.save(output, "WEBP", quality=86, method=6)

                digest = hashlib.sha256(output.read_bytes()).hexdigest()
                if digest in hashes:
                    raise ValueError(f"duplicate file content with article {hashes[digest]}")
                hashes[digest] = article_id

                visual_hash = difference_hash(image)
                for other_hash, other_id in perceptual_hashes.items():
                    if (visual_hash ^ other_hash).bit_count() <= 2:
                        raise ValueError(f"possible visual duplicate of article {other_id}")
                perceptual_hashes[visual_hash] = article_id

                print(
                    f"article {article_id}: {image.width}x{image.height}, "
                    f"{output.stat().st_size} bytes, source={entry['source']}"
                )
        except Exception as exc:  # noqa: BLE001 - report every failed external source
            failures.append(f"article {article_id}: {exc}")

    if failures:
        print("\nFailed downloads:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    if len(hashes) != len(entries):
        print("Image count mismatch", file=sys.stderr)
        return 1

    print(f"\nValidated {len(hashes)} unique article images in {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
