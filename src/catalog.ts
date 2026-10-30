// How the catalogue is named and grouped for shoppers and search engines: one landing page per
// category, a descriptive name per product, and the titles and descriptions each page carries.
import { categories, price, type Product } from './products';

export type ShopCategory = { name: string; slug: string; heading: string; intro: string; seoTitle: string; seoDescription: string };

export const shopCategories: ShopCategory[] = [
  {
    name: 'Basmati', slug: 'basmati', heading: 'Basmati rice.',
    intro: 'Grown in the basmati belt at the foot of the Himalayas and rested for eight months before it is milled, so it cooks long, separate and fragrant. Extra-long 1121 grain for biryani, golden sella that holds its shape, and everyday basmati for dal chawal and pulao, in packs from 1 kg to 20 kg.',
    seoTitle: 'Basmati Rice – Buy Aged Basmati Rice Online | Aeroplane',
    seoDescription: 'Buy aged Aeroplane basmati rice online: 1121 extra-long grain, golden sella, classic and everyday basmati in 1 kg to 20 kg packs, rested eight months before milling.',
  },
  {
    name: 'Regional rice', slug: 'regional-rice', heading: 'Regional rice.',
    intro: 'Rice for the dishes that belong to a region: Sona Masoori for South Indian meals, Jirasar, and Wada Kolam for everyday cooking in Maharashtra.',
    seoTitle: 'Regional Rice – Sona Masoori, Jirasar & Wada Kolam | Aeroplane',
    seoDescription: 'Buy Aeroplane regional rice online: Premium Sona Masoori, Jirasar and Shree Ram Wada Kolam rice in 5 kg packs.',
  },
  {
    name: 'Speciality', slug: 'speciality', heading: 'Speciality rice.',
    intro: 'Rice for particular meals and kitchens: brown rice, diabetic rice, kheer rice, phirni mix and idli rice powder.',
    seoTitle: 'Speciality Rice – Brown, Diabetic & Kheer Rice | Aeroplane',
    seoDescription: 'Buy Aeroplane speciality rice online: Brown Prime rice, diabetic rice, kheer rice, phirni mix and idli rice powder.',
  },
  {
    name: 'Gifts and baskets', slug: 'gifts-and-baskets', heading: 'Gifts and baskets.',
    intro: 'Gift packs of Aeroplane basmati and kitchen baskets of rice and staples, put together for festivals and for families.',
    seoTitle: 'Rice Gift Packs & Kitchen Baskets | Aeroplane',
    seoDescription: 'Aeroplane basmati gift packs, festival rice combos and kitchen baskets of rice, atta and sugar, delivered across India.',
  },
  {
    name: 'Kitchen staples', slug: 'kitchen-staples', heading: 'Kitchen staples.',
    intro: 'Shudh chakki atta, maida, besan, sooji, sulphur-free sugar and iodised salt, packed with the same care as the rice.',
    seoTitle: 'Atta, Maida, Besan, Sooji, Sugar & Salt | Aeroplane Staples',
    seoDescription: 'Buy Aeroplane kitchen staples online: shudh chakki atta, maida, besan, sooji, sulphur-free sugar and iodised salt.',
  },
];

if (shopCategories.map((c) => c.name).join() !== categories.join()) throw new Error('catalog.ts and products.ts disagree on the categories');

export const categoryByName = (name: string) => shopCategories.find((c) => c.name === name);
export const categoryBySlug = (slug: string) => shopCategories.find((c) => c.slug === slug);
export const categoryPath = (name: string) => `/shop/${categoryByName(name)?.slug ?? ''}`;

// Names that say what the product is. Shelf names such as "Daily Prime" or "Maida" are fine on a
// card beside a picture, but a page title and its main heading should name the product outright.
const named: Record<string, string> = {
  '1121-extra-long-grain-rice': '1121 Steam Basmati Rice',
  '1121-spl-mongra-basmati-rice': 'Special Mogra Basmati Rice',
  'raw-la-taste-basmati-rice-diwali-gift-pa': 'Raw La-Taste Basmati Gift Pack',
  atta: 'Shudh Chakki Atta (Whole Wheat Flour)',
  maida: 'Maida (Refined Wheat Flour)',
  besan: 'Besan (Gram Flour)',
  sooji: 'Sooji (Semolina)',
  sugar: 'Sulphur-Free Sugar',
  salt: 'Iodised Salt',
};

