import { liveVariant, onShopify } from './host';
import type { Product, Variant } from './products';

// Subscribe and save. Inside the Shopify theme the options are the store's own selling plans, set
// up in a subscriptions app, and checkout bills the repeat orders. Elsewhere the site shows the
// same offer the Aeroplane online shop makes ("subscribe and save up to 10%"), and the cart hands
// over to that shop as usual.
export type Plan = { id: string; name: string; price: number };

export const SAVE = 10;
const CADENCES = [['2w', 'Every 2 weeks'], ['1m', 'Every month'], ['2m', 'Every 2 months']] as const;

export function plansFor(product: Product, variant: Variant): Plan[] {
  if (!variant.inStock) return [];
  if (onShopify) {
    return (liveVariant(product.id, variant.size)?.plans ?? []).map((plan) => ({ id: String(plan.id), name: plan.name, price: plan.price }));
  }
  if (product.category === 'Gifts and baskets') return [];
  return CADENCES.map(([id, name]) => ({ id, name, price: Math.round(variant.price * (1 - SAVE / 100)) }));
}

/** The best saving among a variant's plans, as a whole percentage. */
export function bestSaving(variant: Variant, plans: Plan[]) {
  if (!plans.length) return 0;
  return Math.round((1 - Math.min(...plans.map((p) => p.price)) / variant.price) * 100);
}
