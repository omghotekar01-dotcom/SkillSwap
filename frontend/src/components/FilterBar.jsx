import { FiSearch, FiSliders } from 'react-icons/fi';

const CATEGORIES = ['all','coding','design','editing','notes','tutoring','other'];
const SORTS      = [
  { value: 'newest',     label: 'Newest' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

const FilterBar = ({ filters, onChange }) => {
  const set = (k, v) => onChange({ ...filters, [k]: v, page: 1 });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={filters.search} onChange={e => set('search', e.target.value)}
          placeholder="Search services…"
          className="input-field pl-10 w-full" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => set('category', c === 'all' ? '' : c)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors
                ${(filters.category || 'all') === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {/* Price range */}
          <div className="flex items-center gap-1">
            <FiSliders size={13} className="text-gray-500" />
            <input type="number" placeholder="Min" value={filters.minPrice}
              onChange={e => set('minPrice', e.target.value)}
              className="input-field w-20 py-1.5 text-xs px-2" />
            <span className="text-gray-600 text-xs">–</span>
            <input type="number" placeholder="Max" value={filters.maxPrice}
              onChange={e => set('maxPrice', e.target.value)}
              className="input-field w-20 py-1.5 text-xs px-2" />
          </div>

          {/* Sort */}
          <select value={filters.sort} onChange={e => set('sort', e.target.value)}
            className="input-field py-1.5 text-xs w-32">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;