export function fullName(product: Product) {
  if (named[product.id]) return named[product.id];
  const { name, category } = product;
  if (category === 'Basmati' && !/rice/i.test(name)) return /basmati/i.test(name) ? `${name} Rice` : `${name} Basmati Rice`;
  if (category === 'Regional rice' && !/rice/i.test(name)) return `${name} Rice`;
  return name;
}

// The brand's own description of products that have none in the shop export, as it appears on
// Aeroplane's Amazon and Zepto listings (checked October 2026).
export const listingHighlights: Record<string, string[]> = {
  'classic-basmati-rice': ['Extra long grain', 'Naturally aged and non-sticky', 'Rich aroma and fluffy grains', 'Ideal for biryani and pulao'],
  '1121-extra-long-grain-rice': ['Extra long 1121 grain, steamed', 'Naturally aged and non-sticky', 'Flavourful, with a rich, pleasant aroma', 'Made for biryani'],
  'super-basmati-rice': ['Perfectly aged', 'Long grain with a rich aroma'],
  'la-taste-golden-sela-basmati-rice': ['Perfectly aged', 'Extra long grain', 'Made for everyday cooking'],
  'gold-basmati-rice': ['Perfectly aged', 'Full long grain with a rich aroma', 'A special pulao rice'],
  'royal-basmati-rice': ['Perfectly aged', 'Long grain with a rich aroma'],
  'la-taste-sela-basmati-rice': ['Extra long grain', 'Naturally aged and non-sticky', 'Rich aroma', 'Ideal for biryani and daily cooking'],
  'rozana-premium-basmati-rice': ['Naturally aged long grain', 'Rich aroma', 'Non-sticky, fluffy grains', 'Everyday basmati rice'],
  'metro-basmati-rice': ['Perfectly aged', 'Long grain with a rich aroma'],
  '1121-spl-mongra-basmati-rice': ['Perfectly aged broken basmati', 'Rich aroma, soft and fragrant', 'Ideal for everyday cooking'],
  '1121-daily-basmati-rice': ['Perfectly aged long grain', 'Rich aroma', 'Fluffy, fragrant and tasty', 'Made for everyday use'],
  '1121-everyday-basmati-rice': ['Non-sticky and delicious', 'Made for daily meals'],
  '1121-regular-basmati-rice': ['Naturally aged long grain', 'Rich aroma', 'Non-sticky, fluffy grains', 'Made for everyday use'],
  'apple-basmati-rice': ['Perfectly aged', 'Long grain with a rich aroma'],
  sugar: ['White crystal sugar, free from sulphur', 'Fine texture'],
};

const clip = (text: string, length: number) => (text.length <= length ? text : `${text.slice(0, text.lastIndexOf(' ', length - 1))}…`);

export function productSeo(product: Product, info?: { short: string; paragraphs: string[]; highlights: string[] }) {
  const name = fullName(product);
  const sizes = product.variants.map((v) => v.size);
  const from = price(Math.min(...product.variants.map((v) => v.price)));
  const points = info?.highlights.length ? info.highlights : listingHighlights[product.id] ?? [];
  // the product's own name leads, so no two descriptions are alike even where the shop's words are
  // the sizes and the price always survive; the opening sentence is what gets shortened
  const tail = ` ${sizes.length > 1 ? 'Packs' : 'Pack'}: ${sizes.join(', ')}, from ${from}.`;
  const room = 158 - `Aeroplane ${name}: `.length - tail.length;
  const lead = clip(info?.paragraphs[0]
    ? info.paragraphs[0].replace(/^[A-Z\s]+:\s*/, '')
    : points.length ? `${points.slice(0, 3).join(', ')}.` : 'Packed by Aeroplane and delivered free across India.', Math.max(room, 40));
  const title = `Buy Aeroplane ${name} Online`;
  const range = sizes.length > 1 ? `${sizes[0]} to ${sizes[sizes.length - 1]}` : sizes[0];
  return {
    // the pack sizes are added only while the title still fits a search result
    title: `${title} | ${range}`.length <= 65 ? `${title} | ${range}` : title,
    description: `Aeroplane ${name}: ${lead}${tail}`,
  };
}
