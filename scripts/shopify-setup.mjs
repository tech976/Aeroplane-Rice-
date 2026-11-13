// Prepares everything a new Shopify store needs besides the theme, into shopify-setup/:
//
//   products.csv     every product and pack size      Products > Import
//   redirects.csv    the site's addresses → store's   Online Store > Navigation > URL redirects > Import
//   pages/*.html     one Shopify page per company and investor page (handle = file name)
//   policies/*.html  the four policies                Settings > Policies
//   collections.json a smart collection per category  Products > Collections
//
// With --apply it also creates the pages, collections, policies and redirects in the store through
// the Admin API (it never changes or deletes anything already there):
//
//   npm run shopify:setup -- --apply --store your-store.myshopify.com
//
// It needs an Admin API token in SHOPIFY_ADMIN_TOKEN, or an app's SHOPIFY_CLIENT_ID and
// SHOPIFY_CLIENT_SECRET, set in the shell or in .env.shopify (kept out of git). README.md says how.
// Run after `npm run build`: the page and policy text is taken from the static pages in dist/.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'shopify-setup';
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2026-07';
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const store = (args[args.indexOf('--store') + 1] ?? process.env.SHOPIFY_STORE ?? '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

if (!existsSync('dist/index.html') || !existsSync('.seo-build/seo-data.js')) throw new Error('Run `npm run build` first: the page text comes from dist/.');
const { site, pages, policyPages, shopCategories, toStore, pageHandle, storePolicies } = await import(pathToFileURL('.seo-build/seo-data.js').href);
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

// ---------- the words of each page, from its static copy in dist/ ----------

/** The page's main text, with its links turned into store addresses. */
function text(path) {
  const html = readFileSync(`dist${path}.html`, 'utf8');
  const main = html.slice(html.indexOf('<main>') + 6, html.indexOf('</main>'))
    .replace(/<nav aria-label="Breadcrumb">.*?<\/nav>/s, '');
  return main.replace(/href="([^"]+)"/g, (_, href) => {
    if (href.startsWith('/assets/')) return `href="${site.url}${href}"`;
    if (!href.startsWith('/')) return `href="${href}"`;
    const [path, hash = ''] = href.split('#');
    return `href="${toStore(path || '/')}${hash ? `#${hash}` : ''}"`;
  });
}

const csv = (rows) => rows.map((row) => row.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(',')).join('\n') + '\n';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/pages`, { recursive: true });
mkdirSync(`${OUT}/policies`, { recursive: true });

execSync('node scripts/shopify-products.mjs', { stdio: 'inherit' });

const storePages = pages.map((p) => ({
  handle: pageHandle(p.path), title: p.nav,
  seoTitle: p.seoTitle, seoDescription: p.seoDescription, body: text(p.path),
}));
for (const p of storePages) writeFileSync(`${OUT}/pages/${p.handle}.html`, p.body);

const policies = policyPages.map((p) => ({ ...storePolicies[p.path], title: p.title.replace(/\.$/, ''), body: text(p.path) }));
for (const p of policies) writeFileSync(`${OUT}/policies/${p.handle}.html`, p.body);

const collections = shopCategories.map((c) => ({
  handle: c.slug, title: c.heading.replace(/\.$/, ''), description: c.intro, seoTitle: c.seoTitle, seoDescription: c.seoDescription,
  rule: { column: 'TYPE', relation: 'EQUALS', condition: c.name },
}));
writeFileSync(`${OUT}/collections.json`, JSON.stringify(collections, null, 2) + '\n');

// every address the site has used, and the old addresses Vercel already redirects
const redirects = new Map();
for (const p of [...pages, ...policyPages]) redirects.set(p.path, toStore(p.path));
redirects.set('/shop', toStore('/shop'));
for (const c of shopCategories) redirects.set(`/shop/${c.slug}`, toStore(`/shop/${c.slug}`));
for (const r of vercel.redirects ?? []) redirects.set(r.source, toStore(r.destination));
writeFileSync(`${OUT}/redirects.csv`, csv([['Redirect from', 'Redirect to'], ...redirects]));

console.log(`shopify-setup: ${storePages.length} pages, ${policies.length} policies, ${collections.length} collections, ${redirects.size} redirects written to ${OUT}/`);

if (!apply) process.exit(0);

// ---------- --apply: create them in the store ----------

if (!/^[a-z0-9-]+\.myshopify\.com$/.test(store)) throw new Error('Give the store as --store your-store.myshopify.com');
if (existsSync('.env.shopify')) process.loadEnvFile('.env.shopify');

async function token() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const { SHOPIFY_CLIENT_ID: id, SHOPIFY_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error('Set SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (see README.md).');
  const response = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!response.ok) throw new Error(`Shopify refused the app's credentials (${response.status}): ${await response.text()}`);
  return (await response.json()).access_token;
}

