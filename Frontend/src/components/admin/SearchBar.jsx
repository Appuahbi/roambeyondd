import { Search } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Admin Search Bar
|--------------------------------------------------------------------------
| Tiny presentational search input. Parent owns the value + debounce.
|--------------------------------------------------------------------------
*/
export default function SearchBar({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={`relative ${className || ''}`}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-11"
      />
    </div>
  );
}
