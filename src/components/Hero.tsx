import { useCallback, useEffect, useRef, useState } from 'react';
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Img } from './ui';

const HEADLINE = 'The long grain of India.';
const ZOOM = 150;

/**
 * The opening. It begins on the photograph. Scrolling draws back, and a white sheet closes
 * over the picture with the headline cut out of it, so the field is left showing only through
 * the letters. The view pulls out of the stem of the "l".
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const text = useRef<SVGTextElement>(null);
  const cut = useRef<SVGGElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const opening = useTransform(scrollYProgress, [0.06, 0.16], [1, 0]);
  const sheet = useTransform(scrollYProgress, [0.1, 0.24], [0, 1]);
  const closing = useTransform(scrollYProgress, [0.74, 0.88], [0, 1]);
  const photo = useTransform(scrollYProgress, [0, 1], [1, 1.14]);

  const narrow = box.w < 760;
  const lines = narrow ? ['The long', 'grain', 'of India.'] : ['The long grain', 'of India.'];
  const size = narrow ? box.w * 0.205 : Math.min(box.w * 0.122, box.h * 0.27);
  const left = Math.max(20, Math.min(box.w * 0.05, 80));
  const first = box.h * (narrow ? 0.3 : 0.42) - ((lines.length - 1) * size) / 2 + size * 0.36;

  const place = useCallback((progress: number) => {
    if (!cut.current) return;
    const drawn = Math.min(1, Math.max(0, (progress - 0.1) / 0.66));
    const scale = reduced ? 1 : Math.exp((1 - drawn) ** 2 * Math.log(ZOOM));
    const { x, y } = origin.current;
    cut.current.setAttribute('transform', `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`);
  }, [reduced]);

  useEffect(() => {
    if (!pin.current) return;
    const watch = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    watch.observe(pin.current);
    return () => watch.disconnect();
  }, []);

  // aim the zoom at the stem of the "l", which is solid ink all the way through
  useEffect(() => {
    const measure = () => {
      if (!text.current || !box.w) return;
      const stem = text.current.getExtentOfChar(HEADLINE.indexOf('l'));
      // the measured box runs half a letter-space wide of the ink, so step back onto the stem
      origin.current = { x: stem.x + stem.width / 2 - size * 0.025, y: stem.y + stem.height * 0.42 };
      place(scrollYProgress.get());
    };
    measure();
    document.fonts.ready.then(measure);
  }, [box, size, place, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', place);

  return (
    <section className="hero" id="top" ref={section} data-still={reduced || undefined}>
      <div className="hero__pin" ref={pin}>
        <m.div className="hero__photo" style={{ scale: reduced ? 1 : photo }}>
          <Img name="field" alt="Basmati paddy fields at sunrise, with hills in the distance" sizes="100vw" eager />
        </m.div>

        <h1 className="sr">{HEADLINE}</h1>
        {box.w > 0 && (
          <m.svg className="hero__sheet" viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h} aria-hidden="true" style={{ opacity: reduced ? 1 : sheet }}>
            <defs>
              <mask id="hero-cut" maskUnits="userSpaceOnUse" x="0" y="0" width={box.w} height={box.h}>
                <rect width={box.w} height={box.h} fill="#fff" />
                <g ref={cut}>
                  <text ref={text} className="hero__letters" fontSize={size} fill="#000">
                    {lines.map((line, i) => <tspan key={line} x={left} y={first + i * size * 0.98}>{line}{i < lines.length - 1 ? ' ' : ''}</tspan>)}
                  </text>
                </g>
              </mask>
            </defs>
            <rect width={box.w} height={box.h} fill="#FDFCF9" mask="url(#hero-cut)" />
          </m.svg>
        )}

        {!reduced && (
          <m.div className="wrap hero__opening" style={{ opacity: opening }}>
            <p className="label">Aged basmati, since 1969</p>
            <p className="hero__say">Four decades.<br />Thirty-seven countries.</p>
            <a className="btn btn--yellow" href="#range">Shop the range</a>
          </m.div>
        )}

        <m.div className="wrap hero__closing" style={{ opacity: reduced ? 1 : closing }}>
          <p className="lede">Basmati grown at the foot of the Himalayas, cut by hand, and rested for eight months before it is milled.</p>
          <div className="hero__actions">
            <a className="btn" href="#range">Shop the range</a>
            <a className="btn btn--line" href="#heritage">Our heritage</a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
