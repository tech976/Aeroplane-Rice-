import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { asset } from '../host';

// "Above the clouds", from the campaign, trimmed of its letterbox bars and its first three seconds.
// It plays on a silent loop while it is on screen (browsers only start a film on their own when it
// is muted); a click on the film, or the sound button, brings the sound in. It only loads once the
// section comes near, and it stays still for people who ask their device for less motion.
const FILM = { title: 'Above the clouds', src: '/assets/video/campaign-clouds-48s.mp4', poster: '/assets/video/campaign-clouds-poster.webp', width: 1920, height: 816 };

const Sound = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
    {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
  </svg>
);

const Pause = ({ paused }: { paused: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    {paused ? <path d="M8 5.5v13l11-6.5z" fill="currentColor" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />}
  </svg>
);

export function Films() {
  const film = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  // plays while on screen, rests while off it; loads only when first near
  useEffect(() => {
    const video = film.current;
    if (!video || reduced || paused) return;
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { rootMargin: '200px 0px' });
    watch.observe(video);
    return () => watch.disconnect();
  }, [reduced, paused]);

  useEffect(() => { if (reduced) setPaused(true); }, [reduced]);

  const toggleSound = () => {
    const video = film.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    // turning the sound on is a request to watch, so a paused film starts again
    if (!video.muted && video.paused) { setPaused(false); video.play().catch(() => {}); }
  };

  const togglePause = () => {
    const video = film.current;
    if (!video) return;
    if (video.paused) { setPaused(false); video.play().catch(() => {}); } else { setPaused(true); video.pause(); }
  };

  return (
    <section className="films dark" id="films" aria-labelledby="films-title">
      <div className="pattern" aria-hidden="true" />
      <div className="wrap">
        <div className="head">
          <h2 className="display" id="films-title">Khao… Udd Jao!</h2>
          <p className="lede">The new Aeroplane film. Tap it for sound.</p>
        </div>

        <figure className="film">
          <div className="film__screen frame" style={{ aspectRatio: `${FILM.width} / ${FILM.height}` }}>
            <video
              ref={film} src={asset(FILM.src)} poster={asset(FILM.poster)} width={FILM.width} height={FILM.height}
              muted loop playsInline preload="none" onClick={toggleSound} aria-label={`${FILM.title}, the Aeroplane campaign film`}
            />
          </div>
          <figcaption>
            <span>{FILM.title}</span>
            <div className="film__controls">
              <button type="button" onClick={togglePause} aria-label={paused ? 'Play the film' : 'Pause the film'}><Pause paused={paused} /></button>
              <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? 'Turn the sound on' : 'Turn the sound off'}>
                <Sound on={!muted} /><span>{muted ? 'Sound on' : 'Sound off'}</span>
              </button>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
