import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiFileText, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const INIT = { title: '', description: '', subject: '', semester: 1, college: '', price: '', fileUrl: '' };

const CreateNote = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subject || !form.fileUrl || !form.price)
      return toast.error('Please fill in all required fields');

    setLoading(true);
    try {
      await api.post('/notes', { ...form, semester: Number(form.semester), price: Number(form.price) });
      toast.success('Notes uploaded');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="card">
          <h1 className="text-2xl font-semibold text-white mb-2">Upload Notes</h1>
          <p className="text-gray-400 mb-6">Share your study materials with other students on campus.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Notes title" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="Subject name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Semester</label>
                <input type="number" name="semester" min="1" max="8" value={form.semester} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Price</label>
                <input type="number" name="price" min="0" value={form.price} onChange={handleChange} className="input-field" placeholder="₹" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">College</label>
              <input name="college" value={form.college} onChange={handleChange} className="input-field" placeholder="College name" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">File URL</label>
              <input name="fileUrl" value={form.fileUrl} onChange={handleChange} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input-field resize-none" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Uploading…' : <><FiUpload size={16} /> Upload Notes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNote;
