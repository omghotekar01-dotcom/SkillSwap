import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', subject: '', semester: 1, college: '', price: '', fileUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then(r => setForm({
        title: r.data.title,
        description: r.data.description,
        subject: r.data.subject,
        semester: r.data.semester || 1,
        college: r.data.college || '',
        price: r.data.price || '',
        fileUrl: r.data.fileUrl || ''
      }))
      .catch(() => navigate('/notes'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subject || !form.fileUrl || !form.price)
      return toast.error('Please fill in all required fields');

    setSaving(true);
    try {
      await api.put(`/notes/${id}`, { ...form, semester: Number(form.semester), price: Number(form.price) });
      toast.success('Note updated');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="card">
          <h1 className="text-2xl font-semibold text-white mb-2">Edit Note</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Semester</label>
                <input type="number" name="semester" min="1" max="8" value={form.semester} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Price</label>
                <input type="number" name="price" min="0" value={form.price} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">College</label>
              <input name="college" value={form.college} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">File URL</label>
              <input name="fileUrl" value={form.fileUrl} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input-field resize-none" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : <><FiEdit3 size={16} /> Update Note</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditNote;
