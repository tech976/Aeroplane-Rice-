// Google Analytics 4 e-commerce events. The tag itself is added to every page by scripts/seo.mjs
// once a measurement id is set in src/site.json ("ga4": "G-XXXXXXX"); until then these do nothing.
import { fullName } from './catalog';
import type { Product } from './products';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export function item(product: Product, size: string, quantity = 1) {
  const variant = product.variants.find((v) => v.size === size) ?? product.variants[0];
  return { item_id: product.id, item_name: `Aeroplane ${fullName(product)}`, item_brand: 'Aeroplane', item_category: product.category, item_variant: variant.size, price: variant.price, quantity };
}

export function track(event: 'view_item' | 'select_item' | 'add_to_cart' | 'begin_checkout', items: ReturnType<typeof item>[]) {
  window.gtag?.('event', event, { currency: 'INR', value: items.reduce((sum, i) => sum + i.price * i.quantity, 0), items });
}
