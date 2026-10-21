import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { asset } from '../host';
import { Marketplaces } from './Marketplaces';

/** The opening: one screen of the film of the paddy, with the line, the buttons and the marketplaces over it. */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  // the film eases back a little as the page scrolls away from it
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });
  const photo = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

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
    <section className="hero" id="top" ref={section}>
      <m.div className="hero__photo" style={{ scale: reduced ? 1 : photo }}>
        <video
          ref={film} poster={asset('/assets/video/hero-field-poster.webp')} width={1280} height={720}
          autoPlay={!reduced} muted loop playsInline preload="auto" aria-hidden="true"
        >
          <source src={asset('/assets/video/hero-field.webm')} type="video/webm" />
          <source src={asset('/assets/video/hero-field.mp4')} type="video/mp4" />
        </video>
      </m.div>

      <div className="wrap hero__opening">
        <p className="label">Aged Indian basmati</p>
        <h1 className="hero__say">Four decades.<br />Thirty-seven countries.</h1>
        <p className="hero__lede">Basmati grown at the foot of the Himalayas, cut by hand, and rested for eight months before it is milled.</p>
        <div className="hero__actions">
          <a className="btn btn--yellow" href="#range">Shop the range</a>
          <a className="btn btn--line" href="#heritage">Our heritage</a>
        </div>
        <Marketplaces query="Aeroplane basmati rice" hero />
      </div>
    </section>
  );
}
