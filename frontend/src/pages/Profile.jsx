import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiBook, FiMail, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', college: '', bio: '', skills: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      college: user.college || '',
      bio: user.bio || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || ''
    });
  }, [user]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        college: form.college,
        bio: form.bio,
        skills
      });
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-semibold text-white mb-2">Your Profile</h1>
          <p className="text-sm text-gray-400 mb-6">Keep your campus profile up to date so students can find your services faster.</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="name" value={form.name} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="email" value={form.email} disabled className="input-field pl-10 bg-slate-900/80" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">College / University</label>
              <div className="relative">
                <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="college" value={form.college} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="input-field resize-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Skills</label>
              <div className="relative">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="skills" value={form.skills} onChange={handleChange} className="input-field pl-10" placeholder="React, design, tutoring" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : <><FiSave size={16} /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
