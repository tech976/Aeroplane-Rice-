import { useSyncExternalStore } from 'react';

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

export function navigate(href: string) {
  const url = new URL(href, location.href);
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
  return useSyncExternalStore(subscribe, () => location.pathname);
}

// Ordinary links to another page of this site change page without a reload.
// Links within the same page are left to the browser.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
  if (!link || link.target || link.hasAttribute('download') || link.origin !== location.origin || link.pathname === location.pathname) return;
  // pages the Shopify store serves itself
  if (/^\/(checkout|account|cart|cdn|policies)(\/|$)/.test(link.pathname)) return;
  event.preventDefault();
  navigate(link.href);
});
