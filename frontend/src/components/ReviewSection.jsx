import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import StarRating from './StarRating';

const ReviewSection = ({ targetId, targetType }) => {
  const { user } = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [form, setForm]         = useState({ rating: 0, comment: '' });
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews?targetId=${targetId}&targetType=${targetType}`);
      setReviews(data);
    } finally { setLoading(false); }
  }, [targetId, targetType]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submit = async e => {
    e.preventDefault();
    if (!form.rating) return toast.error('Select a rating');
    setSubmitting(true);
    try {
      await api.post('/reviews', { ...form, targetId, targetType });
      toast.success('Review posted!');
      setForm({ rating: 0, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const remove = async id => {
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(p => p.filter(r => r._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const hasReviewed = reviews.some(r => r.reviewer?._id === user?._id);

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-white text-lg">Reviews ({reviews.length})</h3>

      {/* Write review */}
      {user && !hasReviewed && (
        <form onSubmit={submit} className="card space-y-3">
          <p className="text-sm text-gray-400 font-medium">Leave a review</p>
          <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} size={22} />
          <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
            placeholder="Share your experience…"
            rows={3} className="input-field resize-none" />
          <button type="submit" disabled={submitting} className="btn-primary py-2 text-sm">
            {submitting ? 'Posting…' : 'Post review'}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-6">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r._id} className="card py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/60 flex items-center justify-center text-sm text-white font-medium">
                    {r.reviewer?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{r.reviewer?.name}</p>
                    <StarRating value={r.rating} />
                  </div>
                </div>
                {user?._id === r.reviewer?._id && (
                  <button onClick={() => remove(r._id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              {r.comment && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{r.comment}</p>}
              <p className="text-xs text-gray-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;