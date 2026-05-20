import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const CATEGORIES = ['coding','design','editing','notes','tutoring','other'];

const INIT = { title: '', description: '', category: 'coding', price: '', deliveryDays: 3, tags: [] };

const CreateService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]     = useState(INIT);
  const [tag, setTag]       = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/services/${id}`).then(r => {
      const { title, description, category, price, deliveryDays, tags } = r.data;
      setForm({ title, description, category, price, deliveryDays, tags });
    }).catch(() => navigate('/marketplace'));
  }, [id, isEdit, navigate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = tag.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      set('tags', [...form.tags, t]);
      setTag('');
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/services/${id}`, form);
        toast.success('Service updated');
      } else {
        await api.post('/services', form);
        toast.success('Service listed!');
      }
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14}/> Back
        </button>

        <div className="card">
          <h1 className="text-xl font-semibold text-white mb-6">
            {isEdit ? 'Edit Service' : 'List a New Service'}
          </h1>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Title <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. I will build your React app" className="input-field" maxLength={100} />
            </div>

            {/* Category + Price + Delivery */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field capitalize">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="499" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Delivery (days)</label>
                <input type="number" min={1} max={30} value={form.deliveryDays} onChange={e => set('deliveryDays', e.target.value)}
                  className="input-field" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Description <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your service in detail…" rows={5}
                className="input-field resize-none" />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Tags <span className="text-gray-600">(max 8)</span></label>
              <div className="flex gap-2">
                <input value={tag} onChange={e => setTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                  placeholder="Type and press Enter" className="input-field flex-1" />
                <button type="button" onClick={addTag} className="btn-ghost px-4 py-2 text-sm">Add</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-lg">
                      {t}
                      <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}>
                        <FiX size={11}/>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : isEdit ? 'Update Service' : 'Publish Service'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;