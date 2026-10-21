// Runs after the build. Search engines and link previews read the HTML before any script runs,
// so this writes a real page for every product (title, description, structured data and readable
// content), plus the sitemap and robots file.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const site = JSON.parse(readFileSync('src/site.json', 'utf8'));
const between = (text, start, end) => text.slice(text.indexOf(start) + start.length, text.lastIndexOf(end));
const products = JSON.parse(between(readFileSync('src/products.ts', 'utf8').split('export const categories')[0], 'Product[] = ', ';'));
const details = JSON.parse(between(readFileSync('src/product-details.ts', 'utf8'), 'Details> = ', ';'));
const template = readFileSync('dist/index.html', 'utf8');

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rupees = (amount) => '₹' + amount.toLocaleString('en-IN');
const json = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function page({ title, description, path, image, type = 'website', data, body }) {
  const url = site.url + path;
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${site.url}${image}`)
    .replace(image.endsWith('og.jpg') ? /$^/ : /<meta property="og:image:(width|height)"[^>]*>\n/g, '')
    .replace('</head>', data.map(json).join('\n') + '\n</head>')
    .replace('<div id="root"></div>', `<div id="root"><div style="max-width:60rem;margin:0 auto;padding:7rem 5vw">${body}</div></div>`);
}

const organisation = {
  '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url,
  logo: site.url + '/assets/brand/logo-primary.png',
  parentOrganization: { '@type': 'Organization', name: 'Amir Chand Jagdish Kumar (Exports) Limited' },
};

// Homepage
writeFileSync('dist/index.html', page({
  title: site.title, description: site.description, path: '/', image: '/assets/img/og.jpg',
  data: [organisation, { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url }],
  body: `<h1>Aeroplane Basmati Rice</h1><p>${esc(site.description)}</p><h2>Shop the range</h2><ul>${
    products.map((p) => `<li><a href="/products/${p.id}">${esc(p.name)}</a>, from ${rupees(Math.min(...p.variants.map((v) => v.price)))}</li>`).join('')}</ul>`,
}));

// One page per product
mkdirSync('dist/products', { recursive: true });
for (const product of products) {
  const info = details[product.id] ?? { paragraphs: [], highlights: [], gallery: [] };
  const prices = product.variants.map((v) => v.price);
  const sizes = product.variants.map((v) => v.size);
  const description = `${product.name} from Aeroplane, in ${sizes.join(', ')} packs, from ${rupees(Math.min(...prices))}. See pack sizes and prices, and add to your cart.`;
  const path = `/products/${product.id}`;
  const images = (info.gallery.length ? info.gallery.map((g) => g.src) : [product.image]).map((src) => site.url + src);
  const inStock = product.variants.some((v) => v.inStock);
  writeFileSync(`dist/products/${product.id}.html`, page({
    title: `${product.name} | ${site.name}`, description, path, image: product.image, type: 'product',
    data: [
      {
        '@context': 'https://schema.org', '@type': 'Product', name: `Aeroplane ${product.name}`, image: images, category: product.category,
        description: info.paragraphs[0] ?? description, brand: { '@type': 'Brand', name: 'Aeroplane' }, url: site.url + path,
        offers: {
          '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length,
          availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`, url: site.url + path,
        },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Shop', item: site.url + '/#range' },
          { '@type': 'ListItem', position: 2, name: product.name, item: site.url + path },
        ],
      },
    ],
    body: `<p><a href="/">${esc(site.name)}</a></p><h1>${esc(product.name)}</h1><p>${esc(product.category)}. ${
      product.variants.map((v) => `${esc(v.size)}: ${rupees(v.price)}${v.inStock ? '' : ' (sold out)'}`).join(', ')}.</p>${
      info.paragraphs.map((text) => `<p>${esc(text)}</p>`).join('')}${
      info.highlights.length ? `<ul>${info.highlights.map((text) => `<li>${esc(text)}</li>`).join('')}</ul>` : ''}`,
  }));
}

const today = new Date().toISOString().slice(0, 10);
const addresses = ['/', ...products.map((p) => `/products/${p.id}`)];
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  addresses.map((path) => `  <url><loc>${site.url}${path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`seo: wrote ${products.length} product pages, sitemap.xml (${addresses.length} addresses) and robots.txt`);
