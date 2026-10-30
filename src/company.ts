import { docGroups } from './investor-docs';
import { policyPages } from './policies';
// Content for the company pages. The facts come from aeroplanerice.com; the
// headlines are written for this site.

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'stats'; items: { n: string; label: string }[] }
  | { t: 'cards'; items: { title: string; text?: string; points?: string[] }[] }
  | { t: 'links'; items: { label: string; href: string; note?: string }[] }
  | { t: 'places'; items: { label: string; lines: string[] }[] }
  | { t: 'figures'; wide?: boolean; items: { img: string; alt: string; caption: string }[] }
  | { t: 'docs'; section: keyof typeof docGroups };

export type Page = {
  path: string;
  nav: string;
  title: string;
  lede: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
};

export const COMPANY_SITE = 'https://www.aeroplanerice.com';

export const pages: Page[] = [
  {
    path: '/company',
    nav: 'The company',
    title: 'Four decades, one grain.',
    lede:
      'Amir Chand Jagdish Kumar (Exports) Ltd mills and ships basmati from the fields of Punjab and Haryana. Aeroplane is the brand on the sack.',
    seoTitle: 'The company | Aeroplane Basmati Rice',
    seoDescription:
      'Amir Chand Jagdish Kumar (Exports) Ltd — the company behind Aeroplane Basmati. Forty years of milling, more than forty brands, exports to over 37 countries.',
    blocks: [
      {
        t: 'p',
        text:
          'Amir Chand Jagdish Kumar (Exports) Ltd was established in 2003 and is one of India’s leading producers and exporters of basmati rice. Aeroplane is the flagship brand. Alongside it the company markets La-Taste, Alibaba, World Cup, Hani, Palm Tree, Budallah, Sophia and Al Jazira.',
      },
      {
        t: 'p',
        text:
          'The journey began forty years ago. The company now ranks third among its peer set by revenue, holds the third largest installed production capacity in that set, and is one of the few Indian branded rice players to have moved into FMCG staples.',
      },
      {
        t: 'figures',
        wide: true,
        items: [{ img: 'mill-front', alt: 'The Aeroplane plant, a long striped building behind a line of trees', caption: 'The plant. Paddy comes in at one end and leaves bagged at the other.' }],
      },
      {
        t: 'stats',
        items: [
          { n: '40+', label: 'Years in the trade' },
          { n: '40+', label: 'Brands across rice and staples' },
          { n: '37+', label: 'Countries we export to' },
          { n: '100+', label: 'Registered labels and copyrights' },
        ],
      },
      { t: 'h', text: 'Why people keep buying it' },
      {
        t: 'cards',
        items: [
          {
            title: 'Four decades of it',
            text:
              'Forty years in the business has built an understanding of what each market actually wants, and a steady presence at home and abroad.',
          },
          {
            title: 'Checked at every step',
            text:
              'From the paddy we buy to the pack it leaves in, every stage is monitored. Lots are tested before they are bagged.',
          },
          {
            title: 'Our own names',
            text:
              'Over a hundred labels and copyrights are registered to the company, across rice and staples.',
          },
          {
            title: 'Thirty-seven countries',
            text:
              'From Asia to Europe, Africa to the Middle East. The same aged grain, shipped on time, lot after lot.',
          },
        ],
      },
      { t: 'h', text: 'Where you will find us' },
      {
        t: 'p',
        text:
          'Aeroplane is among the top basmati brands in India, carried through our distributor network across the metros and tier-one and tier-two cities.',
      },
    ],
  },

  {
    path: '/company/leadership',
    nav: 'Leadership',
    title: 'The family that signs off every lot.',
    lede: 'Two generations of the Suri family run the company, between them more than seventy years in rice.',
    seoTitle: 'Leadership | Aeroplane Basmati Rice',
    seoDescription:
      'The leadership of Amir Chand Jagdish Kumar (Exports) Ltd — Jagdish Kumar Suri, Chairman and Managing Director, and Rahul Suri, Whole Time Director.',
    blocks: [
      {
        t: 'cards',
        items: [
          {
            title: 'Jagdish Kumar Suri — Chairman and Managing Director',
            text:
              'A promoter of the company, with more than four decades in the Indian basmati industry. He oversees production, finance, legal, administration and both international and domestic marketing. He was awarded the National Export Award by Prime Minister Atal Bihari Vajpayee for outstanding performance in exports. He sits on the executive committee of the All India Rice Exporters Association, where he also holds a Vice President post, and is a board member of the Basmati Development Fund.',
          },
          {
            title: 'Rahul Suri — Whole Time Director',
            text:
              'A promoter of the company, with more than three decades in rice. He specialises in the international marketing of agricultural and food products, and oversees production, export sales and marketing, and quality control. He is a member of the Saudi Arabia committee at the All India Rice Exporters Association.',
          },
        ],
      },
      {
        t: 'figures',
        items: [{ img: 'rahul-suri', alt: 'Rahul Suri, Whole Time Director', caption: 'Rahul Suri, Whole Time Director' }],
      },
      {
        t: 'p',
        text:
          'Ramnika Suri has worked alongside them in the business for more than three decades.',
      },
    ],
  },

  {
    path: '/company/infrastructure',
    nav: 'Mills',
    title: 'Two mills and a packing house.',
    lede:
      'Both plants sit inside the basmati belt, because the shorter the paddy travels, the better it mills.',
    seoTitle: 'Our mills | Aeroplane Basmati Rice',
    seoDescription:
      'Aeroplane’s plants at Amritsar and Safidon and the Delhi packing unit — capacity, laboratories and the machinery behind every lot.',
    blocks: [
      {
        t: 'p',
        text:
          'The plants run machinery from the USA, Japan and Germany. Procedures are written down and followed, which is the only way to get the same grain out of the mill twice.',
      },
      {
        t: 'cards',
        items: [
          {
            title: 'Amritsar, Punjab',
            points: [
              'Registered with the United Nations Framework Convention on Climate Change as a carbon-green, environment-friendly unit',
              'Several quality control laboratories running the latest testing equipment',
              'Generates its own power, with no reliance on external supply',
              'Warehousing for more than 140,000 MT of paddy',
            ],
          },
          {
            title: 'Safidon, Haryana',
            points: [
              'Sits at the heart of the Haryana basmati belt',
              'Fully automated, with machinery from Japan, the USA and Germany',
              'Able to produce every variety of rice we sell',
              'Several modern paddy and rice laboratories for quality control',
            ],
          },
          {
            title: 'Delhi packing unit',
            points: [
              'In the national capital region, within easy reach of the key markets',
              'Spread across 200,000 sq ft',
              'Paddy and rice laboratory on site',
            ],
          },
        ],
      },
      { t: 'h', text: 'Inside the plant' },
      {
        t: 'figures',
        items: [
          { img: 'mill-outside', alt: 'The long striped shed of the Aeroplane mill', caption: 'The mill' },
          { img: 'mill-floor', alt: 'Rice milling machinery on the plant floor', caption: 'The milling floor' },
          { img: 'mill-machines', alt: 'A row of graders and polishers in the plant', caption: 'Graders and polishers' },
          { img: 'mill-silos', alt: 'Steel paddy silos against the sky', caption: 'Paddy silos' },
          { img: 'mill-silos-2', alt: 'A line of storage silos beside the plant', caption: 'Storage, ahead of the season' },
          { img: 'mill-aerial', alt: 'The plant seen from the air, surrounded by farmland', caption: 'The plant, and the fields around it' },
        ],
      },
    ],
  },

  {
    path: '/company/certifications',
    nav: 'Certifications',
    title: 'Checked, and on the record.',
    lede:
      'Milled rice is only as good as the paddy you buy. Everything after that is proving it.',
    seoTitle: 'Awards and certifications | Aeroplane Basmati Rice',
    seoDescription:
      'ISO 22000:2018, HACCP and Super Star Export House status, plus the awards held by Amir Chand Jagdish Kumar (Exports) Ltd.',
    blocks: [
      { t: 'h', text: 'Accreditations' },
      {
        t: 'list',
        items: [
          'ISO 22000:2018, for the quality management system',
          'HACCP, for the food safety management standard',
          'Super Star Export House, recognised by the Ministry of Commerce and Industry',
          'APEDA registration, and NPPQ certificates for China and the USA',
        ],
      },
      { t: 'h', text: 'Awards' },
      {
        t: 'figures',
        items: [{ img: 'award-export', alt: 'The National Export Award being presented at Vigyan Bhavan in 2000', caption: 'The National Export Award, presented by Prime Minister Atal Bihari Vajpayee at Vigyan Bhavan, New Delhi, 8 May 2000.' }],
      },
      {
        t: 'list',
        items: [
          'Honoured by Prime Minister Atal Bihari Vajpayee for meritorious performance in exports, at Vigyan Bhavan, New Delhi, on 8 May 2000',
          'Excellence award from Bank of India, 2003–2004',
          'Excellence award from Union Bank of India, 2005–2006',
          'Honoured by APEDA for outstanding contribution to the promotion of agricultural and processed food products',
        ],
      },
      { t: 'h', text: 'How it works day to day' },
      {
        t: 'p',
        text:
          'The quality management system is built to ISO 22000. Floors are kept clean, staff wear laundered whites, and the code of conduct is the same on every shift. None of it is glamorous. It is what keeps one lot the same as the last.',
      },

    ],
  },

  {
    path: '/investors',
    nav: 'Investors',
    title: 'Investor relations.',
    lede:
      'Amir Chand Jagdish Kumar (Exports) Ltd is listed on the NSE and BSE. Every filing, result and policy is published here.',
    seoTitle: 'Investors | Aeroplane Basmati Rice',
    seoDescription:
      'Investor relations for Amir Chand Jagdish Kumar (Exports) Ltd: results, annual reports, shareholding, governance policies, filings and offer documents.',
    blocks: [
      {
        t: 'links',
        items: [
          { label: 'Financial information', href: '/investors/financials', note: 'Results, annual reports, returns and presentations' },
          { label: 'Filings and announcements', href: '/investors/announcements', note: 'AGM, board meetings, shareholding and shareholder forms' },
          { label: 'Corporate governance', href: '/investors/governance', note: 'Board policies, codes and SEBI disclosures' },
          { label: 'Offer documents', href: '/investors/offer-documents', note: 'DRHP, RHP and prospectus' },
        ],
      },
      { t: 'h', text: 'The company at a glance' },
      {
        t: 'stats',
        items: [
          { n: 'NSE', label: 'Listed since 2026' },
          { n: '2003', label: 'Incorporated' },
          { n: '40+', label: 'Brands' },
          { n: '37+', label: 'Export markets' },
        ],
      },
      { t: 'h', text: 'Investor contact' },
      {
        t: 'p',
        text:
          'For shareholder services, complaints or any query on the filings below, write to the company secretary at the registered office in Naya Bazar, Delhi. The address and hours are on the contact page.',
      },
    ],
  },

  {
    path: '/investors/financials',
    nav: 'Financials',
    title: 'Financial information.',
    lede: 'Quarterly results, annual reports and returns, investor presentations, and the subsidiary statements.',
    seoTitle: 'Financial information | Aeroplane Basmati Rice',
    seoDescription:
      'Quarterly and annual financial results, annual reports and returns, investor presentations and subsidiary statements for Amir Chand Jagdish Kumar (Exports) Ltd.',
    blocks: [{ t: 'docs', section: 'financials' }],
  },

  {
    path: '/investors/announcements',
    nav: 'Filings',
    title: 'Filings and announcements.',
    lede: 'Annual general meeting papers, board meeting notices, shareholding, shareholder service forms and the statutory filings.',
    seoTitle: 'Filings and announcements | Aeroplane Basmati Rice',
    seoDescription:
      'AGM notices and proceedings, board meeting notices, shareholding pattern, shareholder service forms and statutory filings for Amir Chand Jagdish Kumar (Exports) Ltd.',
    blocks: [{ t: 'docs', section: 'announcements' }],
  },

  {
    path: '/investors/governance',
    nav: 'Governance',
    title: 'Corporate governance.',
    lede: 'The board policies and codes, and the disclosures required under Regulation 46 of the SEBI listing regulations.',
    seoTitle: 'Corporate governance | Aeroplane Basmati Rice',
    seoDescription:
      'Board policies and codes, and disclosures under Regulation 46 of SEBI (LODR) Regulations 2015, for Amir Chand Jagdish Kumar (Exports) Ltd.',
    blocks: [{ t: 'docs', section: 'governance' }],
  },

  {
    path: '/investors/offer-documents',
    nav: 'Offer documents',
    title: 'Offer documents.',
    lede: 'The draft red herring prospectus, the red herring prospectus and the prospectus from the 2026 issue.',
    seoTitle: 'Offer documents | Aeroplane Basmati Rice',
    seoDescription:
      'DRHP, RHP and prospectus for the Amir Chand Jagdish Kumar (Exports) Ltd initial public offering.',
    blocks: [{ t: 'docs', section: 'offer' }],
  },

  {
    path: '/careers',
    nav: 'Careers',
    title: 'Work here.',
    lede: 'We hire for the mill, the labs, sales and the office.',
    seoTitle: 'Careers | Aeroplane Basmati Rice',
    seoDescription:
      'Open roles and how to apply at Amir Chand Jagdish Kumar (Exports) Ltd, the company behind Aeroplane Basmati Rice.',
    blocks: [
      {
        t: 'p',
        text:
          'Send your CV to hr@aeroplanerice.com with the role you are after in the subject line. We read everything that arrives, and we come back to the people we can place.',
      },
      {
        t: 'links',
        items: [{ label: 'hr@aeroplanerice.com', href: 'mailto:hr@aeroplanerice.com', note: 'Send your CV' }],
      },
    ],
  },

  {
    path: '/contact',
    nav: 'Contact',
    title: 'Where to find us.',
    lede: 'Four offices. The mill at Safidon runs through the season.',
    seoTitle: 'Contact | Aeroplane Basmati Rice',
    seoDescription:
      'Offices and contact details for Amir Chand Jagdish Kumar (Exports) Ltd — Delhi, Safidon, Alipur and Amritsar.',
    blocks: [
      {
        t: 'places',
        items: [
          { label: 'Registered address', lines: ['2735/9, Mohan Lal Palace', 'Naya Bazar, Central Delhi', 'Delhi 110006'] },
          { label: 'Corporate office', lines: ['Jind Road, Safidon', 'Haryana 126112'] },
          { label: 'Delhi sales office', lines: ['67/9, G.T. Karnal Road', 'Near Tata Telco, Alipur', 'Delhi 110036'] },
          { label: 'Amritsar branch', lines: ['Airport Road, Village Mehlanwala', 'Ajnala Road, Amritsar', 'Punjab 143102'] },
        ],
      },
      { t: 'h', text: 'Hours' },
      { t: 'p', text: 'Monday to Saturday, 10:00 am to 6:00 pm.' },
      { t: 'h', text: 'Get in touch' },
      {
        t: 'links',
        items: [
          { label: 'hr@aeroplanerice.com', href: 'mailto:hr@aeroplanerice.com', note: 'Careers' },
          { label: 'Shop online', href: 'https://shop.aeroplanerice.com', note: 'Orders and account' },
        ],
      },
    ],
  },
];

// the company pages and the customer policies share one renderer
export const allPages: Page[] = [...pages, ...policyPages];
export const findPage = (path: string) => allPages.find((p) => p.path === path);
export const isPolicy = (path: string) => policyPages.some((p) => p.path === path);
