// Where else Aeroplane is sold. The logos are each company's own artwork (from Wikimedia Commons), shown unaltered.
// Beside a product, each link goes straight to that product's own listing, and a marketplace
// without one is left out. Elsewhere the links open the Aeroplane brand page, or a brand search
// where a marketplace has no brand page (see marketplace-links.ts).
import { brandPages, listingFor, type Shop } from '../marketplace-links';
import { asset } from '../host';

const marketplaces: { name: string; logo: Shop; search: (q: string) => string }[] = [
  { name: 'Amazon', logo: 'amazon', search: (q) => `https://www.amazon.in/s?k=${q}` },
  { name: 'Flipkart', logo: 'flipkart', search: (q) => `https://www.flipkart.com/search?q=${q}` },
  { name: 'Blinkit', logo: 'blinkit', search: (q) => `https://blinkit.com/s/?q=${q}` },
  { name: 'Zepto', logo: 'zepto', search: (q) => `https://www.zepto.com/search?query=${q}` },
];

const Out = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 16 17 7M9 7h8v8" />
  </svg>
);

/**
 * Links to the marketplaces. The full section sits on the home and shop pages; `compact` is the row
 * beside a product's buy buttons, and `hero` the light row over the opening film.
 */
export function Marketplaces({ query, productId, compact = false, hero = false }: { query: string; productId?: string; compact?: boolean; hero?: boolean }) {
  const q = encodeURIComponent(query);
  const shown = productId ? marketplaces.filter((shop) => listingFor(productId, shop.logo)) : marketplaces;
  if (!shown.length) return null;
  const links = shown.map((shop) => {
    const exact = productId ? listingFor(productId, shop.logo) : brandPages[shop.logo] ?? null;
    return (
    <li key={shop.name}>
      <a
        href={exact ?? shop.search(q)}
        target="_blank"
        rel="noopener"
        data-exact={exact ? '' : undefined}
      >
        {!compact && !hero && <span className="label">Shop on</span>}
        <img className={`markets__logo markets__logo--${shop.logo}`} src={asset(`/assets/marketplaces/${shop.logo}.svg`)} alt={shop.name} loading="lazy" />
        <Out />
        {/* spoken after what is shown, so the visible words stay at the front of the link's name */}
        <span className="sr">{productId ? `, buy ${query}` : `, ${query}`} (opens in a new tab)</span>
      </a>
    </li>
    );
  });

  if (compact || hero) {
    return (
      <div className={`markets markets--compact${hero ? ' markets--hero' : ''}`}>
        <p className="label">{hero ? 'Also on' : 'Or buy it on'}</p>
        <ul>{links}</ul>
      </div>
    );
  }
  return (
    <section className="markets light" aria-labelledby="markets-title">
      <div className="wrap">
        <h2 className="label" id="markets-title">Also on the apps you already use</h2>
        <ul>{links}</ul>
      </div>
    </section>
  );
}
