import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { asset } from '../host';

// [full width, height, small width]; anything not listed is a 1024 x 1536 portrait
const SIZES: Record<string, [number, number, number]> = {
  cover: [1920, 1080, 800],
  field: [1536, 1024, 800], 'field-day': [1536, 1024, 800], 'grain-macro': [1536, 1024, 800], 'grains-row': [1536, 1024, 800],
  'dal-chawal': [1536, 1024, 800], 'family-table': [1536, 1024, 800], kitchen: [1536, 1024, 800], 'harvest-dawn': [1536, 1024, 800],
  'mill-outside': [1600, 779, 800], 'mill-front': [1600, 900, 800], 'mill-aerial': [1600, 749, 800],
  'mill-floor': [1600, 770, 800], 'mill-machines': [1600, 764, 800], 'mill-silos': [1600, 773, 800],
  'mill-silos-2': [1600, 765, 800], 'award-export': [381, 254, 381], 'rahul-suri': [960, 1280, 800],
  // campaign photographs from the client, October 2026
  'range-shelf': [1080, 1350, 640], 'range-staples': [1122, 1402, 640], 'kitchen-method': [1536, 1024, 800],
  'kitchen-atta': [1118, 1407, 640], 'table-royal': [1122, 1402, 640],
  pulao: [1024, 1024, 640], 'pulao-plate': [1024, 1024, 640], panicle: [1024, 1024, 640], scoop: [1024, 1024, 640], pouch: [1024, 1024, 640],
};

type ImgProps = { name: string; alt: string; sizes: string; eager?: boolean; className?: string };

/** A photograph from /assets/img, served at two widths. */
export function Img({ name, alt, sizes, eager, className }: ImgProps) {
  const [full, height, small] = SIZES[name] ?? [1024, 1536, 640];
  const base = `/assets/img/${name}`;
  return (
    <img
      className={className}
      src={asset(`${base}.webp`)}
      srcSet={`${asset(`${base}-s.webp`)} ${small}w, ${asset(`${base}.webp`)} ${full}w`}
      sizes={sizes}
      width={full}
      height={height}
      alt={alt}
      loading={eager ? undefined : 'lazy'}
      decoding={eager ? undefined : 'async'}
      fetchPriority={eager ? 'high' : undefined}
    />
  );
}

const SKETCHES = { harvest: [2029, 914], kitchen: [1998, 867], family: [2048, 906] } as const;

/** A hand-drawn illustration that sits between sections. */
export function Sketch({ name, alt, className = '' }: { name: keyof typeof SKETCHES; alt: string; className?: string }) {
  const [width, height] = SKETCHES[name];
  return (
    <figure className={`sketch ${className}`}>
      <img
        src={asset(`/assets/art/ill-${name}.webp`)} srcSet={`${asset(`/assets/art/ill-${name}-s.webp`)} 1024w, ${asset(`/assets/art/ill-${name}.webp`)} ${width}w`}
        sizes="(min-width: 1100px) 62rem, 100vw" width={width} height={height} alt={alt} loading="lazy" decoding="async"
      />
    </figure>
  );
}

export type IconName = 'grain' | 'paddy' | 'hands' | 'sack' | 'bowl' | 'handi' | 'scoop' | 'scatter';

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span className={`ico ico--${name} ${className}`} aria-hidden="true" />;
}

/** A round badge with text running around its edge. */
export function Stamp({ text, className = '', children }: { text: string; className?: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className={`stamp ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id={id} d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
        </defs>
        <text>
          <textPath href={`#${id}`} textLength="496">{text}</textPath>
        </text>
      </svg>
      {children}
    </div>
  );
}

/** The cut-out corner on a photo frame. */
export function Notch({ icon }: { icon: IconName }) {
  return (
    <span className="notch" aria-hidden="true">
      <span className="notch__dot"><Icon name={icon} /></span>
    </span>
  );
}

/** A Warli frieze that runs between sections and drifts sideways as the page moves. */
// The living versions of the bands, fetched once each and shared by every band that shows them
const living = new Map<string, Promise<string>>();
const fetchLiving = (art: string) => {
  if (!living.has(art)) living.set(art, fetch(asset(`/assets/art/warli-${art}-live.svg`)).then((r) => (r.ok ? r.text() : Promise.reject(r.status))));
  return living.get(art)!;
};

/**
 * A Warli frieze between sections. It drifts sideways as the page scrolls. As it comes near, the
 * still drawing gives way to a living one (scripts/warli/live.py) whose figures move while the band
 * is in view: the dancers step round their circle, the harvesters swing at the paddy, the pestles
 * pound. People who ask their device for less motion keep the still drawing.
 */
export function Band({ art, tone = 'indigo' }: { art: 'harvest' | 'dance' | 'kitchen'; tone?: 'indigo' | 'rice' }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [svg, setSvg] = useState<string>();
  const [copies, setCopies] = useState(2);
  const [on, setOn] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0px', '-260px']);

  useEffect(() => {
    const band = ref.current;
    if (!band || reduced) return;
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      fetchLiving(art).then(setSvg, () => {});
    }, { rootMargin: '600px 0px' });
    const seen = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold: 0.35 });
    near.observe(band);
    seen.observe(band);
    // enough copies of the drawing, side by side, to cover the band and its drift
    const fit = () => {
      const art = band.querySelector('.band__art') as HTMLElement | null;
      if (art) setCopies(Math.max(2, Math.ceil((band.clientWidth + 280) / ((art.clientHeight * 1600) / 220))));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => { near.disconnect(); seen.disconnect(); window.removeEventListener('resize', fit); };
  }, [art, reduced]);

  const mask = `url(${asset(`/assets/art/warli-${art}.svg`)})`;
  return (
    <div className={`band band--${tone}`} ref={ref} aria-hidden="true">
      {svg && !reduced ? (
        <m.div className="band__art band__live" data-on={on || undefined} style={{ x }} dangerouslySetInnerHTML={{ __html: svg.repeat(copies) }} />
      ) : (
        <m.div className="band__art" style={{ x, maskImage: mask, WebkitMaskImage: mask }} />
      )}
    </div>
  );
}
