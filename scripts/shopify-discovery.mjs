// Writes the theme's files for search engines and AI assistants into dist-shopify/:
//
//   templates/robots.txt.liquid   Shopify's own robots.txt rules, unchanged, plus our extra sitemap
//                                 and a pointer to the llms guide
//   assets/sitemap-aeroplane.xml  the store addresses Shopify's sitemap leaves out (the shop page,
//                                 the policies), listed in robots.txt beside Shopify's sitemap.xml
//   assets/llms.txt               a plain-text guide to Aeroplane for AI assistants (llmstxt.org)
//
// Shopify writes /sitemap.xml and /llms.txt itself and they cannot be replaced, so ours sit beside
// them. The company, investor and category pages are left out until the store has those pages
// (scripts/shopify-setup.mjs): until then their addresses answer 404, and a sitemap or guide must
// not list a page that is not there. Run with --with-store-pages once they exist.
//
// The data comes from .seo-build/seo-data.js, compiled from the same files the site reads.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) ?? 'dist-shopify';
const withStorePages = process.argv.includes('--with-store-pages');
const data = await import(pathToFileURL('.seo-build/seo-data.js').href);
const { site, products, shopCategories, fullName, allPages, policyPages, docGroups, toStore, questions, brandPages } = data;

const STORE = 'https://aeroplanerice.com';
const abs = (path) => STORE + toStore(path);
const write = (file, text) => { const path = join(OUT, file); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };

// investor files live in Shopify Files; Shopify drops a trailing - or _ from a name when uploading
const docUrl = (d) => (d.file.endsWith('.html')
  ? `https://aeroplane-rice.vercel.app/assets/investors/${d.file}`
  : `${STORE}/cdn/shop/files/${d.file.replace(/[-_]+(\.\w+)$/, '$1')}`);

const companyPages = allPages.filter((p) => !policyPages.includes(p));
// the policies the store has filled in (Settings > Policies); the others answer 404 until it does
const STORE_POLICIES = withStorePages ? policyPages.map((p) => p.path) : ['/privacy-policy'];
const livePolicies = policyPages.filter((p) => STORE_POLICIES.includes(p.path));
const pageEntry = (p) => ({ url: abs(p.path), title: p.title.replace(/\.$/, ''), note: p.seoDescription });

// ---------- sitemap-aeroplane.xml ----------

const extra = [
  abs('/shop'),
  ...livePolicies.map((p) => abs(p.path)),
  ...(withStorePages ? [...shopCategories.map((c) => abs(`/shop/${c.slug}`)), ...companyPages.filter((p) => p.path !== '/contact').map((p) => abs(p.path))] : []),
];
write('assets/sitemap-aeroplane.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Aeroplane Basmati Rice: store addresses that Shopify's own /sitemap.xml does not list.
     Written by scripts/shopify-discovery.mjs; listed in /robots.txt. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(extra)].map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`);

// ---------- robots.txt.liquid ----------

write('templates/robots.txt.liquid', `{%- comment -%}
  Written by scripts/shopify-discovery.mjs. Shopify's own rules come first, exactly as Shopify
  writes them (robots.default_groups); then the extra sitemap and the guide for AI assistants.
{%- endcomment -%}
{% for group in robots.default_groups %}
  {{- group.user_agent }}

  {%- for rule in group.rules -%}
    {{ rule }}
  {%- endfor -%}

  {%- if group.sitemap != blank -%}
    {{ group.sitemap }}
  {%- endif -%}
{% endfor %}
Sitemap: https:{{ 'sitemap-aeroplane.xml' | asset_url }}

# A guide to Aeroplane Basmati Rice for AI assistants: https:{{ 'llms.txt' | asset_url }}
`);

// ---------- llms.txt ----------

const sizes = (p) => p.variants.map((v) => v.size).join(', ');
const productLine = (p) => `- [Aeroplane ${fullName(p)}](${abs(`/products/${p.id}`)}): ${p.variants.length > 1 ? 'Packs' : 'Pack'}: ${sizes(p)}`;
const offer = docGroups.offer?.flatMap((g) => g.docs) ?? [];
// the filings people ask for: annual reports, financial statements, investor presentations
const reports = (docGroups.financials ?? []).flatMap((g) => g.docs).filter((d) => /annual report|financial statements|presentation/i.test(d.title));
const ratings = (docGroups.announcements ?? []).find((g) => /credit/i.test(g.heading))?.docs ?? [];
const contact = allPages.find((p) => p.path === '/contact');
const places = contact?.blocks.find((b) => b.t === 'places')?.items ?? [];

const llms = `# Aeroplane Basmati Rice

> ${site.description} Aeroplane is the brand of Amir Chand Jagdish Kumar (Exports) Limited, listed on the NSE and BSE.

- Company: Amir Chand Jagdish Kumar (Exports) Limited, which mills and ships basmati from the fields of Punjab and Haryana. Aeroplane is the brand on the sack.
- Website and online shop: ${STORE}/ (delivery across India; prices and stock are always the shop's own, on each product page)
- FSSAI licence: 10012011000454, printed on the back of every pack
- Also sold on: ${Object.keys(brandPages).map((k) => k[0].toUpperCase() + k.slice(1)).join(', ')}, and other marketplaces linked from each product page
- Contact: info@aeroplanerice.com (customer service, +91-8595912447), ecom@aeroplanerice.com (online orders and sales, +91-8595912445)

## Shop

- [All products](${abs('/shop')}): every Aeroplane pack, ${products.length} products
${shopCategories.map((c) => `\n## ${c.name}\n\n${c.intro}\n\n${products.filter((p) => p.category === c.name).map(productLine).join('\n')}`).join('\n')}
${withStorePages ? `
## Company and investors

${companyPages.map((p) => { const e = pageEntry(p); return `- [${e.title}](${e.url}): ${e.note}`; }).join('\n')}
` : ''}
## Investor documents

Amir Chand Jagdish Kumar (Exports) Limited is listed on the NSE and BSE. Key filings:

${[...offer, ...reports, ...ratings].map((d) => `- [${d.title}](${docUrl(d)})`).join('\n')}

## Frequently asked questions

${questions.map(([q, a]) => `- ${q} ${a}`).join('\n')}

## Policies

${policyPages.map((p) => `- ${livePolicies.includes(p) ? `[${p.title.replace(/\.$/, '')}](${abs(p.path)})` : p.title.replace(/\.$/, '')}: ${p.seoDescription}`).join('\n')}

## Offices

${places.map((p) => `- ${p.label}: ${p.lines.join(', ')}`).join('\n')}
`;
write('assets/llms.txt', llms);

console.log(`shopify-discovery: robots.txt.liquid, sitemap-aeroplane.xml (${new Set(extra).size} addresses) and llms.txt (${(llms.length / 1024).toFixed(1)} KB) written to ${OUT}/${withStorePages ? ', with the store pages' : ''}`);
