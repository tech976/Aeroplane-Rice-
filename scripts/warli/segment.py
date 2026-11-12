"""List the figures in a Warli band: strokes that touch are joined into one figure."""
import re, sys

def bbox(tag, attrs):
    if tag == 'circle':
        cx, cy, r = (float(re.search(rf'\b{k}="([^"]+)"', attrs).group(1)) for k in ('cx', 'cy', 'r'))
        return cx - r, cy - r, cx + r, cy + r
    d = re.search(r'\bd="([^"]*)"', attrs).group(1)
    w = float((re.search(r'stroke-width="([^"]+)"', attrs) or [0, '0'])[1]) / 2
    xs, ys, cur = [], [], (0, 0)
    for cmd, args in re.findall(r'([MLQCHZ])([^MLQCHZ]*)', d):
        n = [float(v) for v in re.findall(r'-?\d*\.?\d+', args)]
        if cmd == 'H':
            for x in n: xs.append(x); ys.append(cur[1]); cur = (x, cur[1])
        else:
            for i in range(0, len(n) - 1, 2):
                xs.append(n[i]); ys.append(n[i + 1]); cur = (n[i], n[i + 1])
    return min(xs) - w, min(ys) - w, max(xs) + w, max(ys) + w

def load(path):
    s = open(path).read()
    return s, [(m.group(0), m.group(1), bbox(m.group(1), m.group(2))) for m in re.finditer(r'<(path|circle)\b([^>]*)/>', s)]

def cluster(items, top=22, bottom=178, gap=2.5):
    # the dotted ground line runs the full width and would join every figure's feet, so it is left out
    scene = [i for i, (_, _, b) in enumerate(items) if b[1] > top and b[1] < bottom and b[2] - b[0] < 600]
    parent = {i: i for i in scene}
    def find(i):
        while parent[i] != i: parent[i] = parent[parent[i]]; i = parent[i]
        return i
    for a in scene:
        for b in scene:
            if a < b:
                A, B = items[a][2], items[b][2]
                if A[0] - gap <= B[2] and B[0] - gap <= A[2] and A[1] - gap <= B[3] and B[1] - gap <= A[3]:
                    parent[find(a)] = find(b)
    groups = {}
    for i in scene: groups.setdefault(find(i), []).append(i)
    out = []
    for members in groups.values():
        bs = [items[i][2] for i in members]
        out.append((min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs), sorted(members)))
    return sorted(out)

if __name__ == '__main__':
    _, items = load(sys.argv[1])
    for k, (x0, y0, x1, y1, m) in enumerate(cluster(items)):
        print(f'{k:2d}  x {x0:6.0f}-{x1:6.0f}  y {y0:4.0f}-{y1:4.0f}  {len(m):3d} strokes')