const access = await token();
async function admin(query, variables = {}) {
  const response = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': access },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.errors) throw new Error(`Admin API ${response.status}: ${JSON.stringify(result.errors ?? result)}`);
  return result.data;
}
const failed = (step, errors) => { if (errors?.length) throw new Error(`${step}: ${errors.map((e) => e.message).join('; ')}`); };

const existing = await admin(`{
  pages(first: 250) { nodes { handle } }
  collections(first: 250) { nodes { handle } }
  urlRedirects(first: 250) { nodes { path } }
  publications(first: 50) { nodes { id name } }
}`);
const have = {
  pages: new Set(existing.pages.nodes.map((n) => n.handle)),
  collections: new Set(existing.collections.nodes.map((n) => n.handle)),
  redirects: new Set(existing.urlRedirects.nodes.map((n) => n.path)),
};
const onlineStore = existing.publications.nodes.find((n) => n.name === 'Online Store');

const seo = (title, description) => [
  { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: title },
  { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field', value: description },
];

for (const p of storePages) {
  if (have.pages.has(p.handle)) { console.log(`  page ${p.handle}: already there`); continue; }
  const { pageCreate } = await admin(`mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { handle } userErrors { message } } }`, {
    page: { title: p.title, handle: p.handle, body: p.body, isPublished: true, metafields: seo(p.seoTitle, p.seoDescription) },
  });
  failed(`page ${p.handle}`, pageCreate.userErrors);
  console.log(`  page /pages/${pageCreate.page.handle}: created`);
}

for (const c of collections) {
  if (have.collections.has(c.handle)) { console.log(`  collection ${c.handle}: already there`); continue; }
  const { collectionCreate } = await admin(`mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle } userErrors { message } } }`, {
    input: {
      title: c.title, handle: c.handle, descriptionHtml: `<p>${c.description}</p>`,
      seo: { title: c.seoTitle, description: c.seoDescription },
      ruleSet: { appliedDisjunctively: false, rules: [c.rule] },
    },
  });
  failed(`collection ${c.handle}`, collectionCreate.userErrors);
  if (onlineStore) {
    const { publishablePublish } = await admin(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`, {
      id: collectionCreate.collection.id, input: [{ publicationId: onlineStore.id }],
    });
    failed(`publishing ${c.handle}`, publishablePublish.userErrors);
  }
  console.log(`  collection /collections/${collectionCreate.collection.handle}: created${onlineStore ? ' and published' : ' (publish it to the Online Store by hand)'}`);
}

for (const p of policies) {
  const { shopPolicyUpdate } = await admin(`mutation($shopPolicy: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $shopPolicy) { userErrors { message } } }`, {
    shopPolicy: { type: p.type, body: p.body },
  });
  failed(`policy ${p.handle}`, shopPolicyUpdate.userErrors);
  console.log(`  policy /policies/${p.handle}: written`);
}

for (const [path, target] of redirects) {
  if (have.redirects.has(path)) continue;
  const { urlRedirectCreate } = await admin(`mutation($urlRedirect: UrlRedirectInput!) { urlRedirectCreate(urlRedirect: $urlRedirect) { userErrors { message } } }`, {
    urlRedirect: { path, target },
  });
  failed(`redirect ${path}`, urlRedirectCreate.userErrors);
}
console.log(`  redirects: ${redirects.size - [...redirects.keys()].filter((p) => have.redirects.has(p)).length} created`);
console.log(`\nshopify-setup: ${store} is ready for the theme. Import ${OUT}/products.csv next (Products > Import).`);
