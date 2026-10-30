import { crumbsFor } from '../breadcrumbs';

/** The breadcrumb trail for a page, ending on the page itself. */
export function Crumbs({ path, className }: { path: string; className: string }) {
  const trail = crumbsFor(path);
  return (
    <nav className={className} aria-label="Breadcrumb">
      {trail.map((crumb, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={crumb.path}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {last ? <span aria-current="page">{crumb.name}</span> : <a href={crumb.path}>{crumb.name}</a>}
          </span>
        );
      })}
    </nav>
  );
}
