// Runs after the build. Search engines and link previews read the HTML before any script runs, so
// this writes a real page for every address on the site: its own title, description, canonical
// address, main heading and readable content, its breadcrumb trail and structured data. It also
// writes the "not found" page (served with a 404 status), the sitemap and robots.txt.
//
// The data comes from .seo-build/seo-data.js, compiled from the same files the site reads.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const data = await import(new URL('../.seo-build/seo-data.js', import.meta.url));
const { site, products, details, shopCategories, categoryByName, fullName, listingHighlights, productSeo, pages, allPages, policyPages, docGroups, crumbsFor, price } = data;

const template = readFileSync('dist/index.html', 'utf8');

// Each kind of page loads its own code after the main script. Naming it in the page lets the
// browser fetch both at once instead of one after the other.
const chunks = readdirSync('dist/assets').filter((f) => f.endsWith('.js'));
const chunk = (name) => chunks.filter((f) => f.startsWith(`${name}-`)).map((f) => `/assets/${f}`);
const codeFor = (path) =>
  path.startsWith('/products/') ? [...chunk('ProductPage'), ...chunk('Crumbs')]
    : path.startsWith('/shop') ? [...chunk('ShopPage'), ...chunk('Crumbs')]
      : path === '/investors' ? [...chunk('InvestorsPage'), ...chunk('investor-docs')]
        : path === '/' ? [] : [...chunk('CompanyPage'), ...chunk('Crumbs'), ...chunk('investor-docs')];
const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (value) => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
const abs = (path) => site.url + path;
const link = (path, text) => `<a href="${esc(path)}">${esc(text)}</a>`;
const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const skuFor = (id, size) => `${id}-${size}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');

// ---------- shared pieces ----------

const organisation = {
  '@type': 'Organization', '@id': abs('/#organization'), name: site.name, url: abs('/'),
  legalName: 'Amir Chand Jagdish Kumar (Exports) Limited',
  logo: abs('/assets/brand/logo-primary.png'),
  email: 'info@aeroplanerice.com',
  address: { '@type': 'PostalAddress', streetAddress: '2735/9, Mohan Lal Palace, Naya Bazar', addressLocality: 'Delhi', postalCode: '110006', addressRegion: 'Delhi', addressCountry: 'IN' },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+91-8595912447', email: 'info@aeroplanerice.com', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
    { '@type': 'ContactPoint', contactType: 'sales', telephone: '+91-8595912445', email: 'ecom@aeroplanerice.com', areaServed: 'IN' },
  ],
};

const breadcrumbs = (path) => {
  const trail = crumbsFor(path);
  return trail.length < 2 ? [] : [{
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: abs(crumb.path) })),
  }];
};
const crumbTrail = (path) => {
  const trail = crumbsFor(path);
  return trail.length < 2 ? '' : `<nav aria-label="Breadcrumb">${trail.map((c, i) => (i === trail.length - 1 ? esc(c.name) : link(c.path, c.name))).join(' / ')}</nav>`;
};

// every page carries the site's main links, so each one is a way in to the rest
const siteLinks = `<nav aria-label="Main">${[
  link('/', 'Home'), link('/shop', 'Shop'), ...shopCategories.map((c) => link(`/shop/${c.slug}`, c.name)),
  ...pages.map((p) => link(p.path, p.nav)), ...policyPages.map((p) => link(p.path, p.nav)),
].join(' · ')}</nav>`;

// Google Analytics 4, once a measurement id is set in src/site.json
const analytics = site.ga4
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4)}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(site.ga4)});</script>\n`
  : '';

