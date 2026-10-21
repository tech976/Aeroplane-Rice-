import site from './site.json';
import { onShopify } from './host';

/** Keeps the page's title, description and canonical address right as the visitor moves between pages. */
export function setSeo({ title = site.title, description = site.description, path = '/' }: { title?: string; description?: string; path?: string } = {}) {
  // inside the Shopify theme the page belongs to the store's own address
  const url = (onShopify ? location.origin : site.url) + path;
  document.title = title;
  const set = (selector: string, attribute: string, value: string) => document.head.querySelector(selector)?.setAttribute(attribute, value);
  set('meta[name="description"]', 'content', description);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:url"]', 'content', url);
}

export function productSummary(name: string, sizes: string[], from: string) {
  return `${name} from Aeroplane, in ${sizes.join(', ')} packs, from ${from}. See pack sizes and prices, and add to your cart.`;
}
