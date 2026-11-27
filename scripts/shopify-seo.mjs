// Writes snippets/aeroplane-seo.liquid into the Shopify theme: the title, description, social
// preview tags and structured data (JSON-LD) for every page, in the HTML Shopify sends. Search
// engines and link previews (Facebook, LinkedIn, X) read that HTML without running the app, so it
// has to carry the same title and description the app sets once it starts (src/seo.ts).
//
// Pages are matched by their store address (/collections/basmati, /pages/company): Shopify serves an
// address it has no page for as /404, so the store must have those pages and collections
// (scripts/shopify-setup.mjs). Product prices and stock come from Shopify as the page is served.
//
// The data comes from .seo-build/seo-data.js, compiled from the same files the site reads.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = process.argv[2] ?? 'dist-shopify/snippets/aeroplane-seo.liquid';
const data = await import(pathToFileURL('.seo-build/seo-data.js').href);
const { site, products, details, shopCategories, categoryByName, fullName, productSeo, allPages, crumbsFor, toStore, questions, brandPages } = data;

const STORE = 'https://aeroplanerice.com';
const abs = (path) => STORE + toStore(path);
const SITE_NAME = site.name;

// Liquid would read {{ or {% inside the fixed text as its own; none of the site's words have them
const json = (value) => {
  const text = JSON.stringify(value).replace(/</g, '\\u003c');
  if (/\{\{|\{%/.test(text)) throw new Error(`Liquid markers in ${text.slice(0, 80)}`);
  return text;
};
// a Liquid string literal: single quotes unless the words have one
const lit = (text) => {
  if (!text.includes("'")) return `'${text}'`;
  if (!text.includes('"')) return `"${text}"`;
  return `'${text.replaceAll("'", '’')}'`;
};

// ---------- shared pieces ----------

const ORG_ID = `${STORE}/#organization`;
const organisationData = `{"@type":"Organization","@id":${json(ORG_ID)},"name":${json(SITE_NAME)},"legalName":"Amir Chand Jagdish Kumar (Exports) Limited","url":${json(STORE + '/')},"logo":"https:{{ 'brand-logo-primary.png' | asset_url }}","email":"info@aeroplanerice.com",${json({
  address: { '@type': 'PostalAddress', streetAddress: '2735/9, Mohan Lal Palace, Naya Bazar', addressLocality: 'Delhi', postalCode: '110006', addressRegion: 'Delhi', addressCountry: 'IN' },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+91-8595912447', email: 'info@aeroplanerice.com', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
    { '@type': 'ContactPoint', contactType: 'sales', telephone: '+91-8595912445', email: 'ecom@aeroplanerice.com', areaServed: 'IN' },
  ],
  identifier: { '@type': 'PropertyValue', propertyID: 'FSSAI licence', value: '10012011000454' },
  sameAs: Object.values(brandPages),
}).slice(1, -1)}}`;
// written once at the top of the snippet and reused by every page's data
const organisation = '{{ seo_org }}';

const website = json({ '@type': 'WebSite', '@id': `${STORE}/#website`, name: SITE_NAME, url: `${STORE}/`, publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' });

const breadcrumbs = (path) => {
  const trail = crumbsFor(path);
  return trail.length < 2 ? [] : [json({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: abs(crumb.path) })),
  })];
};

const graph = (parts) => `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[${parts.join(',')}]}</script>`;

const collection = (path, name, items) => json({
  '@type': 'CollectionPage', name, url: abs(path), isPartOf: { '@id': `${STORE}/#website` },
  mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/products/${p.id}`), name: `Aeroplane ${fullName(p)}` })) },
});

// ---------- every page: its addresses, words and data ----------

/** @type {{ keys: string[], title: string, description: string, imageAlt?: string, schema: string }[]} */
const entries = [];
const add = (path, title, description, schema, imageAlt) => {
  const keys = [toStore(path)];
  entries.push({ keys, title, description, schema, imageAlt });
};

add('/', site.title, site.description, graph([organisation, website, json({
  '@type': 'FAQPage', '@id': `${STORE}/#faq`,
  mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})]), 'Aeroplane basmati rice and kitchen staples from the house of Aeroplane');

add('/shop', 'Shop Basmati Rice, Atta & Kitchen Staples Online | Aeroplane',
  `Every Aeroplane pack in one place: ${products.length} products across basmati, regional rice, speciality rice, gift baskets and kitchen staples.`,
  graph([organisation, collection('/shop', 'Shop all Aeroplane products', products), ...breadcrumbs('/shop')]));

for (const c of shopCategories) {
  const path = `/shop/${c.slug}`;
  add(path, c.seoTitle, c.seoDescription, graph([organisation, collection(path, c.name, products.filter((p) => p.category === c.name)), ...breadcrumbs(path)]));
}

const shippingData = json({
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 7, unitCode: 'DAY' },
  },
});

