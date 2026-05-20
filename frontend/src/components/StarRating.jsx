import { FiStar } from 'react-icons/fi';

const StarRating = ({ value = 0, onChange, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(n => (
      <button key={n} type={onChange ? 'button' : undefined}
        onClick={() => onChange?.(n)}
        className={onChange ? 'cursor-pointer' : 'cursor-default'}
        style={{ lineHeight: 1 }}>
        <FiStar size={size}
          className={n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
      </button>
    ))}
    {!onChange && <span className="text-xs text-gray-500 ml-1">{value ? value.toFixed(1) : '—'}</span>}
  </div>
);

export default StarRating;