import { useEffect } from 'react';
import { findPage, isPolicy, pages, type Block, type Page } from '../company';
import { policyPages } from '../policies';
import { Crumbs } from './Crumbs';
import { docGroups } from '../investor-docs';
import { setSeo } from '../seo';
import { Band, Img } from './ui';
import { asset } from '../host';

// the file's type, as people know it: PDF, Excel or a web page
const kind = (file: string) => ({ xlsx: 'Excel', html: 'Web page' } as Record<string, string>)[file.split('.').pop()!.toLowerCase()] ?? 'PDF';

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
            if (block.people) {
              // one card per person: a portrait, or their initials where there is no photograph
              return (
                <div className="page__people" key={i}>
                  {block.items.map((card) => {
                    const [name, role] = card.title.split(' — ');
                    return (
                      <article className="page__person" key={card.title}>
                        <div className="page__portrait">
                          {card.img
                            ? <Img name={card.img} alt={card.alt ?? name} sizes="(min-width: 900px) 12rem, 40vw" />
                            : <span aria-hidden="true">{name.split(' ').map((w) => w[0]).join('')}</span>}
                        </div>
                        <div>
                          <h3>{name}</h3>
                          {role && <p className="page__role">{role}</p>}
                          {card.text && <p>{card.text}</p>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            }
            return (
              <div className="page__cards" data-count={block.items.length} key={i}>
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
              <div className={`page__figures${block.wide ? ' page__figures--wide' : ''}`} data-count={block.items.length} key={i}>
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
                          <a href={doc.url ?? asset(`/assets/investors/${doc.file}`)} target="_blank" rel="noopener">
                            <span className="docs__name">{doc.title}</span>
                            <span className="docs__meta">{kind(doc.file)}{doc.size ? ` · ${(doc.size / 1048576).toFixed(doc.size > 10485760 ? 0 : 1)} MB` : ''}</span>
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
  }, [page]);

  if (!page) return <NotFound path={path} />;

  // the sidebar lists the pages of this part of the site: the policies, or the company and investors
  const policy = isPolicy(page.path);
  const groups = policy
    ? [{ name: 'Policies', items: policyPages }]
    : [
      { name: 'The company', items: pages.filter((p) => !p.path.startsWith('/investors')) },
      { name: 'Investors', items: pages.filter((p) => p.path.startsWith('/investors')) },
    ];

  return (
    <main id="main" className="page light">
      <div className="wrap page__head">
        <Crumbs path={page.path} className="page__crumb" />
        <h1 className="display">{page.title}</h1>
        <p className="lede">{page.lede}</p>
      </div>

      <div className="wrap page__layout">
        <div className="page__body">
          <Blocks blocks={page.blocks} />
        </div>

        <aside className="page__aside" aria-label="In this section">
          {groups.map((g) => (
            <nav key={g.name} className="page__toc" aria-label={g.name}>
              <h2 className="label">{g.name}</h2>
              <ul>
                {g.items.map((p) => (
                  <li key={p.path}>
                    <a href={p.path} aria-current={p.path === page.path ? 'page' : undefined}>{p.path === '/investors' ? 'Overview' : p.nav}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="page__promo dark">
            <div className="pattern" aria-hidden="true" />
            <p className="label">Aeroplane basmati</p>
            <p>Aged eight months, delivered free across India.</p>
            <a className="btn btn--yellow btn--small" href="/shop">Shop the range</a>
          </div>
        </aside>
      </div>

      <Band art="harvest" />
    </main>
  );
}

/** Any address the site does not have. It says so to search engines too, so it is never indexed. */
export function NotFound({ path }: { path: string }) {
  useEffect(() => { setSeo({ title: 'Page not found | Aeroplane Basmati Rice', path, index: false }); }, [path]);
  return (
    <main id="main" className="page light">
      <div className="wrap page__head">
        <h1 className="display">We could not find that page.</h1>
        <p className="lede">It may have moved, or the address may be mistyped. The shop and the home page are a click away.</p>
        <div className="page__actions">
          <a className="btn" href="/shop">Shop the range</a>
          <a className="btn btn--line" href="/">Back to the home page</a>
        </div>
      </div>
    </main>
  );
}
