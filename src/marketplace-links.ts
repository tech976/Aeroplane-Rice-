// Exact marketplace listings, product by product, each checked against the listing's own title.
//
// A product page shows a marketplace only when the product has its own listing there, so every
// button opens that product. The home and shop pages are about the whole range: they open the
// Aeroplane brand page where the marketplace has one, and a search for the brand otherwise.

export type Shop = 'amazon' | 'flipkart' | 'bigbasket' | 'instamart' | 'blinkit' | 'zepto';

const amazon = (asin: string) => `https://www.amazon.in/dp/${asin}`;
const flipkart = (slug: string) => `https://www.flipkart.com/${slug}`;
const blinkit = (path: string) => `https://blinkit.com/prn/${path}`;
const zepto = (path: string) => `https://www.zepto.com/pn/${path}`;

// Checked October 2026. Many listings show as out of stock or unavailable at times; the page still
// belongs to the product. Where a marketplace names a product differently, the listing's own model
// name or pack confirms it (Amazon calls Daily Prime "Daily Basmati Rice Super", model AERO-1121
// Daily; Zepto calls Rozana Premium "Family Choice Rozana", model Premium).
export const listings: Record<string, Partial<Record<Shop, string>>> = {
  'raw-la-taste-basmati-rice': {
    amazon: amazon('B098X4DM3T'),
    flipkart: flipkart('aeroplane-raw-la-taste-basmati-rice-long-grain-raw/p/itmfdk5ajhehrz7y'),
  },
  'classic-basmati-rice': {
    amazon: amazon('B09DKMGF2G'),
    flipkart: flipkart('aeroplane-classic-basmati-rice-long-grain-raw/p/itmfaghgzftyrwa2'),
    zepto: zepto('aeroplane-premium-selected-classic-biryani-basmati-rice-soft-fluffy-non-sticky-long-grains-rice/pvid/f6e7dbe9-f637-471f-8675-b80d31ccf828'),
  },
  '1121-extra-long-grain-rice': {
    amazon: amazon('B09ZPN7P9S'),
    flipkart: flipkart('aeroplane-1121-basmati-rice-long-grain-steam/p/itmd68b844a3a7f8'),
    blinkit: blinkit('aeroplane-basmati-rice-extra-long-grain/prid/655126'),
    zepto: zepto('aeroplane-1121-basmati-rice/pvid/93a6dfaf-a5bc-4b54-bca8-9fa363cc974e'),
  },
  'super-basmati-rice': {
    amazon: amazon('B07YFY93KF'),
    zepto: zepto('aeroplane-super-basmati-rice/pvid/1362842b-71c3-4a1e-877a-c505d5c7c0e0'),
  },
  'la-taste-golden-sela-basmati-rice': {
    amazon: amazon('B07MKC9YYG'),
    flipkart: flipkart('aeroplane-prime-la-taste-golden-sela-5kg-basmati-rice-full-grain-steam/p/itmafcefba2d97ca'),
  },
  'gold-basmati-rice': {
    amazon: amazon('B0BNKZDL3C'),
    flipkart: flipkart('aeroplane-gold-basmati-rice-raw/p/itmfah7ezgqkfz5a'),
    blinkit: blinkit('aeroplane-gold-basmati-rice-long-grain/prid/655543'),
    zepto: zepto('aeroplane-gold-special-pulav-basmati-rice-full-long-grain-aged-rice/pvid/696b54ea-55b6-45fa-af87-16b1a0e2b80d'),
  },
  'royal-basmati-rice': {
    amazon: amazon('B0BNKZK6GW'),
    flipkart: flipkart('aeroplane-royal-basmati-rice-long-grain-polished/p/itmadc3a43a95982'),
    zepto: zepto('aeroplane-royal-basmati-rice/pvid/bc768980-ee6a-4e1a-9025-db62a8c53181'),
  },
  'la-taste-sela-basmati-rice': {
    amazon: amazon('B0BNKZLF7X'),
  },
  'rozana-premium-basmati-rice': {
    amazon: amazon('B0BNWY7CRZ'),
    blinkit: blinkit('aeroplane-rozana-basmati-rice-long-grain/prid/653648'),
    zepto: zepto('aeroplane-family-choice-rozana-basmati-rice-medium-grain-best-for-daily-meals/pvid/a95b2fc2-fcdc-4267-bbdf-7ed6f469cd4c'),
  },
  'metro-basmati-rice': {
    amazon: amazon('B0BNWX2KSK'),
    flipkart: flipkart('aeroplane-premium-metro-basmati-rice-full-grain-steam/p/itm5cd5b3f135e14'),
    zepto: zepto('aeroplane-metro-basmati-rice/pvid/2c074379-7b2e-4fa8-92b7-a2ea0ff0a382'),
  },
  'brown-rice': {
    amazon: amazon('B01A8BXLKQ'),
  },
  '1121-spl-mongra-basmati-rice': {
    amazon: amazon('B0C1ZM57ST'),
    zepto: zepto('aeroplane-special-mongra-rice/pvid/b83e3865-7130-498a-a117-8b17cd3ea4d1'),
  },
  '1121-daily-basmati-rice': {
    amazon: amazon('B0BNKZRPMN'),
    flipkart: flipkart('aeroplane-daily-world-s-finest-rice-steam-medium-grain-steam/p/itmb784fa7fa171d'),
    zepto: zepto('aeroplane-daily-choice-basmati-rice-fluffy-fragrant-tasty/pvid/78b70205-cc5a-41d3-8a97-c2a3a1a5e08c'),
  },
  '1121-everyday-basmati-rice': {
    amazon: amazon('B0BNKZ1Z17'),
  },
  '1121-regular-basmati-rice': {
    amazon: amazon('B0BNKXLM24'),
    flipkart: flipkart('aeroplane-premium-1121-regular-basmati-rice-full-grain-steam/p/itme8bd5be3cd289'),
    zepto: zepto('aeroplane-regular-prime-basmati-rice/pvid/a64a3e0f-78ae-42c9-8f27-7614526c02c2'),
  },
  'rozana-green-basmati-rice': {
    amazon: amazon('B07YDY8115'),
  },
  'apple-basmati-rice': {
    amazon: amazon('B0BNWXJGBY'),
    flipkart: flipkart('aeroplane-premium-apple-basmati-rice-full-grain-raw/p/itm994b3e0a08aff'),
  },
  'diabetic-rice': {
    amazon: amazon('B0DHZSN4YP'),
  },
  'atta': {
    amazon: amazon('B0BNXHYGZ9'),
  },
  'maida': {
    amazon: amazon('B09XJ3FKXW'),
  },
  'besan': {
    amazon: amazon('B0BP1F2Z7M'),
  },
  'sugar': {
    amazon: amazon('B0BNXNKJ2S'),
  },
};

/** The Aeroplane brand page on each marketplace, where it has one. */
// Flipkart's brand page hides out-of-stock packs unless asked, and most Aeroplane packs there are
// out of stock, so the link asks. Blinkit publishes no brand page.
export const brandPages: Partial<Record<Shop, string>> = {
  amazon: 'https://www.amazon.in/stores/AeroplaneBasmatiRice/page/7A17F492-BB81-439A-98F4-9CFAC76AF2D0',
  flipkart: 'https://www.flipkart.com/food-products/rice/aeroplane~brand/pr?sid=eat,yul&p%5B%5D=facets.availability%255B%255D%3DInclude%2BOut%2Bof%2BStock',
  zepto: 'https://www.zepto.com/brand/aeroplane',
};

export const listingFor = (productId: string | undefined, shop: Shop) =>
  (productId ? listings[productId]?.[shop] : undefined) ?? null;
