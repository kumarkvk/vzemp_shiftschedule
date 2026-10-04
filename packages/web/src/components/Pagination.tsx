import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, pageCount, onChange }: PaginationProps): JSX.Element | null => {
  if (pageCount <= 1) {
    return null;
  }
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      <Button disabled={page === 1} onClick={() => onChange(page - 1)} variant="secondary">Previous</Button>
      <span className="text-sm text-slate-600">Page {page} of {pageCount}</span>
      <Button disabled={page === pageCount} onClick={() => onChange(page + 1)} variant="secondary">Next</Button>
    </nav>
  );
};
