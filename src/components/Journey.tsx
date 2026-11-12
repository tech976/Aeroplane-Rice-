import { useCallback, useEffect, useRef, useState } from 'react';
import { m, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { asset } from '../host';

// From the field to the pack, as one hand-drawn scroll that unrolls as the reader scrolls (artwork:
// Canva, prepared by scripts/story/derive.py). The five drawings sit side by side; scrolling glides
// from one to the next and rests on each, where it fills the whole screen. The drawings blend into
// each other only in the strip between two resting places, so at rest nothing but the drawing shows.
// As the scroll settles on a drawing, its grain blooms from ink into colour.
const chapters = [
  { id: 'harvest', step: 'Harvest', focus: 0.7, title: 'Cut by hand, in the basmati belt.', text: 'In autumn the paddy ripens at the foot of the Himalayas, and the farmers who grow it for us cut it by hand.', alt: 'Two farmers cutting ripe golden paddy with sickles, the Himalayan foothills behind them' },
  { id: 'thresh', step: 'Threshing', focus: 0.62, title: 'Threshed, winnowed, dried in the sun.', text: 'The sheaves are beaten to free the grain, the chaff is winnowed off, and the paddy dries in the open air.', alt: 'Farmers threshing sheaves while a woman winnows golden grain onto a drying mat' },
  { id: 'store', step: 'Resting', focus: 0.68, title: 'Eight months in jute.', text: 'In our warehouses the paddy rests in jute sacks through a winter and a summer, so it cooks long and separate.', alt: 'Workers carrying jute sacks of paddy past tall stacks in a warehouse' },
  { id: 'mill', step: 'Milling', focus: 0.66, title: 'Milled, polished, sorted.', text: 'Only then is it milled, polished and sorted, grain by grain, on machinery from Japan, Germany and the USA.', alt: 'A miller checking a handful of grain as polished rice pours from a chute' },
  { id: 'pack', step: 'Packing', focus: 0.6, title: 'Packed as Aeroplane rice.', text: 'Weighed and sealed at our packing house, and on its way to kitchens in India and thirty-seven countries.', alt: 'Rice pouring into a pack of Aeroplane La-Taste basmati on a scale, with more packs lined up on a table' },
] as const;

const N = chapters.length;
const BLEND = 0.1; // width of the blend between two drawings, as a share of the screen

const src = (name: string) => ({
  src: asset(`/assets/story/${name}.webp`),
  srcSet: `${asset(`/assets/story/${name}-s.webp`)} 960w, ${asset(`/assets/story/${name}.webp`)} 1920w`,
});

type Size = { stageW: number; trackH: number };

/**
 * The layout of the scroll. Each drawing is drawn wide enough to fill the screen with a blend strip
 * to spare on either side; the strips of neighbours overlap, and the resting place for each drawing
 * keeps both its strips just off screen (or, on a narrow screen, centres the drawing's subject).
 */
function layout({ stageW, trackH }: Size) {
  const blend = Math.max(24, stageW * BLEND);
  const artW = Math.max(stageW + 2 * blend, (trackH * 16) / 9);
  const artH = (artW * 9) / 16;
  const step = artW - blend;
  const stops = chapters.map((c, i) => i * step + Math.min(Math.max(c.focus * artW - stageW / 2, blend), artW - blend - stageW));
  return { blend, artW, artH, step, stops };
}

/** 0 before a drawing's turn, rising to 1 as the scroll reaches its resting place, and staying 1. */
function arrival(x: number, i: number, size: Size) {
  const { step, stops } = layout(size);
  const gap = i === 0 ? step : Math.max(1, stops[i] - stops[i - 1]);
  return Math.min(1, Math.max(0, 1 + (-x - stops[i]) / (gap * 0.75)));
}

/** One drawing in the scroll: ink, the painted scene over it, and (on wide screens) its words. */
function Scene({ index, x, size, reduced }: { index: number; x: MotionValue<number>; size: Size; reduced: boolean }) {
  const c = chapters[index];
  const { blend, artW, artH, step, stops } = layout(size);
  const bloom = useTransform(x, (v) => arrival(v, index, size));
  // the words read while the scroll rests on their drawing
  const words = useTransform(x, (v) => {
    const prev = index ? stops[index] - stops[index - 1] : step, next = index < N - 1 ? stops[index + 1] - stops[index] : step;
    const d = -v - stops[index];
    return Math.min(1, Math.max(0, 1 - (d < 0 ? -d / Math.max(1, prev * 0.45) : d / Math.max(1, next * 0.45))));
  });
  const drift = useTransform(words, [0, 1], [18, 0]);
  const place = reduced ? undefined : {
    left: index * step, width: artW, '--blend': `${blend}px`, '--rest': `${stops[index] - index * step}px`,
  } as React.CSSProperties;

  return (
    <article className="journey__scene" style={place}>
      <div className="journey__frame" style={reduced ? undefined : { height: artH, top: (size.trackH - artH) / 2 }}>
        <img className="journey__ink" {...src(`${c.id}-ink`)} sizes="(max-width: 899px) 180vw, 125vw" width={1920} height={1080} alt="" loading="lazy" decoding="async" />
        <m.img className="journey__colour" {...src(c.id)} sizes="(max-width: 899px) 180vw, 125vw" width={1920} height={1080} alt={c.alt} loading="lazy" decoding="async" style={reduced ? undefined : { opacity: bloom }} />
      </div>
      <m.div className="journey__words" style={reduced ? undefined : { opacity: words, y: drift }}>
        <p className="journey__step"><span>{String(index + 1).padStart(2, '0')}</span>{c.step}</p>
        <h3>{c.title}</h3>
        <p>{c.text}</p>
      </m.div>
    </article>
  );
}

export function Journey() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [size, setSize] = useState<Size>({ stageW: 1, trackH: 1 });
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const [active, setActive] = useState(0);
  const x = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const line = useTransform(scrollYProgress, [0.04, 0.96], ['0%', '100%']);

  // where the scroll sits: it rests a moment on each drawing, and glides between them
  const place = useCallback((p: number) => {
    const { stops } = layout(sizeRef.current);
    const s = Math.min(N - 1, Math.max(0, p * (N - 1)));
    const i = Math.min(N - 2, Math.floor(s));
    const t = Math.min(1, Math.max(0, (s - i - 0.2) / 0.6));
    const eased = t * t * (3 - 2 * t);
    x.set(-(stops[i] + (stops[i + 1] - stops[i]) * eased));
    setActive(Math.min(N - 1, Math.round(s)));
  }, [x]);

  useMotionValueEvent(scrollYProgress, 'change', place);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setSize({ stageW: el.clientWidth, trackH: el.clientHeight });
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  useEffect(() => { place(scrollYProgress.get()); }, [size, place, scrollYProgress]);

  return (
    <section className="journey" ref={section} data-still={reduced || undefined} aria-labelledby="journey-title">
      <div className="journey__pin">
        <div className="journey__track" ref={track}>
          <m.div className="journey__strip" style={reduced ? undefined : { x }}>
            {chapters.map((c, i) => <Scene key={c.id} index={i} x={x} size={size} reduced={reduced} />)}
          </m.div>
        </div>

        <header className="wrap journey__head">
          <p className="label">From the field to the pack</p>
          <h2 className="journey__title" id="journey-title">How a grain becomes Aeroplane rice.</h2>
        </header>

        {/* on narrow screens the words of the drawing in view sit beneath the scroll */}
        <div className="journey__caption" aria-hidden="true">
          {chapters.map((c, i) => (
            <div key={c.id} data-on={i === active || undefined}>
              <p className="journey__step"><span>{String(i + 1).padStart(2, '0')}</span>{c.step}</p>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {/* the five steps, with a thread drawn through them as the story moves on */}
        <ol className="wrap journey__steps" aria-hidden="true">
          <m.span className="journey__thread" style={{ width: line }} />
          {chapters.map((c, i) => (
            <li key={c.id} data-on={i <= active || undefined} data-now={i === active || undefined}>
              <i /><span>{c.step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
