# Aeroplane Basmati Rice

Marketing and shop front page for Aeroplane Basmati Rice. Vite, React, TypeScript and Motion.

## Run it

```sh
npm install
npm run dev      # http://localhost:4173
npm run build    # type-check and build to dist/
```

## Where things are

- `src/components/` – one file per page section, plus `Cart.tsx` (cart state and drawer) and `ui.tsx` (shared image, icon and illustration helpers).
- `src/products.ts` – products, pack sizes and prices.
- `src/styles.css` – all styling; brand colours are tokens at the top.
- `public/assets/` – logo files, fonts, photographs and illustrations.

## Shopify theme

The same site runs as a Shopify theme. Shopify serves every page with the React app, and supplies
the live variants, prices, stock, cart, checkout and customer accounts.

```sh
npm run shopify:ready     # builds everything below and runs Shopify's theme check
```

That writes:

- `aeroplane-theme.zip`, the theme, ready for **Online Store > Themes > Add theme > Upload zip file**
  (about 30 MB; Shopify takes up to 50 MB).
- `shopify-setup/`, everything else the store needs:
  - `products.csv`: 38 products and 75 pack sizes.
  - `redirects.csv`: the site's old addresses, sent to the store's.
  - `pages/`: the company and investor pages.
  - `policies/`: the four policies.
  - `collections.json`: one collection per shop category.

### Going live on a new store

1. **Products.** Products > Import > `shopify-setup/products.csv`. Shopify fetches the photographs
   from the Vercel site, so keep it running during the import.
2. **Pages, collections, policies and redirects.** These are created in one go by the setup
   script (step a, b or c), or by hand (step d).
   - a. In the Shopify Dev Dashboard, create an app for the store with the Admin API scopes
     `write_content`, `write_products`, `write_publications`, `write_legal_policies` and
     `write_online_store_navigation`, and install it on the store.
   - b. Put its keys in `.env.shopify` (git ignores this file):
     `SHOPIFY_CLIENT_ID=…` and `SHOPIFY_CLIENT_SECRET=…`. An Admin API token works too, as
     `SHOPIFY_ADMIN_TOKEN=…`.
   - c. Run `npm run shopify:setup -- --apply --store your-store.myshopify.com`.
     It only creates what is missing, and never changes or deletes anything already in the store.
   - d. By hand instead:
     - Online Store > Pages: add one page per file in `shopify-setup/pages/`. The **URL handle**
       must be the file name (`company-leadership`), and the content is the file's HTML.
     - Products > Collections: add one automated collection per entry in `collections.json`
       (condition: product type is equal to the category), with the handle given there.
     - Settings > Policies: paste each file from `shopify-setup/policies/`.
     - Online Store > Navigation > URL redirects > Import: `shopify-setup/redirects.csv`.
3. **Theme.** Online Store > Themes > Add theme > Upload zip file > `aeroplane-theme.zip`. Preview it,
   then **Publish**. Or, with the Shopify CLI: `npm run shopify:push -- --store your-store.myshopify.com`.
4. **Subscriptions.** Install the Shopify Subscriptions app and add plans to the products. The
   "Subscribe & save" options appear on their own once a product has plans.
5. **Domain.** Settings > Domains: connect the domain, then set `url` in `src/site.json` to it and
   rebuild.

### How it fits together

- **Addresses.** Shopify answers only its own kinds of address, so inside the theme the site's
  addresses become the store's (`src/store-paths.ts`):

  | The site | The store |
  | --- | --- |
  | `/shop` | `/collections/all` |
  | `/shop/basmati` | `/collections/basmati` |
  | `/company/leadership` | `/pages/company-leadership` |
  | `/cancellation-policy` | `/policies/refund-policy` |

  Every page is a real store page: found, indexable, and given its own title and canonical
  address. Old links reach the right page through the redirects.
- **The theme files.** `shopify/` holds the Liquid source. `layout/theme.liquid` loads the app, the
  Google tag (GTM-NQNXSK73) and the store's live variants. Each template writes the page's words and
  links for crawlers and visitors without JavaScript, and the app replaces them as soon as it
  starts. `src/host.ts` maps asset paths to the theme's flat file names (`/assets/img/field.webp`
  becomes `img-field.webp`).
- **Investor filings.** At about 340 MB they are far too large for a theme, so they load from the
  address in **Theme settings > Investor documents**. That is the Vercel site by default. To move
  them into Shopify, upload them to Content > Files and paste that folder's address there.
- **Product limit.** The theme lists up to 50 products for the app (`collections.all`). Past that,
  the list needs pagination.
- **Missing products.** A product the store does not have shows as sold out.

## Not finished

- Products, prices and pack photographs come from an export of shop.aeroplanerice.com taken on 12 October 2026 (`src/products.ts`); they do not update on their own.
- The cart is stored in the browser only. "Continue to the shop" opens the live shop; the cart does not carry over.
- The timeline and most body copy are placeholder wording.