const written = [];
function page({ path, title, description, image = '/assets/img/og.jpg', type = 'website', schema = [], body, index = true, file }) {
  const url = abs(path);
  const graph = [...schema, ...breadcrumbs(path)];
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${abs(image)}`)
    .replace(image.endsWith('og.jpg') ? /$^/ : /<meta property="og:image:(width|height)"[^>]*>\n/g, '')
    // only the home page preloads the banner it opens on
    .replace(path === '/' ? /$^/ : /<link rel="preload" as="image"[^>]*>\n/g, '')
    .replace('</head>', `${codeFor(path).map((f) => `<link rel="modulepreload" crossorigin href="${f}">\n`).join('')}<meta name="robots" content="${index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">\n${
      analytics}${graph.length ? json({ '@context': 'https://schema.org', '@graph': graph }) + '\n' : ''}</head>`)
    .replace('<div id="root"></div>', `<div id="root"><div style="max-width:60rem;margin:0 auto;padding:7rem 5vw">${siteLinks}<main>${crumbTrail(path)}${body}</main></div></div>`);
  const out = `dist/${file ?? (path === '/' ? 'index' : path.slice(1))}.html`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  if (index) written.push(path);
}

const productLink = (p) => `${link(`/products/${p.id}`, fullName(p))}, from ${price(Math.min(...p.variants.map((v) => v.price)))}`;

// ---------- home, shop and the category pages ----------

page({
  path: '/', title: site.title, description: site.description,
  schema: [organisation, { '@type': 'WebSite', '@id': abs('/#website'), name: site.name, url: abs('/'), publisher: { '@id': abs('/#organization') }, inLanguage: 'en-IN' }],
  body: `<h1>Aeroplane Basmati Rice: aged Indian basmati, rice and kitchen staples</h1><p>${esc(site.description)}</p>
<h2>Shop by category</h2>${list(shopCategories.map((c) => `${link(`/shop/${c.slug}`, c.name)}: ${esc(c.intro)}`))}
<h2>The range</h2>${list(products.map(productLink))}`,
});

const collection = (path, name, items) => ({
  '@type': 'CollectionPage', name, url: abs(path), isPartOf: { '@id': abs('/#website') },
  mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/products/${p.id}`), name: `Aeroplane ${fullName(p)}` })) },
});

page({
  path: '/shop', title: 'Shop Basmati Rice, Atta & Kitchen Staples Online | Aeroplane',
  description: `Every Aeroplane pack in one place: ${products.length} products across basmati, regional rice, speciality rice, gift baskets and kitchen staples, with free delivery across India.`,
  schema: [collection('/shop', 'Shop all Aeroplane products', products)],
  body: `<h1>Shop the range.</h1><p>Every Aeroplane pack, at today's shop prices. Choose a size and add it to your cart.</p>${
    shopCategories.map((c) => `<h2>${link(`/shop/${c.slug}`, c.name)}</h2>${list(products.filter((p) => p.category === c.name).map(productLink))}`).join('')}`,
});

for (const c of shopCategories) {
  const items = products.filter((p) => p.category === c.name);
  page({
    path: `/shop/${c.slug}`, title: c.seoTitle, description: c.seoDescription,
    schema: [collection(`/shop/${c.slug}`, c.name, items)],
    body: `<h1>${esc(c.heading)}</h1><p>${esc(c.intro)}</p><h2>${items.length} products</h2>${list(items.map(productLink))}
<p>Other categories: ${shopCategories.filter((o) => o !== c).map((o) => link(`/shop/${o.slug}`, o.name)).join(', ')}.</p>`,
  });
}

// ---------- products ----------

