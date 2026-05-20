import { Link } from 'react-router-dom';
import { FiClock, FiTag } from 'react-icons/fi';
import StarRating from './StarRating';

const CATEGORY_COLORS = {
  coding:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  design:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  editing:  'bg-green-500/10 text-green-400 border-green-500/20',
  notes:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  tutoring: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  other:    'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const ServiceCard = ({ service }) => {
  const { _id, title, category, price, deliveryDays, rating, totalReviews, seller, tags } = service;
  return (
    <Link to={`/marketplace/${_id}`}
      className="card hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-200 group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other}`}>
          {category}
        </span>
        <span className="text-indigo-400 font-semibold text-sm shrink-0">₹{price}</span>
      </div>

      {/* Title */}
      <h3 className="font-medium text-white text-sm leading-snug mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {title}
      </h3>

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0,3).map(t => (
            <span key={t} className="flex items-center gap-0.5 text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
              <FiTag size={9}/>{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
        {/* Seller */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">
            {seller?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 truncate max-w-[80px]">{seller?.name}</span>
        </div>
        {/* Meta */}
        <div className="flex items-center gap-3">
          <StarRating value={rating} />
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <FiClock size={11}/>{deliveryDays}d
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;