import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { asset } from '../host';
import { Marketplaces } from './Marketplaces';

/**
 * The opening. It begins on the film of the paddy. Scrolling draws back: a white sheet closes over
 * the picture and the Aeroplane mark settles into the middle of it, from close up to its own size.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const opening = useTransform(scrollYProgress, [0.06, 0.16], [1, 0]);
  const sheet = useTransform(scrollYProgress, [0.1, 0.24], [0, 1]);
  const mark = useTransform(scrollYProgress, [0.12, 0.26], [0, 1]);
  const settle = useTransform(scrollYProgress, [0.1, 0.62], [2.6, 1]);
  const closing = useTransform(scrollYProgress, [0.74, 0.88], [0, 1]);
  const photo = useTransform(scrollYProgress, [0, 1], [1, 1.14]);

  // the film only plays while the opening is on screen, and not at all for reduced motion
  useEffect(() => {
    const video = film.current;
    if (!video || !section.current) return;
    if (reduced) { video.pause(); return; }
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    watch.observe(section.current);
    return () => watch.disconnect();
  }, [reduced]);

  return (
    <section className="hero" id="top" ref={section} data-still={reduced || undefined}>
      <div className="hero__pin">
        <m.div className="hero__photo" style={{ scale: reduced ? 1 : photo }}>
          <video
            ref={film} poster={asset('/assets/video/hero-field-poster.webp')} width={1280} height={720}
            autoPlay={!reduced} muted loop playsInline preload="auto" aria-hidden="true"
          >
            <source src={asset('/assets/video/hero-field.webm')} type="video/webm" />
            <source src={asset('/assets/video/hero-field.mp4')} type="video/mp4" />
          </video>
        </m.div>

        <m.div className="hero__sheet" aria-hidden="true" style={{ opacity: reduced ? 1 : sheet }} />
        <m.h1 className="hero__logo" style={reduced ? undefined : { opacity: mark, scale: settle }}>
          <img src={asset('/assets/brand/logo-primary-clear.png')} alt="La-Taste Aeroplane Basmati Rice" width={400} height={400} decoding="async" />
        </m.h1>

        {!reduced && (
          <m.div className="wrap hero__opening" style={{ opacity: opening }}>
            <p className="label">Aged Indian basmati</p>
            <p className="hero__say">Four decades.<br />Thirty-seven countries.</p>
            <a className="btn btn--yellow" href="#range">Shop the range</a>
            <Marketplaces query="Aeroplane basmati rice" hero />
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
