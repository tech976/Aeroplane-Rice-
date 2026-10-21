import site from './site.json';

// Where the site is running. On Vercel and in development it serves its own files; inside the
// Shopify theme, layout/theme.liquid sets window.__AEROPLANE__ before this script loads, with the
// theme's asset address and the store's live variants.
// `plans` are the variant's subscription options (Shopify selling plans), with the subscribed price
export type LivePlan = { id: number; name: string; price: number };
export type LiveVariant = { id: number; size: string; price: number; was: number; available: boolean; plans: LivePlan[] };
type Bridge = { assetBase: string; version: string; variants: Record<string, LiveVariant[]> };

declare global {
  interface Window { __AEROPLANE__?: Bridge }
}

const bridge = typeof window === 'undefined' ? undefined : window.__AEROPLANE__;

/** True when the page is being served by the Shopify theme. */
export const onShopify = Boolean(bridge);

/**
 * The address of a file from /public/assets. Shopify keeps theme files in one flat folder, so
 * /assets/img/field.webp becomes img-field.webp there. The investor filings are too large for a
 * theme and stay on the main site.
 */
export function asset(path: string) {
  if (!bridge || !path.startsWith('/assets/')) return path;
  if (path.startsWith('/assets/investors/')) return site.url + path;
  // the version changes with every theme upload, so browsers never keep an old copy
  return `${bridge.assetBase}${path.slice('/assets/'.length).replaceAll('/', '-')}?v=${bridge.version}`;
}

/** The store's variant for a product and pack size, when the product has been imported. */
export function liveVariant(productId: string, size: string) {
  return bridge?.variants[productId]?.find((variant) => variant.size === size);
}

/** Finds which product and pack size a Shopify variant belongs to. */
export function fromVariantId(id: number) {
  for (const [productId, variants] of Object.entries(bridge?.variants ?? {})) {
    const variant = variants.find((v) => v.id === id);
    if (variant) return { productId, size: variant.size };
  }
  return undefined;
}
