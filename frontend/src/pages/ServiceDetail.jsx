import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiTag, FiEdit2, FiTrash2, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';
import { PageContainer, PageShell } from '../components/ui';

const CATEGORY_COLORS = {
  coding:'text-blue-400', design:'text-pink-400', editing:'text-green-400',
  notes:'text-yellow-400', tutoring:'text-purple-400', other:'text-gray-400'
};

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/services/${id}`)
      .then(r => {
        const svc = r.data;
        if (svc && svc._id) setService(svc);
      })
      .catch(err => {
        console.error('Failed to load service:', err);
        navigate('/marketplace');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('Delete this service?')) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted');
      navigate('/marketplace');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!service) return null;

  const isOwner = user?._id === service.seller?._id;

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-5xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category + actions */}
            <div className="flex items-center justify-between">
              <span className={`text-sm capitalize font-medium ${CATEGORY_COLORS[service.category]}`}>
                {service.category}
              </span>
              {isOwner && (
                <div className="flex gap-2">
                  <Link to={`/marketplace/${id}/edit`} className="btn-ghost py-1.5 px-3 text-sm flex items-center gap-1.5">
                    <FiEdit2 size={13}/> Edit
                  </Link>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                    <FiTrash2 size={13}/> {deleting ? '…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-semibold text-white leading-snug">{service.title}</h1>

            <div className="flex items-center gap-4 flex-wrap">
              <StarRating value={service.rating} />
              <span className="text-xs text-gray-500">({service.totalReviews} reviews)</span>
              <span className="text-xs text-gray-500">{service.totalOrders} orders</span>
            </div>

            <p className="text-gray-400 leading-relaxed">{service.description}</p>

            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {service.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                    <FiTag size={11}/>{t}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-white/5 pt-5">
              <ReviewSection targetId={id} targetType="Service" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Pricing card */}
            <div className="card sticky top-20">
              <div className="text-3xl font-bold text-white mb-1">₹{service.price}</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <FiClock size={13}/> Delivery in {service.deliveryDays} day{service.deliveryDays > 1 ? 's' : ''}
              </div>

              {user && !isOwner ? (
                <Link to={`/messages/${service.seller?._id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  <FiMessageCircle size={15}/> Contact Seller
                </Link>
              ) : !user ? (
                <Link to="/login" className="btn-primary w-full flex items-center justify-center text-sm">
                  Login to Contact
                </Link>
              ) : null}
            </div>

            {/* Seller card */}
            <div className="card">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">About the Seller</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-semibold">
                  {service.seller?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{service.seller?.name}</p>
                  <p className="text-xs text-gray-500">{service.seller?.college}</p>
                </div>
              </div>
              <StarRating value={service.seller?.rating} />
              {service.seller?.bio && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">{service.seller?.bio}</p>
              )}
              {service.seller?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {service.seller.skills.map(s => (
                    <span key={s} className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default ServiceDetail;
