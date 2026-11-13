import { useSyncExternalStore } from 'react';
import { onShopify } from './host';
import { fromStore, toStore } from './store-paths';

// A very small router: the site has a homepage and one page per product.
const listeners = new Set<() => void>();

/** After a page change, go to the link's anchor if it has one, otherwise to the top. */
export function settle(hash: string) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }));
}

/** The page being shown, in the site's own addresses (inside Shopify the bar shows the store's). */
const current = () => (onShopify ? fromStore(location.pathname) : location.pathname);

export function navigate(href: string) {
  const url = new URL(href, location.href);
  if (onShopify) url.pathname = toStore(url.pathname);
  history.pushState(null, '', url);
  listeners.forEach((listener) => listener());
  settle(url.hash);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => { listeners.delete(listener); window.removeEventListener('popstate', listener); };
}

export function usePath() {
  return useSyncExternalStore(subscribe, current);
}

// Ordinary links to another page of this site change page without a reload.
// Links within the same page are left to the browser.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
  if (!link || link.target || link.hasAttribute('download') || link.origin !== location.origin) return;
  if ((onShopify ? fromStore(link.pathname) : link.pathname) === current()) return;
  // pages the Shopify store serves itself
  if (/^\/(checkout|account|cart|cdn|apps|services)(\/|$)/.test(link.pathname)) return;
  event.preventDefault();
  navigate(link.href);
});
