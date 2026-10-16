import { useId, useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'motion/react';

// [full width, height, small width]; anything not listed is a 1024 x 1536 portrait
const SIZES: Record<string, [number, number, number]> = {
  cover: [1920, 1080, 800],
  field: [1536, 1024, 800], 'field-day': [1536, 1024, 800], 'grain-macro': [1536, 1024, 800], 'grains-row': [1536, 1024, 800],
  'dal-chawal': [1536, 1024, 800], 'family-table': [1536, 1024, 800], kitchen: [1536, 1024, 800], 'harvest-dawn': [1536, 1024, 800],
  'mill-outside': [1600, 779, 800], 'mill-front': [1600, 900, 800], 'mill-aerial': [1600, 749, 800],
  'mill-floor': [1600, 770, 800], 'mill-machines': [1600, 764, 800], 'mill-silos': [1600, 773, 800],
  'mill-silos-2': [1600, 765, 800], 'award-export': [381, 254, 381], 'rahul-suri': [960, 1280, 800],
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
      src={`${base}.webp`}
      srcSet={`${base}-s.webp ${small}w, ${base}.webp ${full}w`}
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
        src={`/assets/art/ill-${name}.webp`} srcSet={`/assets/art/ill-${name}-s.webp 1024w, /assets/art/ill-${name}.webp ${width}w`}
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
export function Band({ art, tone = 'indigo' }: { art: 'harvest' | 'dance' | 'kitchen'; tone?: 'indigo' | 'rice' }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0px', '-260px']);
  return (
    <div className={`band band--${tone}`} ref={ref} aria-hidden="true">
      <m.div className="band__art" style={{ x, maskImage: `url(/assets/art/warli-${art}.svg)`, WebkitMaskImage: `url(/assets/art/warli-${art}.svg)` }} />
    </div>
  );
}
