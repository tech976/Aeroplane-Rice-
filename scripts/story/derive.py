"""Prepare the harvest-to-pack story artwork (src/components/Journey.tsx).

  python3 -m venv .venv && .venv/bin/pip install numpy Pillow scipy
  .venv/bin/python scripts/story/derive.py <folder of Canva exports>

Each scene is a hand-drawn ink illustration on cream paper with only the grain painted in colour,
exported from Canva at 1920 x 1080 (harvest, thresh, store, mill, pack). For each, this writes to
public/assets/story/:
  <id>.webp / <id>-s.webp   the scene in full colour, at two widths
  <id>-ink.webp / -s        the same scene with the colour drained to sepia ink, so the painted
                            grain can bloom out of the drawing as the reader arrives
The ink version is made from the colour one, so the two line up exactly. Adapted from the pencil
step in the Infinity Services artwork tools.
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parents[2] / 'public/assets/story'
SCENES = ['harvest', 'thresh', 'store', 'mill', 'pack']
PAPER = np.array([0.965, 0.93, 0.86], dtype=np.float32)   # warm cream, close to the artwork's own
INK = np.array([0.36, 0.25, 0.15], dtype=np.float32)       # sepia

def ink(rgb):
    """Keep the drawing, lose the colour: luminance mapped from sepia ink to cream paper."""
    g = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # lift the painted areas towards paper so they read as lightly washed, not filled in
    t = np.clip((g - 0.18) / 0.72, 0, 1) ** 0.85
    t = 0.12 + t * 0.88
    return INK + (PAPER - INK) * t[..., None]

def webp(img, path, width, q):
    tmp = path.with_suffix('.png')
    img.resize((width, round(width * img.height / img.width)), Image.LANCZOS).save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), '-m', '6', str(tmp), '-o', str(path)], check=True)
    tmp.unlink()

def main(src):
    OUT.mkdir(parents=True, exist_ok=True)
    for name in SCENES:
        colour = Image.open(Path(src) / f'{name}.jpg').convert('RGB')
        rgb = np.asarray(colour).astype(np.float32) / 255
        drawn = Image.fromarray((ink(rgb) * 255).round().astype(np.uint8))
        for img, suffix, q in ((colour, '', 80), (drawn, '-ink', 74)):
            webp(img, OUT / f'{name}{suffix}.webp', 1920, q)
            webp(img, OUT / f'{name}{suffix}-s.webp', 960, q)
        sizes = [(OUT / f'{name}{s}.webp').stat().st_size // 1024 for s in ('', '-ink', '-s', '-ink-s')]
        print(f'{name}: colour {sizes[0]} KB, ink {sizes[1]} KB, small {sizes[2]} / {sizes[3]} KB')

if __name__ == '__main__':
    main(sys.argv[1])
