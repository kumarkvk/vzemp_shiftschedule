import { Link, useLocation } from 'react-router-dom';
import { titleCase } from '@/lib/utils';

export const Breadcrumb = (): JSX.Element | null => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="hover:text-brand" to="/">Home</Link></li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          return (
            <li className="flex items-center gap-2" key={href}>
              <span>/</span>
              {isLast ? <span className="font-medium text-slate-700">{titleCase(segment)}</span> : <Link className="hover:text-brand" to={href}>{titleCase(segment)}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
