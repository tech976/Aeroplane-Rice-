import { useEffect } from 'react';
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
import { ProductPage } from './components/ProductPage';
import { CompanyPage } from './components/CompanyPage';
import { InvestorsPage } from './components/InvestorsPage';
import { ShopPage } from './components/ShopPage';
import { findPage } from './company';
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
  // the company pages added alongside the shop: /company, /investors, /contact and the rest
  const company = !productId && clean !== '/' ? findPage(clean) : undefined;
  // Shopify serves its catalogue at /collections, so inside the theme that is the shop page too
  const shop = clean === '/shop' || clean === '/collections' || clean.startsWith('/collections/');
  const inner = Boolean(productId || company || shop);

  // a link such as /#range opened directly: the section does not exist until the page has rendered
  useEffect(() => { if (location.hash) settle(location.hash); }, []);
  useEffect(() => { if (!inner) setSeo(); }, [inner]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <CartProvider>
          {/* the home page opens on a banner photograph, which the bar sits above rather than over */}
          <Header plain />
          {productId ? <ProductPage key={productId} id={productId} />
            : shop ? <ShopPage />
            : company?.path === '/investors' ? <InvestorsPage />
            : company ? <CompanyPage key={company.path} path={company.path} />
            : <Home />}
          <Footer />
          {!inner && <ShopBar />}
          <WhatsApp />
        </CartProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
