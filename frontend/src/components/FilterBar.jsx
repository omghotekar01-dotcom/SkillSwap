import { FiSearch, FiSliders } from 'react-icons/fi';

const CATEGORIES = ['all', 'coding', 'design', 'editing', 'notes', 'tutoring', 'other'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

const FilterBar = ({ filters, onChange }) => {
  const set = (k, v) => onChange({ ...filters, [k]: v, page: 1 });

  return (
    <aside className="glass rounded-[1.75rem] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Discovery filters</p>
          <p className="text-xs text-slate-500">Tune price, category, and ranking.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-cyan-300">
          <FiSliders size={18} />
        </div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300" size={18} />
        <input
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Search services..."
          className="input-field w-full pl-11 text-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => set('category', c === 'all' ? '' : c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-300 ${
              (filters.category || 'all') === c
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={e => set('minPrice', e.target.value)}
          className="input-field text-sm"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={e => set('maxPrice', e.target.value)}
          className="input-field text-sm"
        />
        <select value={filters.sort} onChange={e => set('sort', e.target.value)} className="input-field min-w-36 text-sm">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </aside>
  );
};

export default FilterBar;
