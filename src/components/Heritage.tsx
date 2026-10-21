import { useRef } from 'react';
import { m, useScroll, useTransform, type MotionValue } from 'motion/react';
import { asset } from '../host';

type Piece = { word: string } | { photo: string; alt: string };

// One sentence, with three small photographs set into the line like words.
const sentence: Piece[] = [
  ...'For more than five decades, one name'.split(' ').map((word) => ({ word })),
  { photo: 'ageing', alt: 'jute sacks of basmati' },
  ...'has meant one thing in Indian kitchens'.split(' ').map((word) => ({ word })),
  { photo: 'harvest-dawn', alt: 'a farmer carrying paddy at dawn' },
  ...'and far beyond them: basmati that cooks long, separate and fragrant.'.split(' ').map((word) => ({ word })),
  { photo: 'grain-macro', alt: 'long basmati grains on indigo cloth' },
];

const figures = [
  ['4 decades', 'Of milling basmati'],
  ['8 months', 'Rested before milling'],
  ['38', 'Countries we reach'],
];

/** Each word, and each inset photograph, comes up from pale to full as the reader reaches it. */
function Reveal({ piece, index, total, progress }: { piece: Piece; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 2 / total], [0.14, 1]);
  if ('word' in piece) return <><m.span style={{ opacity }}>{piece.word}</m.span>{' '}</>;
  return (
    <>
      <m.span className="heritage__inset" style={{ opacity }}>
        <img src={asset(`/assets/img/${piece.photo}-s.webp`)} alt={piece.alt} loading="lazy" decoding="async" />
      </m.span>{' '}
    </>
  );
}

export function Heritage() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });

  return (
    <section className="heritage light" id="heritage">
      <div className="wrap">
        <div className="heritage__top">
          <h2 className="label">Our heritage</h2>
          <span aria-hidden="true" />
          <p className="label">Amir Chand Jagdish Kumar (Exports) Limited</p>
        </div>

        <p className="heritage__line" ref={ref}>
          {sentence.map((piece, i) => <Reveal key={i} piece={piece} index={i} total={sentence.length} progress={scrollYProgress} />)}
        </p>

        <div className="heritage__foot">
          <div>
            <p>We still buy paddy the way we always have, from growers in the basmati belt at the foot of the Himalayas, and we still let it rest through the seasons before it is milled.</p>
            <a className="btn" href="#range">Shop the range</a>
          </div>
          <dl className="heritage__figures">
            {figures.map(([value, label]) => (
              <div key={label}><dd>{value}</dd><dt className="label">{label}</dt></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
