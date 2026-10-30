import site from './site.json';
import { onShopify } from './host';

/** Keeps the page's title, description and canonical address right as the visitor moves between pages. */
export function setSeo({ title = site.title, description = site.description, path = '/', index = true }: { title?: string; description?: string; path?: string; index?: boolean } = {}) {
  // inside the Shopify theme the page belongs to the store's own address
  const url = (onShopify ? location.origin : site.url) + path;
  document.title = title;
  const set = (selector: string, attribute: string, value: string) => document.head.querySelector(selector)?.setAttribute(attribute, value);
  set('meta[name="description"]', 'content', description);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:url"]', 'content', url);
  // pages that should stay out of search results, such as "not found", say so
  let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!index && !robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
  if (robots) robots.content = index ? 'index, follow' : 'noindex, follow';
}
