"""Build the "living" Warli bands: public/assets/art/warli-<band>.svg rewritten with each moving
figure in its own group, ready for the CSS in src/styles.css to animate.

  python3 scripts/warli/live.py

The original bands roughen every stroke with an SVG turbulence filter. A filter has to be redrawn
on every frame of an animation, so here the same kind of wobble is baked into the strokes once:
long lines are cut into short steps and each point is nudged by smooth noise. What does not move
is merged into a handful of paths, so a band is a few dozen elements rather than several hundred.
"""
import math, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from segment import bbox

ART = Path(__file__).resolve().parents[2] / 'public/assets/art'

# Each moving figure: (class, x0, x1, y0, y1, pivot x, pivot y). A stroke belongs to the first figure
# whose box holds its centre; everything else stays still. Pivots are in the drawing's own units
# (1600 x 220), measured off the bands with a grid.
FIGURES = {
    'dance': (
        [('w-sun', x - 42, x + 42, 22, 88, x, 50) for x in (40, 420, 760, 1120, 1480)]
        + [('w-horn', 556, 640, 30, 112, 562, 100), ('w-player', 520, 585, 78, 180, 550, 176)]
        + [('w-dancer', x - 50, x + 50, 78, 180, x, 176) for x in (50, 155, 255, 350, 440)]
        + [('w-dancer', x - 50, x + 50, 78, 180, x, 176) for x in (645, 755, 858, 950, 1045, 1140, 1245, 1355, 1455, 1555)]
    ),
    'harvest': (
        ('w-sun', 45, 130, 22, 100, 88, 61),
        ('w-bird', 178, 205, 30, 50, 191, 41), ('w-bird', 218, 246, 45, 63, 232, 54),
        ('w-bird', 1285, 1316, 38, 56, 1300, 47), ('w-bird', 1338, 1367, 52, 72, 1352, 62),
        ('w-cutter', 583, 695, 82, 180, 615, 176), ('w-cutter', 810, 922, 82, 180, 842, 176),
        ('w-bearer', 1012, 1078, 44, 180, 1045, 176), ('w-child', 1088, 1168, 105, 180, 1128, 176),
        ('w-wheel', 1208, 1282, 128, 180, 1243, 150),
        ('w-head', 1418, 1468, 84, 142, 1425, 130),
        ('w-paddy', 355, 560, 95, 180, 455, 176), ('w-paddy', 690, 812, 95, 180, 750, 176),
        ('w-paddy', 922, 1005, 95, 180, 962, 176), ('w-paddy', 1462, 1598, 95, 180, 1530, 176),
    ),
    'kitchen': (
        ('w-pestle', 230, 248, 18, 104, 238, 100), ('w-pounder', 205, 272, 80, 180, 238, 176),
        ('w-steam', 438, 496, 30, 98, 467, 96),
        ('w-stirrer', 500, 592, 84, 180, 560, 176),
        ('w-grain', 768, 820, 76, 146, 792, 110),
        ('w-tray', 676, 766, 50, 180, 720, 176),
        ('w-bearer', 1062, 1114, 44, 180, 1088, 176),
        ('w-pestle', 1434, 1452, 40, 150, 1442, 150), ('w-pounder', 1370, 1470, 80, 180, 1420, 176),
        ('w-wave', 296, 366, 100, 180, 330, 176), ('w-wave', 1156, 1206, 108, 180, 1180, 176), ('w-wave', 1480, 1562, 98, 180, 1520, 176),
    ),
}

# ---------- smooth noise, standing in for the original feTurbulence filter ----------

def _hash(ix, iy, seed):
    h = (ix * 374761393 + iy * 668265263 + seed * 2147483647) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFF) / 0xFFFF

def _value(x, y, seed):
    ix, iy = math.floor(x), math.floor(y)
    fx, fy = x - ix, y - iy
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b = _hash(ix, iy, seed), _hash(ix + 1, iy, seed)
    c, d = _hash(ix, iy + 1, seed), _hash(ix + 1, iy + 1, seed)
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy

def wobble(x, y, freq=.035, scale=3.2):
    def channel(seed):
        return _value(x * freq, y * freq, seed) * .67 + _value(x * freq * 2, y * freq * 2, seed + 9) * .33
    return x + scale * (channel(7) - .5), y + scale * (channel(23) - .5)

# ---------- strokes to wobbled path data ----------

