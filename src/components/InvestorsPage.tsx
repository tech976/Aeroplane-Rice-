import { useEffect } from 'react';
import { findPage, pages } from '../company';
import { docGroups, type Doc } from '../investor-docs';
import { setSeo } from '../seo';
import { asset } from '../host';
import { Band, Img } from './ui';

// The investor relations front page. Every figure and claim here is already published elsewhere on
// the site (the company pages) or in the filings themselves; the documents link to the PDFs.

const allDocs = Object.values(docGroups).flatMap((groups) => groups.flatMap((group) => group.docs));
const doc = (file: string) => allDocs.find((d) => d.file === file) as Doc;
const count = (section: keyof typeof docGroups) => docGroups[section].reduce((n, group) => n + group.docs.length, 0);
const href = (d: Doc) => asset(`/assets/investors/${d.file}`);
const size = (d: Doc) => `PDF · ${(d.size / 1048576).toFixed(d.size > 10485760 ? 0 : 1)} MB`;

const RESULTS = doc('Final-Board-Meeting-Outcome-_Reg-30-ACJKEL_03.08.2026.pdf');
const PRESENTATION = doc('investor-presentation_7.8.26.pdf');

const latest = [
  { tag: 'Results', date: '3 Aug 2026', title: 'Financial results, Q1 FY27', file: RESULTS },
  { tag: 'Presentation', date: '7 Aug 2026', title: 'Investor presentation, Q1 FY 2026-27', file: PRESENTATION },
  { tag: 'Press release', date: '7 Aug 2026', title: 'Press release on the Q1 FY 2026-27 results', file: doc('revised-press-release_7.8.26.pdf') },
  { tag: 'AGM', date: '29 Sep 2026', title: 'Summary of the 23rd annual general meeting', file: doc('Intimation_AGM-Proceedings_29.09.2026.pdf') },
  { tag: 'Expansion', date: '24 Sep 2026', title: 'Intimation of a subsidiary in Saudi Arabia', file: doc('ACJKEL_Intimation-for-Saudi-Subsidiary_24.09.26_SIGNED.pdf') },
  { tag: 'Distribution', date: '16 Jun 2026', title: 'Aeroplane to be distributed across Oman with Al Tasnim Group', file: doc('Intimation-Letter_Distribution-in-Oman_16.06.2026-signed.pdf') },
];

const figures = [
  ['2003', 'Incorporated'],
  ['40+', 'Years in the rice trade'],
  ['37+', 'Countries we export to'],
  ['40+', 'Brands across rice and staples'],
  ['140,000 MT', 'Paddy warehousing at Amritsar'],
  ['200,000 sq ft', 'Packing unit near Delhi'],
];

const strengths = [
  {
    title: 'Third in its peer set',
    text: 'The company ranks third among its peers by revenue and holds the third largest installed production capacity, and is one of the few Indian branded rice players to have moved into FMCG staples.',
  },
  {
    title: 'Mills inside the basmati belt',
    text: 'Plants at Amritsar and Safidon run machinery from the USA, Japan and Germany, with their own laboratories. The Amritsar unit generates its own power.',
  },
  {
    title: 'A house of brands',
    text: 'Aeroplane is the flagship, alongside La-Taste, Alibaba, World Cup, Hani, Palm Tree, Budallah, Sophia and Al Jazira. More than a hundred labels and copyrights are registered to the company.',
  },
  {
    title: 'A growing footprint abroad',
    text: 'Exports to more than 37 countries, a wholly owned subsidiary in Singapore, a Saudi subsidiary announced in 2026, and distribution across Oman with Al Tasnim Group.',
  },
];

const library = [
  { path: '/investors/financials', title: 'Financial information', note: 'Quarterly results, annual reports and returns, investor presentations', n: count('financials') },
  { path: '/investors/announcements', title: 'Filings and announcements', note: 'AGM papers, board meetings, shareholding and shareholder forms', n: count('announcements') },
  { path: '/investors/governance', title: 'Corporate governance', note: 'Board policies and codes, and Regulation 46 disclosures', n: count('governance') },
  { path: '/investors/offer-documents', title: 'Offer documents', note: 'DRHP, RHP and prospectus from the 2026 issue', n: count('offer') },
];

