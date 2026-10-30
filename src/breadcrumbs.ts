// The trail from the home page to any page: shown as breadcrumbs on the page, and given to search
// engines as BreadcrumbList data by scripts/seo.mjs, so the two always agree.
import { categoryByName, categoryBySlug, fullName } from './catalog';
import { findPage } from './company';
import { products } from './products';

export type Crumb = { name: string; path: string };

const HOME: Crumb = { name: 'Home', path: '/' };
const SHOP: Crumb = { name: 'Shop', path: '/shop' };

export function crumbsFor(path: string): Crumb[] {
  if (path === '/') return [HOME];
  if (path === '/shop') return [HOME, SHOP];

  const slug = path.match(/^\/shop\/([^/]+)$/)?.[1];
  if (slug) {
    const category = categoryBySlug(slug);
    return category ? [HOME, SHOP, { name: category.name, path }] : [HOME];
  }

  const id = path.match(/^\/products\/([^/]+)$/)?.[1];
  if (id) {
    const product = products.find((p) => p.id === id);
    const category = product && categoryByName(product.category);
    if (!product || !category) return [HOME];
    return [HOME, SHOP, { name: category.name, path: `/shop/${category.slug}` }, { name: fullName(product), path }];
  }

  // company, investor and policy pages: each level of the address is a page of its own
  const trail = [HOME];
  const parts = path.split('/').filter(Boolean);
  for (let i = 1; i <= parts.length; i++) {
    const at = '/' + parts.slice(0, i).join('/');
    const page = findPage(at);
    if (page) trail.push({ name: page.path === '/investors' ? 'Investors' : page.nav, path: at });
  }
  return trail;
}
