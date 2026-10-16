// Where else Aeroplane is sold. The logos are each company's own artwork (from Wikimedia Commons), shown unaltered.
// Each link goes straight to that product's own listing where we hold the address
// (see marketplace-links.ts); otherwise it falls back to the marketplace's search.
import { listingFor, type Shop } from '../marketplace-links';

const marketplaces: { name: string; logo: Shop; search: (q: string) => string }[] = [
  { name: 'Amazon', logo: 'amazon', search: (q) => `https://www.amazon.in/s?k=${q}` },
  { name: 'Flipkart', logo: 'flipkart', search: (q) => `https://www.flipkart.com/search?q=${q}` },
  { name: 'Blinkit', logo: 'blinkit', search: (q) => `https://blinkit.com/s/?q=${q}` },
  { name: 'Zepto', logo: 'zepto', search: (q) => `https://www.zeptonow.com/search?query=${q}` },
];

const Out = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 16 17 7M9 7h8v8" />
  </svg>
);

/** A row of links to the marketplaces. `compact` is the small version used beside a product. */
export function Marketplaces({ query, productId, compact = false }: { query: string; productId?: string; compact?: boolean }) {
  const q = encodeURIComponent(query);
  const links = marketplaces.map((shop) => {
    const exact = listingFor(productId, shop.logo);
    return (
    <li key={shop.name}>
      <a
        href={exact ?? shop.search(q)}
        target="_blank"
        rel="noopener"
        data-exact={exact ? '' : undefined}
        aria-label={exact ? `Buy ${query} on ${shop.name} (opens in a new tab)` : `Find ${query} on ${shop.name} (opens in a new tab)`}
      >
        {!compact && <span className="label">{exact ? 'Buy on' : 'Search on'}</span>}
        <img className={`markets__logo markets__logo--${shop.logo}`} src={`/assets/marketplaces/${shop.logo}.svg`} alt={shop.name} loading="lazy" />
        <Out />
      </a>
    </li>
    );
  });

  if (compact) {
    return (
      <div className="markets markets--compact">
        <p className="label">Also find it on</p>
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
