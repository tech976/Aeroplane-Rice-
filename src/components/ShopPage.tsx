import { useEffect } from 'react';
import { products } from '../products';
import { setSeo } from '../seo';
import { Range } from './Range';
import { Marketplaces } from './Marketplaces';
import { Band } from './ui';

export function ShopPage() {
  useEffect(() => {
    setSeo({
      title: 'Shop all Aeroplane rice and staples | Aeroplane Basmati Rice',
      description: `Every Aeroplane pack in one place — ${products.length} products across basmati, regional rice, speciality grains, gift baskets and kitchen staples. Choose a size and add it to your cart.`,
      path: '/shop',
    });
  }, []);

  return (
    <main id="main" className="shop-page light">
      <div className="wrap shop-page__head">
        <p className="page__crumb"><a href="/">Aeroplane</a> <span aria-hidden="true">/</span> Shop</p>
      </div>
      <Range />
      <Band art="kitchen" tone="rice" />
      <Marketplaces query="Aeroplane basmati rice" />
    </main>
  );
}
