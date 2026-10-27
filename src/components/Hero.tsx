import { asset } from '../host';
import { Marketplaces } from './Marketplaces';

const WIDE = { small: '/assets/img/banner-16x9-s.webp', smallW: 1280, full: '/assets/img/banner-16x9.webp', fullW: 1672 };
const TALL = { small: '/assets/img/banner-9x16-s.webp', smallW: 640, full: '/assets/img/banner-9x16.webp', fullW: 941 };
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
          sizes="100vw" width={1672} height={941} fetchPriority="high"
          alt="Two women in a warm, softly lit kitchen presenting Aeroplane sooji, maida, besan, atta, salt and sugar"
        />
      </picture>

      <div className="wrap hero__intro">
        <div>
          <p className="label">Aged Indian basmati</p>
          <h1 className="hero__say">Four decades.<br />Thirty-seven countries.</h1>
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
