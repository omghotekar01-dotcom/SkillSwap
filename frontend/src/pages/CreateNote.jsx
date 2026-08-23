import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiFileText, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { GradientBadge, PageContainer, PageShell } from '../components/ui';

const INIT = { title: '', description: '', subject: '', semester: 1, college: '', price: '', fileUrl: '' };

const CreateNote = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileLabel, setFileLabel] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/upload?type=notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(p => ({ ...p, fileUrl: res.data.fileUrl }));
      setFileLabel(file.name);
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subject || !form.fileUrl || !form.price)
      return toast.error('Please fill all required fields');
    if (Number(form.price) <= 0)
      return toast.error('Price must be greater than 0');
    if (Number(form.semester) < 1 || Number(form.semester) > 8)
      return toast.error('Semester must be between 1 and 8');

    setLoading(true);
    try {
      await api.post('/notes', {
        ...form,
        semester: Number(form.semester),
        price: Number(form.price)
      });
      toast.success('Notes uploaded');
      navigate('/notes');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="card">
          <GradientBadge>Academic upload</GradientBadge>
          <h1 className="mb-2 mt-4 text-2xl font-semibold text-white">Upload Notes</h1>
          <p className="text-gray-400 mb-6">Share your study materials with other students on campus.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Notes title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="Subject name" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Semester</label>
                <input type="number" name="semester" min="1" max="8" value={form.semester} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Price</label>
                <input type="number" name="price" min="0" value={form.price} onChange={handleChange} className="input-field" placeholder="₹" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">College</label>
                <input name="college" value={form.college} onChange={handleChange} className="input-field" placeholder="College name" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Upload file</label>
              <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip,.rar" onChange={handleFileUpload}
                className="w-full text-sm text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white" />
              {fileUploading && <p className="text-xs text-gray-400 mt-2">Uploading file…</p>}
              {fileLabel && <p className="text-xs text-slate-300 mt-2">Uploaded: {fileLabel}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">File URL</label>
              <input name="fileUrl" value={form.fileUrl} onChange={handleChange} className="input-field" placeholder="Or paste an existing URL" />
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
      </PageContainer>
    </PageShell>
  );
};

export default CreateNote;
