import { useEffect } from 'react';
import { findPage, pages, type Block, type Page } from '../company';
import { docGroups } from '../investor-docs';
import { setSeo } from '../seo';
import { Band, Img } from './ui';
import { asset } from '../host';

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.t) {
          case 'h':
            return <h2 className="page__h" key={i}>{block.text}</h2>;
          case 'p':
            return <p className="page__p" key={i}>{block.text}</p>;
          case 'list':
            return (
              <ul className="page__list" key={i}>
                {block.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            );
          case 'stats':
            return (
              <dl className="page__stats" key={i}>
                {block.items.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.n}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            );
          case 'cards':
            return (
              <div className="page__cards" key={i}>
                {block.items.map((card) => (
                  <article className="page__card" key={card.title}>
                    <h3>{card.title}</h3>
                    {card.text && <p>{card.text}</p>}
                    {card.points && <ul>{card.points.map((p) => <li key={p}>{p}</li>)}</ul>}
                  </article>
                ))}
              </div>
            );
          case 'links':
            return (
              <ul className="page__links" key={i}>
                {block.items.map((link) => {
                  const external = link.href.startsWith('http');
                  return (
                    <li key={link.href + link.label}>
                      <a href={link.href} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
                        <span className="page__links-label">{link.label}</span>
                        {link.note && <span className="page__links-note">{link.note}</span>}
                        <span className="page__links-arrow" aria-hidden="true">
                          {external ? '↗' : '→'}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            );
          case 'figures':
            return (
              <div className={`page__figures${block.wide ? ' page__figures--wide' : ''}`} key={i}>
                {block.items.map((fig) => (
                  <figure key={fig.img}>
                    <Img name={fig.img} alt={fig.alt} sizes={block.wide ? '(min-width: 900px) 56rem, 100vw' : '(min-width: 900px) 28rem, 100vw'} />
                    <figcaption>{fig.caption}</figcaption>
                  </figure>
                ))}
              </div>
            );
          case 'docs': {
            const groups = docGroups[block.section] ?? [];
            return (
              <div className="docs" key={i}>
                {groups.map((group) => (
                  <section className="docs__group" key={group.heading}>
                    <h3>{group.heading} <span>{group.docs.length}</span></h3>
                    <ul>
                      {group.docs.map((doc) => (
                        <li key={doc.file}>
                          <a href={asset(`/assets/investors/${doc.file}`)} target="_blank" rel="noopener">
                            <span className="docs__name">{doc.title}</span>
                            <span className="docs__meta">PDF{doc.size ? ` · ${(doc.size / 1048576).toFixed(doc.size > 10485760 ? 0 : 1)} MB` : ''}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            );
          }
          case 'places':
            return (
              <div className="page__places" key={i}>
                {block.items.map((place) => (
                  <div className="page__place" key={place.label}>
                    <h3>{place.label}</h3>
                    <address>{place.lines.map((line) => <span key={line}>{line}</span>)}</address>
                  </div>
                ))}
              </div>
            );
        }
      })}
    </>
  );
}

export function CompanyPage({ path }: { path: string }) {
  const page = findPage(path) as Page | undefined;

  useEffect(() => {
    if (page) setSeo({ title: page.seoTitle, description: page.seoDescription, path: page.path });
    else setSeo({ title: 'Page not found | Aeroplane Basmati Rice', path });
  }, [page, path]);

  if (!page) {
    return (
      <main id="main" className="page light">
        <div className="wrap page__head">
          <h1 className="display">We could not find that page.</h1>
          <p className="lede">It may have moved. The shop and the company pages are below.</p>
          <a className="btn" href="/">Back to the home page</a>
        </div>
      </main>
    );
  }

  const siblings = pages.filter((p) => p.path !== page.path);

  return (
    <main id="main" className="page light">
      <div className="wrap page__head">
        <p className="page__crumb"><a href="/">Aeroplane</a> <span aria-hidden="true">/</span> {page.nav}</p>
        <h1 className="display">{page.title}</h1>
        <p className="lede">{page.lede}</p>
      </div>

      <div className="wrap page__body">
        <Blocks blocks={page.blocks} />
      </div>

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
