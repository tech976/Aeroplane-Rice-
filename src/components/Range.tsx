import { useState } from 'react';
import { anyInStock, categories, firstInStock, lowestPrice, perKilo, price, products, type Product } from '../products';
import { useCart } from './Cart';
import { Img, Notch } from './ui';

// the brand's own six reasons, from its pack inserts
const reasons = [
  ['bowl', 'Made for daily cooking'],
  ['handi', 'Holds well after cooking'],
  ['paddy', 'Original rich aroma'],
  ['scatter', 'Non-sticky texture'],
  ['hands', 'Soft and tasty'],
  ['sack', 'Hygienically packed'],
] as const;

const FIRST = 8;

// The campaign photograph beside the heading, matched to the category in view
const SHELF = { photo: 'range-shelf', alt: 'Aeroplane Classic, Metro, La-Taste, Rozana, Apple, Royal and Brown rice packs on a wooden kitchen shelf' };
const scenes: Record<string, typeof SHELF> = {
  'Kitchen staples': { photo: 'range-staples', alt: 'Two women in a warm kitchen presenting Aeroplane sooji, maida, besan, atta, salt and sugar' },
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(firstInStock(product).size);
  const variant = product.variants.find((v) => v.size === size)!;
  const saving = Math.round((1 - variant.price / variant.was) * 100);

  return (
    <article className="product">
      <a className="product__shot" href={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} width={product.width} height={product.height} loading="lazy" decoding="async" />
        {!variant.inStock ? <span className="product__flag product__flag--out">Sold out</span>
          : saving > 0 && <span className="product__flag">Save {saving}%</span>}
      </a>

      <h3><a href={`/products/${product.id}`}>{product.name}</a></h3>
      <p className="product__price">
        <b>{price(variant.price)}</b>
        {variant.was > variant.price && <s>{price(variant.was)}</s>}
        {perKilo(variant) && <span className="product__rate">{price(perKilo(variant)!)}/kg</span>}
      </p>

      {product.variants.length > 1 ? (
        <fieldset className="sizes">
          <legend className="sr">Pack size</legend>
          {product.variants.map((v) => (
            <label key={v.size}>
              <input type="radio" name={`size-${product.id}`} value={v.size} checked={v.size === size} onChange={() => setSize(v.size)} />
              <span data-out={!v.inStock || undefined}>{v.size}</span>
            </label>
          ))}
        </fieldset>
      ) : <p className="product__one">{variant.size}</p>}

      <button type="button" className="btn btn--small product__add" disabled={!variant.inStock} onClick={() => add(product.id, size)}>
        {variant.inStock ? 'Add to cart' : 'Sold out'}
      </button>
    </article>
  );
}

export function Reasons() {
  return (
    <div className="reasons">
      <h3>Why aged Aeroplane rice</h3>
      <ul>
        {reasons.map(([icon, text]) => (
          <li key={text}><span className={`ico ico--${icon}`} aria-hidden="true" />{text}</li>
        ))}
      </ul>
    </div>
  );
}

export function Range() {
  const [category, setCategory] = useState('Basmati');
  const [all, setAll] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');

  const needle = query.trim().toLowerCase();
  const matching = products
    .filter((p) => (category === 'All' || p.category === category))
    .filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle))
    // sold-out packs always fall to the end, whatever the sort
    .sort((a, b) => {
      const stock = Number(anyInStock(b)) - Number(anyInStock(a));
      if (stock) return stock;
      if (sort === 'low') return lowestPrice(a) - lowestPrice(b);
      if (sort === 'high') return lowestPrice(b) - lowestPrice(a);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  const shown = all ? matching : matching.slice(0, FIRST);
  const scene = scenes[category] ?? SHELF;

  return (
    <section className="range light" id="range">
      <div className="wrap">
        <div className="head range__head">
          <div>
            <h2 className="display">Shop the range.</h2>
            <p className="lede">Every Aeroplane pack, at today's shop prices. Choose a size and add it to your cart.</p>
          </div>
          <figure className="range__scene frame">
            <Img key={scene.photo} name={scene.photo} alt={scene.alt} sizes="(min-width: 900px) 34vw, 100vw" />
            <Notch icon="sack" />
          </figure>
        </div>

        <div className="filters" role="group" aria-label="Filter products">
          {[...categories, 'All'].map((name) => (
            <button key={name} type="button" className="filters__pill" aria-pressed={name === category} onClick={() => { setCategory(name); setAll(false); }}>
              {name}
              <span>{name === 'All' ? products.length : products.filter((p) => p.category === name).length}</span>
            </button>
          ))}
        </div>

        <div className="shop-tools">
          <div className="shop-tools__search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" />
            </svg>
            <label className="sr" htmlFor="shop-search">Search the range</label>
            <input
              id="shop-search" type="search" placeholder="Search rice, atta, gifts…" value={query}
              onChange={(e) => { setQuery(e.target.value); setAll(false); }}
            />
            {query && <button type="button" className="shop-tools__clear" onClick={() => setQuery('')} aria-label="Clear search">&times;</button>}
          </div>

          <div className="shop-tools__sort">
            <label htmlFor="shop-sort">Sort</label>
            <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price, low to high</option>
              <option value="high">Price, high to low</option>
              <option value="name">Name, A to Z</option>
            </select>
          </div>

          <p className="shop-tools__count" aria-live="polite">
            {matching.length === 0 ? 'Nothing matches' : `Showing ${shown.length} of ${matching.length}`}
          </p>
        </div>

        {matching.length === 0 ? (
          <p className="shop-empty">
            No packs match “{query}”. <button type="button" className="btn btn--line btn--small" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button>
          </p>
        ) : (
          <div className="products" aria-live="polite">
            {shown.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {matching.length > FIRST && !all && (
          <p className="products__more"><button type="button" className="btn btn--line" onClick={() => setAll(true)}>Show all {matching.length}</button></p>
        )}

        <Reasons />
      </div>
    </section>
  );
}