for (const product of products) {
  const info = details[product.id] ?? { short: '', paragraphs: [], highlights: [], gallery: [] };
  const name = fullName(product);
  const path = `/products/${product.id}`;
  const { title, description } = productSeo(product, info);
  const images = (info.gallery.length ? info.gallery.map((g) => g.src) : [product.image]).map(abs);
  const highlights = info.highlights.length ? info.highlights : listingHighlights[product.id] ?? [];
  const category = categoryByName(product.category);
  const shipping = {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 7, unitCode: 'DAY' },
    },
  };
  const offer = (v) => ({
    '@type': 'Offer', price: v.price, priceCurrency: 'INR', url: abs(path), itemCondition: 'https://schema.org/NewCondition',
    availability: `https://schema.org/${v.inStock ? 'InStock' : 'OutOfStock'}`, seller: { '@id': abs('/#organization') }, shippingDetails: shipping,
  });
  const common = {
    description: info.paragraphs[0] ?? description, image: images, brand: { '@type': 'Brand', name: 'Aeroplane' },
    category: product.category, countryOfOrigin: 'IN', manufacturer: { '@id': abs('/#organization') },
  };
  // one product with several pack sizes is a ProductGroup whose variants differ by size
  const schema = product.variants.length > 1
    ? {
      '@type': 'ProductGroup', '@id': abs(path) + '#product', name: `Aeroplane ${name}`, url: abs(path), productGroupID: product.id, variesBy: 'https://schema.org/size', ...common,
      hasVariant: product.variants.map((v) => ({ '@type': 'Product', name: `Aeroplane ${name}, ${v.size}`, sku: skuFor(product.id, v.size), size: v.size, image: images[0], offers: offer(v) })),
    }
    : { '@type': 'Product', '@id': abs(path) + '#product', name: `Aeroplane ${name}`, url: abs(path), sku: skuFor(product.id, product.variants[0].size), size: product.variants[0].size, ...common, offers: offer(product.variants[0]) };
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  page({
    path, title, description, image: product.image, type: 'product', schema: [organisation, schema],
    body: `<h1>${esc(name)}</h1><p>${link(`/shop/${category.slug}`, product.category)}</p>
<h2>Pack sizes and prices</h2>${list(product.variants.map((v) => `${esc(v.size)}: ${price(v.price)}${v.was > v.price ? ` (was ${price(v.was)})` : ''}${v.inStock ? '' : ', sold out'}`))}
${info.short ? `<p>${esc(info.short)}</p>` : ''}${info.paragraphs.length || highlights.length ? `<h2>About this pack</h2>${info.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}${highlights.length ? list(highlights.map(esc)) : ''}` : ''}
<h2>Details</h2>${list([
      `Brand: Aeroplane, by Amir Chand Jagdish Kumar (Exports) Ltd`, 'Country of origin: India',
      `Delivery: ${link('/shipping-policy', 'free across India')}, dispatched the next working day`, 'FSSAI licence: 10012011000454',
    ])}${related.length ? `<h2>More ${esc(product.category.toLowerCase())}</h2>${list(related.map(productLink))}` : ''}`,
  });
}

// ---------- company, investor and policy pages ----------

function blocks(items) {
  return items.map((b) => {
    switch (b.t) {
      case 'h': return `<h2>${esc(b.text)}</h2>`;
      case 'p': return `<p>${esc(b.text)}</p>`;
      case 'list': return list(b.items.map(esc));
      case 'stats': return list(b.items.map((s) => `${esc(s.n)}: ${esc(s.label)}`));
      case 'cards': return b.items.map((c) => `<h3>${esc(c.title)}</h3>${c.text ? `<p>${esc(c.text)}</p>` : ''}${c.points ? list(c.points.map(esc)) : ''}`).join('');
      case 'links': return list(b.items.map((l) => `${link(l.href, l.label)}${l.note ? `: ${esc(l.note)}` : ''}`));
      case 'places': return b.items.map((p) => `<h3>${esc(p.label)}</h3><address>${p.lines.map(esc).join('<br>')}</address>`).join('');
      case 'figures': return list(b.items.map((f) => esc(f.caption)));
      case 'docs': return (docGroups[b.section] ?? []).map((g) => `<h3>${esc(g.heading)}</h3>${list(g.docs.map((d) => link(`/assets/investors/${d.file}`, d.title)))}`).join('');
      default: return '';
    }
  }).join('\n');
}

for (const p of allPages) {
  const isContact = p.path === '/contact';
  page({
    path: p.path, title: p.seoTitle, description: p.seoDescription,
    schema: isContact ? [organisation, { '@type': 'ContactPage', name: p.seoTitle, url: abs(p.path), about: { '@id': abs('/#organization') } }] : [],
    body: `<h1>${esc(p.title.replace(/\.$/, ''))}</h1><p>${esc(p.lede)}</p>${blocks(p.blocks)}`,
  });
}

// ---------- not found, sitemap, robots ----------

page({
  path: '/404', file: '404', index: false, title: 'Page not found | Aeroplane Basmati Rice',
  description: 'This page does not exist. Shop the Aeroplane range or go back to the home page.',
  body: `<h1>We could not find that page.</h1><p>It may have moved, or the address may be mistyped.</p>${list([link('/shop', 'Shop the range'), link('/', 'Back to the home page')])}`,
});

const today = new Date().toISOString().slice(0, 10);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  written.map((path) => `  <url><loc>${abs(path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);

console.log(`seo: wrote ${written.length} pages, a 404 page, sitemap.xml and robots.txt`);
