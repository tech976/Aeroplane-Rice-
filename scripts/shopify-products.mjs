// Writes shopify/products.csv, for Shopify admin > Products > Import. Each product keeps its id as
// its handle, so /products/<id> is the same address on the site and in the store, and each pack
// size becomes a variant whose title is the size, which is how src/host.ts finds it again.
// Photographs are fetched by Shopify from the main site while importing.
import { readFileSync, writeFileSync } from 'node:fs';

const site = JSON.parse(readFileSync('src/site.json', 'utf8'));
const between = (text, start, end) => text.slice(text.indexOf(start) + start.length, text.lastIndexOf(end));
const products = JSON.parse(between(readFileSync('src/products.ts', 'utf8').split('export const categories')[0], 'Product[] = ', ';'));
const details = JSON.parse(between(readFileSync('src/product-details.ts', 'utf8'), 'Details> = ', ';'));

const COLUMNS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Variant Weight Unit', 'Image Src', 'Image Position', 'Image Alt Text', 'Status',
];

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cell = (value) => {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// the same reading of a pack size as kilos() in src/products.ts
function grams(size) {
  if (size.includes('+')) return '';
  const match = size.match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  if (!match) return '';
  const count = Number(size.match(/^(\d+)\s*x/i)?.[1] ?? 1);
  return Math.round(count * Number(match[1]) * (match[2].toLowerCase() === 'g' ? 1 : 1000));
}

function body(info) {
  if (!info) return '';
  return [
    info.short && `<p>${esc(info.short)}</p>`,
    ...info.paragraphs.map((p) => `<p>${esc(p)}</p>`),
    info.highlights.length && `<ul>${info.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`,
  ].filter(Boolean).join('\n');
}

const rows = [];
for (const product of products) {
  const info = details[product.id];
  const images = (info?.gallery.length ? info.gallery.map((g) => g.src) : [product.image]).map((src) => site.url + src);
  const sizes = product.variants.map((v) => v.size);
  if (new Set(sizes).size !== sizes.length) throw new Error(`${product.id} lists a pack size twice`);

  const count = Math.max(product.variants.length, images.length);
  for (let i = 0; i < count; i++) {
    const variant = product.variants[i];
    const first = i === 0;
    rows.push({
      'Handle': product.id,
      'Title': first ? product.name : '',
      'Body (HTML)': first ? body(info) : '',
      'Vendor': first ? 'Aeroplane' : '',
      'Type': first ? product.category : '',
      'Tags': first ? product.category : '',
      'Published': first ? 'TRUE' : '',
      'Option1 Name': first ? 'Size' : '',
      ...(variant && {
        'Option1 Value': variant.size,
        'Variant SKU': `${product.id}-${variant.size}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''),
        'Variant Grams': grams(variant.size),
        'Variant Weight Unit': 'kg',
        // packs in stock are sold without counting; sold-out packs are counted at zero
        'Variant Inventory Tracker': variant.inStock ? '' : 'shopify',
        'Variant Inventory Qty': variant.inStock ? '' : 0,
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': variant.price.toFixed(2),
        'Variant Compare At Price': variant.was > variant.price ? variant.was.toFixed(2) : '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
      }),
      ...(images[i] && { 'Image Src': images[i], 'Image Position': i + 1, 'Image Alt Text': `${product.name}, picture ${i + 1}` }),
      'Status': first ? 'active' : '',
    });
  }
}

writeFileSync('shopify/products.csv', [COLUMNS.join(','), ...rows.map((row) => COLUMNS.map((c) => cell(row[c])).join(','))].join('\n') + '\n');
console.log(`shopify: wrote shopify/products.csv, ${products.length} products and ${products.reduce((n, p) => n + p.variants.length, 0)} pack sizes`);
