import { useRef } from 'react';
import { m, useScroll, useTransform } from 'motion/react';
import { Icon } from './ui';
import { asset } from '../host';
import { shopCategories } from '../catalog';
import { policyPages } from '../policies';

const WREATH = '<path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(105.1 234.5) rotate(-138.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(119.3 260.8) rotate(-155.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(140.6 281.7) rotate(-172.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(167.1 295.5) rotate(-189.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(196.5 300.9) rotate(-206.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(226.1 297.6) rotate(-223.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(253.5 285.7) rotate(-240.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(276.2 266.3) rotate(-257.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(292.3 241.1) rotate(-274.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(294.9 234.5) rotate(138.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(280.7 260.8) rotate(155.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(259.4 281.7) rotate(172.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(232.9 295.5) rotate(189.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(203.5 300.9) rotate(206.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(173.9 297.6) rotate(223.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(146.5 285.7) rotate(240.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(123.8 266.3) rotate(257.0)"/><path d="M0-13C5-6 5 6 0 13C-5 6-5-6 0-13Z" transform="translate(107.7 241.1) rotate(274.0)"/>';

/** A mill seal, drawn like a sack stencil. The lettered ring turns as the page scrolls. */
export function Promise() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-70, 70]);

  return (
    <section className="seal dark" id="promise" ref={ref}>
      <div className="pattern" aria-hidden="true" />
      <div className="wrap seal__grid">
        <div className="seal__mark" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            <defs>
              <filter id="seal-ink" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="grain" />
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" />
              </filter>
            </defs>
            <g filter="url(#seal-ink)" fill="none" stroke="currentColor">
              <circle cx="200" cy="200" r="194" strokeWidth="3" />
              <circle cx="200" cy="200" r="186" strokeWidth="1" />
              <circle cx="200" cy="200" r="134" strokeWidth="2.5" strokeDasharray="62 5" />
              <circle cx="200" cy="200" r="127" strokeWidth="1" />
              <g fill="currentColor" stroke="none" dangerouslySetInnerHTML={{ __html: WREATH }} />
              <g fill="currentColor" stroke="none" textAnchor="middle">
                <text className="seal__since" x="200" y="170">Product of</text>
                <text className="seal__year" x="200" y="226" fontSize="62">India</text>
                <path d="M200 252l6 6-6 6-6-6z" />
              </g>
            </g>
          </svg>
          <m.svg className="seal__ring" viewBox="0 0 400 400" style={{ rotate }}>
            <defs><path id="seal-path" d="M200 200m-152 0a152 152 0 1 1 304 0a152 152 0 1 1-304 0" /></defs>
            <text><textPath href="#seal-path" textLength="946">Aeroplane Basmati Rice • Aged eight months • La-Taste •</textPath></text>
          </m.svg>
        </div>

        <div className="seal__copy">
          <h2 className="display">One house, one name.</h2>
          <p className="lede">Every Aeroplane pack comes from the same house: Amir Chand Jagdish Kumar (Exports) Limited.</p>
          <p>Turn any pack over and you will find its FSSAI licence, 10012011000454, printed on the back.</p>
          <a className="btn btn--yellow" href="/#range">Shop the range</a>
        </div>
      </div>
    </section>
  );
}

const questions = [
  ['Which Aeroplane rice is best for biryani?', 'Basmati 1121 Steam. It is our extra-long grain, and it stays firm and separate through dum cooking. Classic Basmati works well too if you like a softer bite.'],
  ['Why does aged basmati cook better?', 'Resting dries the grain slowly and hardens its surface. Aged rice absorbs water evenly, lengthens instead of splitting, and comes out fluffy instead of sticky.'],
  ['How much water should I use?', 'For soaked basmati, one cup of rice to one and a half cups of water is a reliable start. Rinse first, soak for thirty minutes, and let the pot rest ten minutes before you lift the lid.'],
  ['How do I pay and get delivery?', 'Add packs to your cart here, then continue to the Aeroplane online shop to pay and choose delivery. The prices shown on this page are the shop\'s own.'],
  ['Where do I find the lot number?', 'On the back of every pack, beside the grain length and the months of ageing. Quote it if you ever write to us and we can trace the lot.'],
];

export function Faq() {
  return (
    <section className="faq light" id="faq">
      <div className="wrap faq__grid">
        <div className="faq__head">
          <h2 className="display">Before you cook.</h2>
          <p className="lede">The questions we are asked most, answered plainly.</p>
          <p><a className="btn" href="/#range">Shop the range</a></p>
        </div>
        <div className="faq__list">
          {questions.map(([question, answer], i) => (
            <details key={question} name="faq" open={i === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer dark">
      <div className="site-footer__land" aria-hidden="true">
        <div className="site-footer__paddy" />
      </div>
      <div className="site-footer__body">
        <div className="site-footer__badge">
          <img src={asset('/assets/brand/logo-primary-clear.png')} alt="La-Taste Aeroplane Basmati Rice" width={400} height={400} loading="lazy" />
        </div>
        <div className="pattern" aria-hidden="true" />
        <div className="wrap site-footer__grid">
          <p className="site-footer__line">Basmati, given time.</p>
          <nav className="site-footer__nav" aria-label="Footer">
            <div>
              <h2 className="label">Shop</h2>
              {shopCategories.map((c) => <a key={c.slug} href={`/shop/${c.slug}`}>{c.name}</a>)}
              <a href="/shop">All products</a>
            </div>
            <div>
              <h2 className="label">Cook</h2>
              <a href="/#kitchen">Recipes</a>
              <a href="/#table">The Indian table</a>
              <a href="/#faq">Cooking basmati</a>
            </div>
            <div>
              <h2 className="label">Company</h2>
              <a href="/#story">Our story</a>
              <a href="/company">The company</a>
              <a href="/company/infrastructure">Our mills</a>
              <a href="/company/certifications">Certifications</a>
              <a href="/investors">Investors</a>
              <a href="/careers">Careers</a>
              <a href="/contact">Contact</a>
            </div>
            <div>
              <h2 className="label">Help</h2>
              {policyPages.map((p) => <a key={p.path} href={p.path}>{p.nav}</a>)}
            </div>
          </nav>
        </div>
        <div className="wrap site-footer__base">
          <p>© 2026 Aeroplane Basmati Rice, from the house of Amir Chand Jagdish Kumar (Exports) Limited. FSSAI licence 10012011000454.</p>
          <p><a href="/#top">Back to top</a></p>
        </div>
      </div>
    </footer>
  );
}
