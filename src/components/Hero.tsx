import { asset } from '../host';
import { Marketplaces } from './Marketplaces';

const WIDE = { small: '/assets/img/banner-wide-v3-s.webp', smallW: 1280, full: '/assets/img/banner-wide-v3.webp', fullW: 1930 };
const TALL = { small: '/assets/img/banner-9x16-v5-s.webp', smallW: 640, full: '/assets/img/banner-9x16-v5.webp', fullW: 941 };
const set = (b: typeof TALL) => `${asset(b.small)} ${b.smallW}w, ${asset(b.full)} ${b.fullW}w`;

/**
 * The opening: the campaign banner, edge to edge in what is left of the first screen under the bar.
 * Landscape screens get the wide banner and upright screens the tall one; the buttons sit over the
 * empty counter at its foot.
 */
export function Hero() {
  return (
    <section className="hero" id="top">
      <picture className="hero__banner">
        <source
          media="(max-aspect-ratio: 1/1)"
          srcSet={set(TALL)}
          sizes="100vw" width={941} height={1672}
        />
        <img
          src={asset(WIDE.full)}
          srcSet={set(WIDE)}
          sizes="100vw" width={1930} height={797} fetchPriority="high"
          alt="Aeroplane La-Taste basmati rice in green and blue bags, with Aeroplane maida, atta, sooji, salt, sugar and besan, on a wooden stand in a warm kitchen"
        />
      </picture>

      <div className="wrap hero__intro">
        <div>
          {/* read by search engines and screen readers; the banner says the rest */}
          <h1 className="hero__say">Aeroplane Basmati Rice: aged Indian basmati, rice and kitchen staples</h1>
          <p className="label">Four decades. Thirty-seven countries.</p>
        </div>
        <div className="hero__buy">
          <div className="hero__actions">
            <a className="btn btn--yellow" href="#range">Shop the range</a>
            <a className="btn btn--line" href="#heritage">Our heritage</a>
          </div>
          <Marketplaces query="Aeroplane basmati rice" hero />
        </div>
      </div>
    </section>
  );
}
