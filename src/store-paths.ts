import { pages } from './company';

// Shopify answers only its own kinds of address: /products/…, /collections/…, /pages/…,
// /policies/…, /cart. Inside the theme, the site's own addresses are translated to those, so every
// page is a real store page (found, indexable) and not the 404 template. The app keeps working in
// its own addresses; only the address bar, the links Shopify sees and the canonical tags change.
//
//   /shop                   /collections/all
//   /shop/basmati           /collections/basmati            (a collection per category)
//   /company/leadership     /pages/company-leadership       (a page per company or investor page)
//   /privacy-policy         /policies/privacy-policy        (Shopify's own policy addresses)
//
// scripts/shopify-setup.mjs creates those collections, pages, policies and redirects in the store.

/** Shopify's four policy addresses, and the site's page for each. */
export const storePolicies = {
  '/privacy-policy': { handle: 'privacy-policy', type: 'PRIVACY_POLICY' },
  '/shipping-policy': { handle: 'shipping-policy', type: 'SHIPPING_POLICY' },
  '/cancellation-policy': { handle: 'refund-policy', type: 'REFUND_POLICY' },
  '/terms-and-conditions': { handle: 'terms-of-service', type: 'TERMS_OF_SERVICE' },
} as const;

/** The Shopify page handle for a company or investor page: /company/leadership is company-leadership. */
export const pageHandle = (path: string) => path.slice(1).replaceAll('/', '-');

const policyByHandle = new Map<string, string>(Object.entries(storePolicies).map(([path, p]) => [p.handle, path]));
const pageByHandle = new Map<string, string>(pages.map((p) => [pageHandle(p.path), p.path]));

/** The store's address for one of the site's own. Anything not listed is the same in both. */
export function toStore(path: string) {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/shop') return '/collections/all';
  const shop = clean.match(/^\/shop\/([^/]+)$/);
  if (shop) return `/collections/${shop[1]}`;
  if (clean in storePolicies) return `/policies/${storePolicies[clean as keyof typeof storePolicies].handle}`;
  if (pages.some((p) => p.path === clean)) return `/pages/${pageHandle(clean)}`;
  return path;
}

/** The site's own address for a store address, which is what the app draws pages from. */
export function fromStore(path: string) {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/collections' || clean === '/collections/all') return '/shop';
  const collection = clean.match(/^\/collections\/([^/]+)$/);
  if (collection) return `/shop/${collection[1]}`;
  // a product opened from a collection: /collections/basmati/products/<id>
  const product = clean.match(/^\/collections\/[^/]+(\/products\/[^/]+)$/);
  if (product) return product[1];
  const policy = clean.match(/^\/policies\/([^/]+)$/);
  if (policy) return policyByHandle.get(policy[1]) ?? clean;
  const page = clean.match(/^\/pages\/([^/]+)$/);
  if (page) return pageByHandle.get(page[1]) ?? clean;
  return clean;
}
