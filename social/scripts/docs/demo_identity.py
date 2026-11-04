"""Draw the demo school's crest and its "cachet et signature" (invented, for marketing renders only)."""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONTS = Path(sys.argv[1])  # backend/app/static/fonts
OUT = Path(sys.argv[2])
GREEN = (30, 107, 71, 255)
GOLD = (201, 154, 46, 255)
INK = (35, 58, 143, 225)
SIGN = (24, 31, 64, 235)


def font(size, bold=True):
    return ImageFont.truetype(str(FONTS / ("Outfit-Bold.ttf" if bold else "Outfit-Regular.ttf")), size)


def crest(size=720):
    """A light rising over an open book, inside a green ring: Al Nour means "the light"."""
    s = size * 3
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = s / 2
    d.ellipse((24, 24, s - 24, s - 24), fill=(255, 255, 255, 255), outline=GREEN, width=int(s * 0.045))
    d.ellipse((int(s * 0.1), int(s * 0.1), int(s * 0.9), int(s * 0.9)), outline=GOLD, width=int(s * 0.012))
    horizon = c + s * 0.06
    r = s * 0.16
    for k in range(9):  # rays
        a = math.radians(180 + 22.5 * k)
        a1, a2 = a - 0.055, a + 0.055
        p = [(c + r * 1.18 * math.cos(a1), horizon + r * 1.18 * math.sin(a1)),
             (c + r * 1.95 * math.cos(a), horizon + r * 1.95 * math.sin(a)),
             (c + r * 1.18 * math.cos(a2), horizon + r * 1.18 * math.sin(a2))]
        d.polygon(p, fill=GOLD)
    d.pieslice((c - r, horizon - r, c + r, horizon + r), 180, 360, fill=GOLD)
    w, h = s * 0.46, s * 0.17  # open book
    top = horizon + s * 0.015
    left = [(c, top + h * 0.12), (c - w / 2, top), (c - w / 2, top + h), (c, top + h * 1.12)]
    right = [(c, top + h * 0.12), (c + w / 2, top), (c + w / 2, top + h), (c, top + h * 1.12)]
    d.polygon(left, fill=GREEN)
    d.polygon(right, fill=GREEN)
    d.line([(c, top + h * 0.12), (c, top + h * 1.12)], fill=(255, 255, 255, 255), width=int(s * 0.012))
    for i in range(1, 4):
        y = top + h * (0.25 + 0.2 * i)
        d.line([(c - w * 0.42, y - h * 0.08), (c - w * 0.08, y)], fill=(255, 255, 255, 200), width=int(s * 0.006))
        d.line([(c + w * 0.08, y), (c + w * 0.42, y - h * 0.08)], fill=(255, 255, 255, 200), width=int(s * 0.006))
    return im.resize((size, size), Image.LANCZOS)


def arc_text(im, text, cx, cy, radius, start_deg, end_deg, fnt, fill, inside=False, track=0.12):
    """Set text along an arc, each glyph placed by its own width (as a stamp engraver would)."""
    widths = [fnt.getlength(ch) + fnt.size * track for ch in text]
    total = sum(widths)
    span = math.radians(end_deg - start_deg)
    sweep = total / radius * (1 if span > 0 else -1)
    mid = math.radians((start_deg + end_deg) / 2)
    ang = mid - sweep / 2
    for ch, w in zip(text, widths):
        step = w / radius * (1 if span > 0 else -1)
        a = ang + step / 2
        x, y = cx + radius * math.cos(a), cy + radius * math.sin(a)
        glyph = Image.new("RGBA", (fnt.size * 2, fnt.size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(glyph).text((fnt.size, fnt.size), ch, font=fnt, fill=fill, anchor="mm")
        rot = -math.degrees(a) - 90 if not inside else -math.degrees(a) + 90
        glyph = glyph.rotate(rot, resample=Image.BICUBIC)
        im.alpha_composite(glyph, (int(x - glyph.width / 2), int(y - glyph.height / 2)))
        ang += step


def seal(width=960, height=570, signed=True):
    """One "cachet et signature" image, as a school scans it: a round blue stamp and the head's signature across it."""
    k = 2
    im = Image.new("RGBA", (width * k, height * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy, R = 300 * k, 285 * k, 250 * k
    d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=INK, width=10 * k)
    d.ellipse((cx - R + 26 * k, cy - R + 26 * k, cx + R - 26 * k, cy + R - 26 * k), outline=INK, width=4 * k)
    d.ellipse((cx - 118 * k, cy - 118 * k, cx + 118 * k, cy + 118 * k), outline=INK, width=4 * k)
    arc_text(im, "COMPLEXE SCOLAIRE AL NOUR", cx, cy, R - 64 * k, 200, 340, font(28 * k), INK, track=0.06)
    arc_text(im, "NOUAKCHOTT", cx, cy, R - 62 * k, 130, 50, font(30 * k), INK, inside=True, track=0.35)
    for a in (180, 0):
        x = cx + (R - 66 * k) * math.cos(math.radians(a))
        y = cy + (R - 66 * k) * math.sin(math.radians(a))
        d.regular_polygon((x, y, 12 * k), 5, fill=INK)
    d.text((cx, cy - 34 * k), "LA", font=font(30 * k), fill=INK, anchor="mm")
    d.text((cx, cy + 8 * k), "DIRECTION", font=font(40 * k), fill=INK, anchor="mm")
    d.text((cx, cy + 56 * k), "2026-2027", font=font(26 * k, bold=False), fill=INK, anchor="mm")
    if not signed:
        return im.resize((width, height), Image.LANCZOS)
    pts = [(170, 400), (230, 300), (262, 372), (300, 268), (330, 360), (372, 300), (420, 330),
           (480, 250), (520, 330), (600, 300), (700, 318), (820, 262), (900, 240)]
    sm = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        for t in range(12):
            u = t / 12
            sm.append(((x0 + (x1 - x0) * u) * k, (y0 + (y1 - y0) * u + 14 * math.sin(u * math.pi)) * k))
    d.line(sm, fill=SIGN, width=9 * k, joint="curve")
    d.line([(560 * k, 360 * k), (880 * k, 336 * k)], fill=SIGN, width=6 * k)
    return im.resize((width, height), Image.LANCZOS)


OUT.mkdir(parents=True, exist_ok=True)
crest().save(OUT / "crest.png")
seal().save(OUT / "seal.png")
seal(signed=False).crop((40, 25, 560, 545)).save(OUT / "stamp.png")
print(OUT / "crest.png", OUT / "seal.png")
