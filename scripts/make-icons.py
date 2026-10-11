"""Render icons/icon{16,32,48,128}.png with no dependencies.

Usage: python3 scripts/make-icons.py icons
"""
import struct, zlib, sys, os

WHITE = (255, 255, 255, 255)
GRAY = (154, 160, 166, 255)  # #9AA0A6 — readable on both dark and light toolbars
RED = (255, 0, 0, 255)

def rrect(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1): return False
    cx = min(max(x, x0 + r), x1 - r); cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def circle(x, y, cx, cy, r): return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def ring(x, y, x0, y0, x1, y1, r, w):
    return rrect(x, y, x0, y0, x1, y1, r) and not rrect(x, y, x0 + w, y0 + w, x1 - w, y1 - w, max(1, r - w))

BX, BY, BR = 87, 87, 41   # badge
S = 0.52                  # camera glyph scale inside badge

def camera(x, y):
    # Camera glyph drawn in its own 128-unit space, then scaled into the badge
    body = rrect(x, y, 22, 40, 106, 98, 12) or rrect(x, y, 46, 30, 82, 46, 6)
    return body and not (circle(x, y, 64, 69, 21) and not circle(x, y, 64, 69, 12))

def sample(x, y):
    if circle(x, y, BX, BY, BR):
        return WHITE if camera((x - BX) / S + 64, (y - BY) / S + 66) else RED
    if circle(x, y, BX, BY, BR + 6):
        return None  # transparent gap around the badge
    if ring(x, y, 5, 13, 111, 99, 16, 14):
        return GRAY
    return None

def render(size, ss=4):
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            r = g = b = a = 0
            for sy in range(ss):
                for sx in range(ss):
                    c = sample((px + (sx + .5) / ss) * 128 / size, (py + (sy + .5) / ss) * 128 / size)
                    if c: r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3]
            n = ss * ss
            row += bytes([r // a, g // a, b // a, a // n]) if a else bytes(4)
        rows.append(bytes(row))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b''))

out = sys.argv[1]
for s in (16, 32, 48, 128):
    open(os.path.join(out, f'icon{s}.png'), 'wb').write(render(s))
