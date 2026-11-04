"""The profile grid as Instagram shows it: each 4:5 post cropped to 3:4 (34 px off each side), three across.

usage: python3 social/scripts/feed-grid.py <out.png> <post.png> …   (newest first, as the grid shows them)
"""
import sys

from PIL import Image

out, files = sys.argv[1], sys.argv[2:]
TILE_W, TILE_H, GAP = 360, 480, 4
rows = (len(files) + 2) // 3
grid = Image.new("RGB", (TILE_W * 3 + GAP * 2, TILE_H * rows + GAP * (rows - 1)), "white")
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB")
    w = min(im.width, round(im.height * 3 / 4))
    left = (im.width - w) // 2
    h = round(w * 4 / 3)
    top = (im.height - h) // 2
    tile = im.crop((left, top, left + w, top + h)).resize((TILE_W, TILE_H), Image.LANCZOS)
    grid.paste(tile, ((i % 3) * (TILE_W + GAP), (i // 3) * (TILE_H + GAP)))
grid.save(out)
print(out)
