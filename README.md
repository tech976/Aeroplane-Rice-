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
npm run shopify:products                            # writes shopify/products.csv
npm run build:shopify                               # builds the theme into dist-shopify/
npm run shopify:dev -- --store your-store.myshopify.com    # preview against the store
npm run shopify:push -- --store your-store.myshopify.com   # upload as an unpublished theme
```

1. In Shopify admin, Products > Import, upload `shopify/products.csv`. Handles match the site's
   product addresses (`/products/<id>`) and each pack size is a variant titled with its size, which
   is how the app finds it. Shopify fetches the photographs from the main site while importing.
2. Push the theme, then preview it or publish it from Online Store > Themes.

- `shopify/` holds the Liquid source: `layout/theme.liquid` loads the app and hands it the store's
  variants; the templates are empty because the app draws every page.
- `src/host.ts` is where the app learns it is inside Shopify. Asset paths become the theme's flat
  file names (`/assets/img/field.webp` is `img-field.webp`), and the investor filings (340 MB, too
  large for a theme) keep loading from the main site.
- Shopify only answers its own addresses (`/`, `/products/…`, `/collections/…`, `/pages/…`, `/cart`).
  `/shop` and the company and investor pages still draw correctly, through the 404 template, but
  answer with a 404 status. Before going live, create them as Pages or add URL redirects.
- A product the store does not have shows as sold out inside the theme.

## Not finished

- Products, prices and pack photographs come from an export of shop.aeroplanerice.com taken on 12 October 2026 (`src/products.ts`); they do not update on their own.
- The cart is stored in the browser only. "Continue to the shop" opens the live shop; the cart does not carry over.
- The timeline and most body copy are placeholder wording.
