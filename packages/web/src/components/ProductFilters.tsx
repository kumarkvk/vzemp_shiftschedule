import { Button } from './Button';
import { FormInput } from './FormInput';

interface ProductFiltersProps {
  search: string;
  category: string;
  sortBy: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

export const ProductFilters = ({ search, category, sortBy, categories, onSearchChange, onCategoryChange, onSortChange, onReset }: ProductFiltersProps): JSX.Element => (
  <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:grid-cols-[2fr_1fr_1fr_auto]">
    <FormInput aria-label="Search products" label="Search" onChange={(event) => onSearchChange(event.target.value)} placeholder="Search products" value={search} />
    <label className="text-sm font-medium text-slate-700">
      <span>Category</span>
      <select aria-label="Category" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" onChange={(event) => onCategoryChange(event.target.value)} value={category}>
        <option value="">All categories</option>
        {categories.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
    <label className="text-sm font-medium text-slate-700">
      <span>Sort</span>
      <select aria-label="Sort" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" onChange={(event) => onSortChange(event.target.value)} value={sortBy}>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to high</option>
        <option value="price-desc">Price: High to low</option>
        <option value="name">Name</option>
      </select>
    </label>
    <div className="flex items-end"><Button fullWidth onClick={onReset} type="button" variant="secondary">Reset</Button></div>
  </div>
);
