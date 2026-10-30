import { useEffect } from 'react';
import { categoryByName } from '../catalog';
import { products } from '../products';
import { setSeo } from '../seo';
import { Crumbs } from './Crumbs';
import { Range } from './Range';
import { Marketplaces } from './Marketplaces';
import { Band } from './ui';

/** /shop, and each category's landing page at /shop/<category>. */
export function ShopPage({ category = 'All' }: { category?: string }) {
  const landing = category === 'All' ? undefined : categoryByName(category);
  const path = landing ? `/shop/${landing.slug}` : '/shop';

  useEffect(() => {
    setSeo(landing
      ? { title: landing.seoTitle, description: landing.seoDescription, path }
      : {
        title: 'Shop Basmati Rice, Atta & Kitchen Staples Online | Aeroplane',
        description: `Every Aeroplane pack in one place: ${products.length} products across basmati, regional rice, speciality rice, gift baskets and kitchen staples, with free delivery across India.`,
        path,
      });
  }, [landing, path]);

  return (
    <main id="main" className="shop-page light">
      <div className="wrap shop-page__head">
        <Crumbs path={path} className="page__crumb" />
      </div>
      <Range key={category} page={category} />
      <Band art="kitchen" tone="rice" />
      <Marketplaces query="Aeroplane basmati rice" />
    </main>
  );
}
