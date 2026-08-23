import { Link } from 'react-router-dom';
import { FiClock, FiTag, FiShield, FiArrowUpRight } from 'react-icons/fi';
import StarRating from './StarRating';

const CATEGORY_COLORS = {
  coding: 'from-sky-400/20 to-blue-500/10 text-sky-200',
  design: 'from-fuchsia-400/20 to-pink-500/10 text-fuchsia-200',
  editing: 'from-emerald-400/20 to-green-500/10 text-emerald-200',
  notes: 'from-amber-300/20 to-yellow-500/10 text-amber-100',
  tutoring: 'from-violet-400/20 to-purple-500/10 text-violet-100',
  other: 'from-slate-400/20 to-slate-500/10 text-slate-200',
};

const ServiceCard = ({ service }) => {
  const { _id, title, category, price, deliveryDays, rating, totalReviews, seller, tags } = service;
  const trust = Math.min(99, Math.round(((seller?.rating || rating || 0) * 18) + Math.min(totalReviews || 0, 9)));

  return (
    <Link
      to={`/marketplace/${_id}`}
      className="card group flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan-500/15"
    >
      <div className={`-mx-5 -mt-5 mb-5 h-28 bg-gradient-to-br ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other} relative overflow-hidden p-5 sm:-mx-6 sm:-mt-6`}>
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl transition duration-500 group-hover:scale-125" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-slate-950/30 px-3 py-1 text-xs font-semibold capitalize backdrop-blur-xl">
            {category || 'service'}
          </span>
          <span className="rounded-full border border-white/15 bg-slate-950/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
            ₹{price}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white transition-colors group-hover:text-cyan-200">
          {title}
        </h3>
        <FiArrowUpRight className="mt-1 shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      {tags?.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map(t => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              <FiTag size={10} />{t}
            </span>
          ))}
          {tags.length > 3 && <span className="px-2 py-1 text-xs text-slate-500">+{tags.length - 3}</span>}
        </div>
      )}

      <div className="mt-auto space-y-4 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20">
              {seller?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">{seller?.name || 'Campus seller'}</p>
              <p className="flex items-center gap-1 text-[11px] text-cyan-300"><FiShield size={10} /> Trust {trust || 72}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <FiClock size={12} />{deliveryDays || 3}d
          </span>
        </div>
        <div className="flex items-center justify-between">
          <StarRating value={rating} />
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">Preview</span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
