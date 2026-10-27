import { useEffect, useRef, useState } from 'react';
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Img } from './ui';

const pages = [
  { year: 'Origins', photo: 'harvest-dawn', alt: 'A farmer carrying cut paddy across a field at dawn', text: 'The first sacks leave the mill under the Aeroplane name.' },
  { year: '1980s', photo: 'hands', alt: 'Hands cupping milled basmati rice', text: 'Traders abroad begin asking for it by name. Word travels kitchen to kitchen.' },
  { year: '1990s', photo: 'ageing', alt: 'Jute sacks of basmati resting in a grain store', text: 'We build our own ageing stores, so every lot can rest a full season.' },
  { year: '2010s', photo: 'scoop', alt: 'Milled basmati rice with a wooden scoop', text: 'The same aged grain reaches home kitchens in packs of every size.' },
  { year: 'Today', photo: 'table-royal', alt: 'A family at dinner behind a pack of Aeroplane Royal basmati and a bowl of vegetable pulao', text: 'Thirty-eight countries, and still the same fields and the same patience.' },
];

/** The story as an album: one decade to a page. On wide screens the page turns as you scroll; on phones you swipe. */
export function Story() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [page, setPage] = useState(0);
  const pinned = wide && !reduced;

  useEffect(() => {
    const query = matchMedia('(min-width: 900px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.06, 0.94], ['0vw', `-${(pages.length - 1) * 100}vw`]);
  const drift = useTransform(scrollYProgress, [0.06, 0.94], ['0vw', `${(pages.length - 1) * 18}vw`]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const turned = Math.min(1, Math.max(0, (progress - 0.06) / 0.88));
    setPage(Math.round(turned * (pages.length - 1)));
  });

  return (
    <section className="album light" id="story" ref={section} data-pinned={pinned || undefined}>
      <div className="album__pin">
        <div className="wrap album__head">
          <h2 className="display">Five decades, one grain.</h2>
          <p className="lede">Very little has changed: the same fields, the same resting, the same care at the mill.</p>
        </div>

        <m.ol className="album__track" style={pinned ? { x } : undefined} tabIndex={pinned ? undefined : 0} aria-label="The Aeroplane story, decade by decade">
          {pages.map((entry) => (
            <li className="album__page" key={entry.year}>
              <m.span className="album__ghost" style={pinned ? { x: drift } : undefined} aria-hidden="true">{entry.year}</m.span>
              <figure className="album__photo"><Img name={entry.photo} alt={entry.alt} sizes="(min-width: 900px) 28vw, 70vw" /></figure>
              <div className="album__text">
                <h3>{entry.year}</h3>
                <p>{entry.text}</p>
              </div>
            </li>
          ))}
        </m.ol>

        {pinned && (
          <ol className="wrap album__index" aria-hidden="true">
            {pages.map((entry, i) => <li key={entry.year} data-on={i === page}>{entry.year}</li>)}
          </ol>
        )}
      </div>
    </section>
  );
}
