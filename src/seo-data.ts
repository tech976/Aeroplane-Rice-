// Everything scripts/seo.mjs needs to write a real HTML page for every address, compiled from the
// same files the site itself reads, so the two can never drift apart. Built by `npm run build`.
export { default as site } from './site.json';
export { products, categories, price } from './products';
export { details } from './product-details';
export { shopCategories, categoryByName, fullName, listingHighlights, productSeo } from './catalog';
export { pages, allPages } from './company';
export { policyPages } from './policies';
export { docGroups } from './investor-docs';
export { crumbsFor } from './breadcrumbs';
