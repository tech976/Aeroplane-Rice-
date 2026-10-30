import { Suspense, lazy, useEffect } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { settle, usePath } from './router';
import { setSeo } from './seo';
import { Marketplaces } from './components/Marketplaces';
import { CartProvider } from './components/Cart';
import { Header, ShopBar } from './components/Header';
import { Band } from './components/ui';
import { Hero } from './components/Hero';
import { Heritage } from './components/Heritage';
import { Pour } from './components/Pour';
import { Films } from './components/Films';
import { Range } from './components/Range';
import { Fields } from './components/Fields';
import { Table } from './components/Table';
import { Kitchen } from './components/Kitchen';
import { Story } from './components/Story';
import { Faq, Footer, Promise } from './components/Closing';
// Only the home page is in the first download; every other kind of page arrives with its own code
// when it is opened, so the home page shows sooner.
const ProductPage = lazy(() => import('./components/ProductPage').then((m) => ({ default: m.ProductPage })));
const CompanyPage = lazy(() => import('./components/CompanyPage').then((m) => ({ default: m.CompanyPage })));
const NotFound = lazy(() => import('./components/CompanyPage').then((m) => ({ default: m.NotFound })));
const InvestorsPage = lazy(() => import('./components/InvestorsPage').then((m) => ({ default: m.InvestorsPage })));
const ShopPage = lazy(() => import('./components/ShopPage').then((m) => ({ default: m.ShopPage })));
import { findPage } from './company';
import { categoryBySlug } from './catalog';
import { onShopify } from './host';
import { WhatsApp } from './components/WhatsApp';

function Home() {
  return (
    <main id="main">
      <Hero />
      <Band art="harvest" />
      <Heritage />
      <Pour />
      <Films />
      <Range />
      <Marketplaces query="Aeroplane basmati rice" />
      <Fields />
      <Table />
      <Band art="kitchen" tone="rice" />
      <Kitchen />
      <Band art="dance" />
      <Promise />
      <Story />
      <Faq />
    </main>
  );
}

export function App() {
  const path = usePath();
  const clean = path.replace(/\/+$/, '') || '/';
  const productId = clean.match(/^\/products\/([^/]+)$/)?.[1];
  // the company pages, the investor pages and the customer policies
  const company = !productId && clean !== '/' ? findPage(clean) : undefined;
  // /shop, and a landing page per category at /shop/<category>
  const slug = clean.match(/^\/shop\/([^/]+)$/)?.[1];
  const category = slug ? categoryBySlug(slug)?.name : undefined;
  // Shopify serves its catalogue at /collections, so inside the theme that is the shop page too
  const shop = clean === '/shop' || Boolean(category) || (onShopify && (clean === '/collections' || clean.startsWith('/collections/')));
  // inside the theme Shopify's own /cart address is the home page with the cart open
  const home = clean === '/' || (onShopify && clean === '/cart');
  const missing = !productId && !company && !shop && !home;
  const inner = !home;

  // a link such as /#range opened directly: the section does not exist until the page has rendered
  useEffect(() => { if (location.hash) settle(location.hash); }, []);
  useEffect(() => { if (!inner) setSeo(); }, [inner]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <CartProvider>
          {/* the home page opens on a banner photograph, which the bar sits above rather than over */}
          <Header plain />
          <Suspense fallback={<main id="main" className="page-loading" />}>
          {productId ? <ProductPage key={productId} id={productId} />
            : shop ? <ShopPage key={category ?? 'All'} category={category} />
            : missing ? <NotFound path={clean} />
            : company?.path === '/investors' ? <InvestorsPage />
            : company ? <CompanyPage key={company.path} path={company.path} />
            : <Home />}
          </Suspense>
          <Footer />
          {!inner && <ShopBar />}
          <WhatsApp />
        </CartProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