const Arrow = ({ out = false }: { out?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {out ? <path d="M8 16 17 7M9 7h8v8" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
  </svg>
);

export function InvestorsPage() {
  const page = findPage('/investors')!;
  useEffect(() => { setSeo({ title: page.seoTitle, description: page.seoDescription, path: page.path }); }, [page]);
  const siblings = pages.filter((p) => p.path !== page.path);

  return (
    <main id="main" className="ir">
      <section className="ir__hero dark">
        <div className="pattern" aria-hidden="true" />
        <div className="wrap ir__hero-grid">
          <div>
            <p className="page__crumb"><a href="/">Aeroplane</a> <span aria-hidden="true">/</span> Investors</p>
            <p className="label ir__kicker">Investor relations</p>
            <h1 className="ir__title">The house behind Aeroplane, listed on the NSE and BSE.</h1>
            <p className="lede">
              Amir Chand Jagdish Kumar (Exports) Ltd mills, brands and exports basmati from the fields of Punjab and Haryana.
              Every result, filing and policy is published here as it is filed.
            </p>
            <div className="ir__actions">
              <a className="btn btn--yellow" href={href(RESULTS)} target="_blank" rel="noopener">Latest results, Q1 FY27</a>
              <a className="btn btn--line" href={href(PRESENTATION)} target="_blank" rel="noopener">Investor presentation</a>
            </div>
          </div>
          <figure className="ir__photo">
            <Img name="mill-aerial" alt="The Aeroplane plant from the air, surrounded by farmland" sizes="(min-width: 900px) 40vw, 100vw" eager />
          </figure>
        </div>
        <ul className="wrap ir__marks" aria-label="Listing and accreditations">
          <li>Listed on NSE and BSE</li>
          <li>Super Star Export House</li>
          <li>ISO 22000:2018</li>
          <li>HACCP</li>
          <li>APEDA registered</li>
        </ul>
      </section>

      <section className="wrap ir__figures" aria-labelledby="ir-figures">
        <h2 className="label" id="ir-figures">The company at a glance</h2>
        <dl>
          {figures.map(([n, label]) => <div key={label}><dt>{n}</dt><dd>{label}</dd></div>)}
        </dl>
      </section>

      <section className="wrap ir__section" aria-labelledby="ir-latest">
        <div className="ir__head">
          <h2 className="display" id="ir-latest">Latest from the company.</h2>
          <a className="btn btn--line" href="/investors/announcements">All filings</a>
        </div>
        <ul className="ir__latest">
          {latest.map((item) => (
            <li key={item.file.file}>
              <a href={href(item.file)} target="_blank" rel="noopener">
                <span className="ir__tag">{item.tag}</span>
                <time>{item.date}</time>
                <h3>{item.title}</h3>
                <span className="ir__meta">{size(item.file)} <Arrow out /></span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="ir__why dark" aria-labelledby="ir-why">
        <div className="pattern" aria-hidden="true" />
        <div className="wrap">
          <h2 className="display" id="ir-why">Why Aeroplane.</h2>
          <ol className="ir__strengths">
            {strengths.map((item, i) => (
              <li key={item.title}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap ir__section" aria-labelledby="ir-library">
        <div className="ir__head">
          <h2 className="display" id="ir-library">Documents.</h2>
          <p className="ir__head-note">{allDocs.length} filings, published in full.</p>
        </div>
        <ul className="ir__library">
          {library.map((item) => (
            <li key={item.path}>
              <a href={item.path}>
                <b>{item.n}</b>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap ir__section ir__people" aria-labelledby="ir-board">
        <div>
          <h2 className="display" id="ir-board">Leadership and governance.</h2>
          <p className="page__p">
            Two generations of the Suri family run the company. Board policies, codes of conduct and the disclosures
            required under Regulation 46 of the SEBI listing regulations are published in full.
          </p>
          <div className="ir__actions">
            <a className="btn" href="/company/leadership">Meet the leadership</a>
            <a className="btn btn--line" href="/investors/governance">Corporate governance</a>
          </div>
        </div>
        <ul className="ir__board">
          <li><b>Jagdish Kumar Suri</b><span>Chairman and Managing Director</span><p>More than four decades in the Indian basmati industry.</p></li>
          <li><b>Rahul Suri</b><span>Whole Time Director</span><p>More than three decades in rice, specialising in international marketing.</p></li>
        </ul>
      </section>

      <section className="wrap ir__section" aria-labelledby="ir-contact">
        <div className="ir__contact dark">
          <div>
            <h2 className="display" id="ir-contact">Investor contact.</h2>
            <p>For shareholder services, complaints or a question on any filing, write to the Company Secretary at the registered office.</p>
            <div className="ir__actions">
              <a className="btn btn--yellow" href="mailto:info@aeroplanerice.com?subject=Investor%20query">Email the company</a>
              <a className="btn btn--line" href="/investors/announcements">Shareholder forms</a>
            </div>
          </div>
          <address>
            <span className="label">Registered office</span>
            <span>Amir Chand Jagdish Kumar (Exports) Ltd</span>
            <span>2735/9, Mohan Lal Palace</span>
            <span>Naya Bazar, Central Delhi</span>
            <span>Delhi 110006</span>
            <span className="ir__hours">Monday to Saturday, 10:00 am to 6:00 pm</span>
          </address>
        </div>
      </section>

      <Band art="harvest" />

      <div className="wrap page__more">
        <h2 className="page__h">More about us</h2>
        <ul className="page__links">
          {siblings.map((p) => (
            <li key={p.path}>
              <a href={p.path}>
                <span className="page__links-label">{p.nav}</span>
                <span className="page__links-note">{p.title.replace(/\.$/, '')}</span>
                <span className="page__links-arrow" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
