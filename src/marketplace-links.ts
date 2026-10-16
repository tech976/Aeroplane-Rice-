// Exact marketplace listings, product by product.
//
// Flipkart links were each opened and confirmed against the live page title.
// Amazon blocks automated requests, so those ASINs come from search results and
// should be clicked through once before launch.
//
// Blinkit and Zepto serve a different catalogue per pin code and publish no stable
// public product address, so those two stay on search. A product with no entry
// here falls back to search on every platform — the link still works.

export type Shop = 'amazon' | 'flipkart' | 'blinkit' | 'zepto';

const amazon = (asin: string) => `https://www.amazon.in/dp/${asin}`;
const flipkart = (slug: string) => `https://www.flipkart.com/${slug}`;

export const listings: Record<string, Partial<Record<Shop, string>>> = {
  'gold-basmati-rice': {
    flipkart: flipkart('aeroplane-gold-basmati-rice-raw/p/itmfah7ezgqkfz5a'),
  },
  'classic-basmati-rice': {
    flipkart: flipkart('aeroplane-classic-basmati-rice-long-grain-raw/p/itmfaghgzftyrwa2'),
  },
  '1121-extra-long-grain-rice': {
    amazon: amazon('B09ZPN7P9S'),
    flipkart: flipkart('aeroplane-1121-basmati-rice-long-grain-steam/p/itmd68b844a3a7f8'),
  },
  'raw-la-taste-basmati-rice': {
    flipkart: flipkart('aeroplane-raw-la-taste-basmati-rice-long-grain-raw/p/itmfdk5ajhehrz7y'),
  },
  'royal-basmati-rice': {
    flipkart: flipkart('aeroplane-royal-basmati-rice-long-grain-polished/p/itmadc3a43a95982'),
  },
  'apple-basmati-rice': {
    flipkart: flipkart('aeroplane-premium-apple-basmati-rice-full-grain-raw/p/itm994b3e0a08aff'),
  },
  'metro-basmati-rice': {
    flipkart: flipkart('aeroplane-premium-metro-basmati-rice-full-grain-steam/p/itm5cd5b3f135e14'),
  },
  'rozana-premium-basmati-rice': {
    amazon: amazon('B07MKCWZJV'),
  },
  '1121-spl-mongra-basmati-rice': {
    amazon: amazon('B0C1ZM57ST'),
  },
  '1121-regular-basmati-rice': {
    amazon: amazon('B0BNKZ3RMN'),
  },
};

export const listingFor = (productId: string | undefined, shop: Shop) =>
  (productId ? listings[productId]?.[shop] : undefined) ?? null;