for (const product of products) {
  const info = details[product.id] ?? { short: '', paragraphs: [], highlights: [], gallery: [] };
  const path = `/products/${product.id}`;
  const url = abs(path);
  const name = `Aeroplane ${fullName(product)}`;
  const { title, description } = productSeo(product, info);
  // prices, stock and pictures are Shopify's own, read as the page is served
  const offer = `{"@type":"Offer","price":{{ v.price | divided_by: 100.0 | json }},"priceCurrency":{{ cart.currency.iso_code | json }},"url":{{ v.url | prepend: request.origin | json }},"itemCondition":"https://schema.org/NewCondition","availability":"https://schema.org/{% if v.available %}InStock{% else %}OutOfStock{% endif %}","seller":{"@id":${json(ORG_ID)}},"shippingDetails":{{ seo_shipping }}}`;
  const sku = `{%- if v.sku != blank -%}{{ v.sku | json }}{%- else -%}{{ product.handle | append: '-' | append: v.title | handleize | json }}{%- endif -%}`;
  const images = `[{%- for image in product.images limit: 8 -%}"https:{{ image | image_url: width: 1200 }}"{%- unless forloop.last -%},{%- endunless -%}{%- endfor -%}]`;
  const common = `"description":${json(info.paragraphs[0] ?? description)},"image":${images},"brand":{"@type":"Brand","name":"Aeroplane"},"category":${json(product.category)},"countryOfOrigin":"IN","manufacturer":{"@id":${json(ORG_ID)}}`;
  const item = `{%- if product.variants.size > 1 -%}`
    + `{"@type":"ProductGroup","@id":${json(url + '#product')},"name":${json(name)},"url":${json(url)},"productGroupID":${json(product.id)},"variesBy":"https://schema.org/size",${common},"hasVariant":[`
    + `{%- for v in product.variants -%}{"@type":"Product","name":{{ ${lit(name + ', ')} | append: v.title | json }},"sku":${sku},"size":{{ v.title | json }},"image":{{ v.image | default: product.featured_image | image_url: width: 1200 | prepend: 'https:' | json }},"offers":${offer}}{%- unless forloop.last -%},{%- endunless -%}{%- endfor -%}]}`
    + `{%- else -%}{%- assign v = product.selected_or_first_available_variant -%}`
    + `{"@type":"Product","@id":${json(url + '#product')},"name":${json(name)},"url":${json(url)},"sku":${sku},"size":{{ v.title | json }},${common},"offers":${offer}}`
    + `{%- endif -%}`;
  add(path, title, description, `{%- if product -%}${graph([organisation, item, ...breadcrumbs(path)])}{%- endif -%}`, `${name}, pack`);
}

for (const p of allPages) {
  const schema = p.path === '/contact'
    ? graph([organisation, json({ '@type': 'ContactPage', name: p.seoTitle, url: abs(p.path), about: { '@id': ORG_ID } }), ...breadcrumbs(p.path)])
    : graph([organisation, ...breadcrumbs(p.path)]);
  add(p.path, p.seoTitle, p.seoDescription, schema);
}

for (const e of entries) {
  if (e.description.length > 160) console.warn(`shopify-seo: description over 160 characters for ${e.keys[0]} (${e.description.length})`);
}

// ---------- the snippet ----------

const whens = (fn) => entries.map((e) => `    when ${e.keys.map(lit).join(', ')}\n${fn(e)}`).join('\n');
// the same as separate tags, for the case that writes the data outside the {% liquid %} block
const whenTags = (fn) => entries.map((e) => `{%- when ${e.keys.map(lit).join(', ')} -%}\n${fn(e)}`).join('\n');

const snippet = `{%- comment -%}
  Written by scripts/shopify-seo.mjs from the site's own data: edit the data in /src, not this file.
  The page's title, description, social preview tags and structured data, matched by its address.
  Rendered in the <head> by layout/theme.liquid.
{%- endcomment -%}
{%- liquid
  case template.name
    when 'index'
      assign seo_key = '/'
    when 'product'
      assign seo_key = '/products/' | append: product.handle
    when 'collection'
      assign seo_key = '/collections/' | append: collection.handle
    when 'page'
      assign seo_key = '/pages/' | append: page.handle
    else
      assign seo_key = request.path
  endcase

  if template.name == 'index'
    assign seo_title = ${lit(site.title)}
  else
    assign seo_title = page_title | append: ' | ${SITE_NAME}'
  endif
  assign seo_description = page_description | default: ${lit(site.description)}
  assign seo_image_alt = ${lit(SITE_NAME)}

  case seo_key
${whens((e) => `      assign seo_title = ${lit(e.title)}\n      assign seo_description = ${lit(e.description)}${e.imageAlt ? `\n      assign seo_image_alt = ${lit(e.imageAlt)}` : ''}`)}
  endcase

  if template.name == 'product' and product.featured_image
    assign seo_image = product.featured_image | image_url: width: 1200 | prepend: 'https:'
  else
    assign seo_image = 'img-og.jpg' | asset_url | prepend: 'https:'
  endif
-%}
<title>{{ seo_title | escape }}</title>
<meta name="description" content="{{ seo_description | escape }}">
<link rel="canonical" href="{{ canonical_url }}">
<meta property="og:type" content="{% if template.name == 'product' %}product{% else %}website{% endif %}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="{{ seo_title | escape }}">
<meta property="og:description" content="{{ seo_description | escape }}">
<meta property="og:image" content="{{ seo_image }}">
{%- unless template.name == 'product' and product.featured_image %}
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
{%- endunless %}
<meta property="og:image:alt" content="{{ seo_image_alt | escape }}">
{%- if template.name == 'product' and product %}
<meta property="product:price:amount" content="{{ product.price | divided_by: 100.0 }}">
<meta property="product:price:currency" content="{{ cart.currency.iso_code }}">
{%- endif %}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ seo_title | escape }}">
<meta name="twitter:description" content="{{ seo_description | escape }}">
<meta name="twitter:image" content="{{ seo_image }}">
<meta name="twitter:image:alt" content="{{ seo_image_alt | escape }}">
{%- capture seo_org -%}${organisationData}{%- endcapture -%}
{%- capture seo_shipping -%}${shippingData}{%- endcapture -%}
{%- case seo_key -%}
${whenTags((e) => e.schema)}
{%- endcase -%}
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, snippet);
console.log(`shopify-seo: wrote ${out} (${entries.length} pages, ${(snippet.length / 1024).toFixed(0)} KB)`);