def points(d):
    """The pen's route through a path, as lists of points per subpath; curves are sampled."""
    runs, run, cur = [], [], (0.0, 0.0)
    for cmd, args in re.findall(r'([MLQCHZ])([^MLQCHZ]*)', d):
        n = [float(v) for v in re.findall(r'-?\d*\.?\d+', args)]
        if cmd == 'M':
            if run: runs.append(run)
            cur = (n[0], n[1]); run = [cur]
            for i in range(2, len(n) - 1, 2): cur = (n[i], n[i + 1]); run.append(cur)
        elif cmd == 'L':
            for i in range(0, len(n) - 1, 2): cur = (n[i], n[i + 1]); run.append(cur)
        elif cmd == 'H':
            for x in n: cur = (x, cur[1]); run.append(cur)
        elif cmd == 'Q':
            for i in range(0, len(n) - 3, 4):
                (cx, cy), (ex, ey), (sx, sy) = (n[i], n[i + 1]), (n[i + 2], n[i + 3]), cur
                steps = max(4, int(math.dist((sx, sy), (ex, ey)) / 4))
                for k in range(1, steps + 1):
                    t = k / steps
                    run.append(((1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t * t * ey))
                cur = (ex, ey)
        elif cmd == 'C':
            for i in range(0, len(n) - 5, 6):
                (sx, sy), (ax, ay), (bx, by), (ex, ey) = cur, (n[i], n[i + 1]), (n[i + 2], n[i + 3]), (n[i + 4], n[i + 5])
                steps = max(6, int((math.dist((sx, sy), (ax, ay)) + math.dist((ax, ay), (bx, by)) + math.dist((bx, by), (ex, ey))) / 4))
                for k in range(1, steps + 1):
                    t = k / steps; u = 1 - t
                    run.append((u ** 3 * sx + 3 * u * u * t * ax + 3 * u * t * t * bx + t ** 3 * ex, u ** 3 * sy + 3 * u * u * t * ay + 3 * u * t * t * by + t ** 3 * ey))
                cur = (ex, ey)
        elif cmd == 'Z' and run:
            run.append(run[0])
    if run: runs.append(run)
    return runs

def densify(run, step=5.0):
    out = [run[0]]
    for a, b in zip(run, run[1:]):
        k = max(1, int(math.dist(a, b) / step))
        out += [(a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k) for i in range(1, k + 1)]
    return out

def fmt(v): return f'{v:.1f}'.rstrip('0').rstrip('.')

def path_data(raw, tag):
    if tag == 'circle':
        cx, cy, r = (float(re.search(rf'\b{k}="([^"]+)"', raw).group(1)) for k in ('cx', 'cy', 'r'))
        cx, cy = wobble(cx, cy)
        return f'M{fmt(cx - r)} {fmt(cy)}a{fmt(r)} {fmt(r)} 0 1 0 {fmt(2 * r)} 0a{fmt(r)} {fmt(r)} 0 1 0 {fmt(-2 * r)} 0'
    d = re.search(r'\bd="([^"]*)"', raw).group(1)
    closed = 'Z' in d
    parts = []
    for run in points(d):
        pts = [wobble(*p) for p in densify(run)]
        parts.append('M' + ' '.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + ('Z' if closed else ''))
    return ''.join(parts)

def style_key(raw, tag):
    """Strokes that draw alike can share one path."""
    fill = re.search(r'fill="([^"]+)"', raw)
    if fill and fill.group(1) != 'none': return ('fill',)
    if not re.search(r'stroke="', raw): return ('fill',)
    width = re.search(r'stroke-width="([^"]+)"', raw)
    dash = re.search(r'stroke-dasharray="([^"]+)"', raw)
    return ('stroke', width.group(1) if width else '1', dash.group(1) if dash else '')

def paths(strokes):
    by_style = {}
    for raw, tag in strokes:
        by_style.setdefault(style_key(raw, tag), []).append(path_data(raw, tag))
    out = []
    for key, ds in by_style.items():
        if key[0] == 'fill':
            # filled shapes keep a path each: merged, overlapping shapes wound opposite ways cancel out
            out += [f'<path d="{d}"/>' for d in ds]
        else:
            dash = f' stroke-dasharray="{key[2]}"' if key[2] else ''
            out.append(f'<path class="s" stroke-width="{key[1]}"{dash} d="{"".join(ds)}"/>')
    return ''.join(out)

# ---------- one band ----------

def build(band):
    src = (ART / f'warli-{band}.svg').read_text()
    strokes = [(m.group(0), m.group(1), bbox(m.group(1), m.group(2))) for m in re.finditer(r'<(path|circle)\b([^>]*)/>', src)]
    figures = FIGURES[band]
    members = [[] for _ in figures]
    still = []
    for raw, tag, b in strokes:
        cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
        for k, (_, x0, x1, y0, y1, _px, _py) in enumerate(figures):
            if x0 <= cx <= x1 and y0 <= cy <= y1 and b[2] - b[0] < 600:
                members[k].append((raw, tag)); break
        else:
            still.append((raw, tag))
    groups = []
    for (cls, x0, x1, *_rest, px, py), mine in zip(figures, members):
        if not mine: raise SystemExit(f'{band}: no strokes found for {cls} at x {x0}-{x1}')
        # the delay follows the figure's place along the band, so a movement travels down the row
        groups.append(f'<g class="{cls}" style="transform-origin:{fmt(px)}px {fmt(py)}px;--at:{(x0 + x1) / 3200:.3f}">{paths(mine)}</g>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 220" preserveAspectRatio="xMinYMid meet" class="warli">'
           f'<g class="still">{paths(still)}</g>{"".join(groups)}</svg>')
    out = ART / f'warli-{band}-live.svg'
    out.write_text(svg)
    moving = sum(len(m) for m in members)
    print(f'{band}: {len(strokes)} strokes -> {svg.count("<path")} paths; {moving} strokes in {len(figures)} moving figures; {out.stat().st_size // 1024} KB')

if __name__ == '__main__':
    for band in FIGURES: build(band)
