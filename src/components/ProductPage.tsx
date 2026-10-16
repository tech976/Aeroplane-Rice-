import { useEffect, useState } from 'react';
import { details } from '../product-details';
import { firstInStock, price, products, type Variant } from '../products';
import { Stepper, useCart } from './Cart';
import { ProductCard, Reasons } from './Range';
import { productSummary, setSeo } from '../seo';
import { Marketplaces } from './Marketplaces';
import { Band } from './ui';

/** Weight of a pack in kilograms, when the size says so plainly. */
function kilos(size: string) {
  if (size.includes('+')) return null;
  const match = size.match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  if (!match) return null;
  const count = Number(size.match(/^(\d+)\s*x/i)?.[1] ?? 1);
  return count * Number(match[1]) * (match[2].toLowerCase() === 'g' ? 0.001 : 1);
}
const perKilo = (variant: Variant) => {
  const weight = kilos(variant.size);
  return weight ? Math.round(variant.price / weight) : null;
};

const steps = [
  ['Rinse', 'Three times, until the water runs almost clear.'],
  ['Soak', 'Thirty minutes. The grain drinks before it cooks.'],
  ['Rest', 'Ten minutes off the heat, lid on. Then fluff with a fork.'],
];

export function ProductPage({ id }: { id: string }) {
  const product = products.find((p) => p.id === id);
  const { add } = useCart();
  const [size, setSize] = useState(product ? firstInStock(product).size : '');
  const [quantity, setQuantity] = useState(1);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    if (!product) { setSeo({ title: 'Product not found | Aeroplane Basmati Rice', path: `/products/${id}` }); return; }
    const lowest = Math.min(...product.variants.map((v) => v.price));
    setSeo({
      title: `${product.name} | Aeroplane Basmati Rice`,
      description: productSummary(product.name, product.variants.map((v) => v.size), price(lowest)),
      path: `/products/${product.id}`,
    });
  }, [product, id]);

  if (!product) {
    return (
      <main id="main" className="pdp pdp--missing light">
        <div className="wrap">
          <h1 className="display">We could not find that product.</h1>
          <p className="lede">It may have been renamed or taken off the shelf.</p>
          <a className="btn" href="/#range">Shop the range</a>
        </div>
      </main>
    );
  }

  const info = details[product.id];
  const gallery = info?.gallery.length ? info.gallery : [{ src: product.image, width: product.width, height: product.height }];
  const variant = product.variants.find((v) => v.size === size)!;
  const saving = Math.round((1 - variant.price / variant.was) * 100);
  const rates = product.variants.filter((v) => v.inStock).map(perKilo).filter((rate): rate is number => rate !== null);
  const best = rates.length > 1 ? Math.min(...rates) : null;
  const isBasmati = product.category === 'Basmati';
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const addToCart = () => { add(product.id, size, quantity); setQuantity(1); };

  return (
    <main id="main" className="pdp light">
      <section className="pdp__top">
        <p className="pdp__ghost" aria-hidden="true">{product.name}</p>
        <div className="wrap">
          <nav className="pdp__crumbs label" aria-label="Breadcrumb">
            <a href="/#range">Shop</a><span aria-hidden="true">/</span><span>{product.category}</span><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span>
          </nav>

          <div className="pdp__grid">
            <div className="pdp__gallery">
              <div className="pdp__frame">
                <img key={gallery[shot].src} src={gallery[shot].src} width={gallery[shot].width} height={gallery[shot].height} alt={`${product.name}, picture ${shot + 1} of ${gallery.length}`} fetchPriority="high" />
                {!variant.inStock ? <span className="product__flag product__flag--out">Sold out</span>
                  : saving > 0 && <span className="product__flag">Save {saving}%</span>}
              </div>
              {gallery.length > 1 && (
                <div className="pdp__thumbs" role="group" aria-label="Product pictures">
                  {gallery.map((image, i) => (
                    <button key={image.src} type="button" aria-pressed={i === shot} aria-label={`Show picture ${i + 1}`} onClick={() => setShot(i)}>
                      <img src={image.src} alt="" width={image.width} height={image.height} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pdp__buy">
              <p className="label pdp__category">{product.category}</p>
              <h1>{product.name}</h1>
              <p className="pdp__price">
                <b>{price(variant.price)}</b>
                {variant.was > variant.price && <s>{price(variant.was)}</s>}
                {perKilo(variant) !== null && <span>{price(perKilo(variant)!)} per kg</span>}
              </p>
              {info?.short && <p className="pdp__offer">{info.short}</p>}

              <fieldset className="pdp__sizes">
                <legend className="label">Pack size</legend>
                {product.variants.map((v) => (
                  <label key={v.size}>
                    <input type="radio" name="pdp-size" value={v.size} checked={v.size === size} onChange={() => setSize(v.size)} />
                    <span data-out={!v.inStock || undefined}>
                      <b>{v.size}</b>
                      <small>{!v.inStock ? 'Sold out' : price(v.price)}</small>
                      {v.inStock && best !== null && perKilo(v) === best && <em>Best value</em>}
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="pdp__actions">
                <Stepper value={quantity} onChange={(q) => setQuantity(Math.max(1, q))} label={`Quantity of ${product.name}`} />
                <button type="button" className="btn" disabled={!variant.inStock} onClick={addToCart}>{variant.inStock ? 'Add to cart' : 'Sold out'}</button>
                <a className="btn btn--line" href={product.url} target="_blank" rel="noopener">Buy now</a>
              </div>
              <p className="pdp__note">Buy now opens this product on the Aeroplane online shop, where payment and delivery are completed.</p>
              <Marketplaces query={`Aeroplane ${product.name}`} productId={product.id} compact />

              <dl className="pdp__facts">
                <div><dt className="label">Availability</dt><dd>{variant.inStock ? 'In stock' : 'Sold out in this size'}</dd></div>
                <div><dt className="label">Sizes</dt><dd>{product.variants.map((v) => v.size).join(', ')}</dd></div>
                <div><dt className="label">FSSAI licence</dt><dd>10012011000454</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {info && (info.paragraphs.length > 0 || info.highlights.length > 0) && (
        <section className="pdp__about">
          <div className="wrap pdp__about-grid">
            <h2 className="display">About this pack.</h2>
            <div>
              {info.paragraphs.map((text, i) => <p key={i} className={i === 0 ? 'lede' : undefined}>{text}</p>)}
              {info.highlights.length > 0 && (
                <ul className="pdp__points">
                  {info.highlights.map((text) => <li key={text}>{text}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {isBasmati && (
        <section className="pdp__cook dark">
          <div className="pattern" aria-hidden="true" />
          <div className="wrap">
            <h2 className="display">How to cook it.</h2>
            <ol>
              {steps.map(([name, text], i) => (
                <li key={name}><span aria-hidden="true">{i + 1}</span><h3>{name}</h3><p>{text}</p></li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {isBasmati && <div className="wrap pdp__reasons"><Reasons /></div>}

      <Band art="kitchen" tone="rice" />

      {related.length > 0 && (
        <section className="pdp__related">
          <div className="wrap">
            <div className="head">
              <h2 className="display">More {product.category.toLowerCase()}.</h2>
              <p><a className="btn btn--line" href="/#range">See the whole range</a></p>
            </div>
            <div className="products">
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        </section>
      )}

      <div className="shop-bar" data-shown="true">
        <p><b>{price(variant.price)}</b><span>{variant.size}</span></p>
        <button type="button" className="btn" disabled={!variant.inStock} onClick={addToCart}>{variant.inStock ? 'Add to cart' : 'Sold out'}</button>
      </div>
    </main>
  );
}
