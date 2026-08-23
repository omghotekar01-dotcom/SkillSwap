import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiBook, FiMail, FiHash, FiUpload, FiPlus, FiMinus, FiLink, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { GradientBadge, PageContainer, PageShell } from '../components/ui';

const emptyPortfolio = { label: '', url: '' };
const emptyAchievement = { title: '', description: '', year: '', link: '' };
const emptyProject = { title: '', description: '', link: '' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', college: '', bio: '', skills: '', semester: 1, interests: '', avatar: '' });
  const [portfolio, setPortfolio] = useState([emptyPortfolio]);
  const [achievements, setAchievements] = useState([emptyAchievement]);
  const [projects, setProjects] = useState([emptyProject]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      college: user.college || '',
      bio: user.bio || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '',
      semester: user.semester || 1,
      interests: Array.isArray(user.interests) ? user.interests.join(', ') : user.interests || '',
      avatar: user.avatar || ''
    });
    setPortfolio(user.portfolioLinks?.length ? user.portfolioLinks : [emptyPortfolio]);
    setAchievements(user.achievements?.length ? user.achievements.map(a => ({
      title: a.title || '',
      description: a.description || '',
      year: a.year || '',
      link: a.link || ''
    })) : [emptyAchievement]);
    setProjects(user.projects?.length ? user.projects : [emptyProject]);
  }, [user]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload?type=avatars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, avatar: data.fileUrl }));
      toast.success('Avatar uploaded');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  const updateItem = (setter, index, field, value) => {
    setter(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const addItem = (setter, empty) => setter(prev => [...prev, empty]);
  const removeItem = (setter, index) => setter(prev => prev.filter((_, idx) => idx !== index));

  const handleSave = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');

    setSaving(true);
    try {
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const interests = form.interests.split(',').map(i => i.trim()).filter(Boolean);
      const payload = {
        name: form.name.trim(),
        college: form.college.trim(),
        bio: form.bio.trim(),
        skills,
        interests,
        semester: Number(form.semester) || 1,
        avatar: form.avatar,
        portfolioLinks: portfolio.filter(item => item.label.trim() && item.url.trim()),
        achievements: achievements
          .filter(item => item.title.trim() || item.description.trim())
          .map(item => ({ title: item.title.trim(), description: item.description.trim(), year: Number(item.year) || undefined, link: item.link.trim() })),
        projects: projects.filter(item => item.title.trim() || item.description.trim())
          .map(item => ({ title: item.title.trim(), description: item.description.trim(), link: item.link.trim() }))
      };
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-5xl pt-28">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors duration-300 font-medium">
          <FiArrowLeft size={16} /> Back
        </button>
        <div className="card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="w-full lg:w-1/3 text-center">
              <div className="metric-ring mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-[2rem] p-[3px]">
                <div className="h-full w-full overflow-hidden rounded-[1.8rem] bg-slate-950 flex items-center justify-center">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white font-semibold">{form.name?.[0]?.toUpperCase() || 'S'}</span>
                )}
                </div>
              </div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Profile Image</label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer" />
              {avatarLoading && <p className="text-xs text-gray-400 mt-2">Uploading avatar…</p>}
            </div>
            <div className="w-full lg:w-2/3">
              <GradientBadge>Profile studio</GradientBadge>
              <h1 className="mb-3 mt-4 text-3xl font-bold text-white sm:text-4xl">Your Profile</h1>
              <p className="text-base text-slate-300 font-light mb-8">Manage your campus profile and showcase your skills to attract more students.</p>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Full name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input name="name" value={form.name} onChange={handleChange} className="input-field pl-11 text-base" placeholder="Enter your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input name="email" value={form.email} disabled className="input-field pl-11 text-base bg-slate-900/80 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">College / University</label>
                    <div className="relative">
                      <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input name="college" value={form.college} onChange={handleChange} className="input-field pl-11 text-base" placeholder="Your institution" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Semester</label>
                    <input name="semester" value={form.semester} onChange={handleChange} type="number" min="1" max="8" className="input-field text-base" placeholder="4" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="input-field resize-none text-base" placeholder="Tell students about yourself…" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Interests</label>
                    <input name="interests" value={form.interests} onChange={handleChange} className="input-field text-base" placeholder="AI, web apps, event planning" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-200 mb-2.5 block">Skills</label>
                    <div className="relative">
                      <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input name="skills" value={form.skills} onChange={handleChange} className="input-field pl-11 text-base" placeholder="React, design, tutoring" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Portfolio Links</p>
                        <p className="text-xs text-slate-500">Share your work, case studies, or GitHub projects.</p>
                      </div>
                      <button type="button" onClick={() => addItem(setPortfolio, emptyPortfolio)} className="btn-ghost text-sm px-3 py-2">
                        <FiPlus className="inline mr-1" /> Add link
                      </button>
                    </div>
                    <div className="space-y-3">
                      {portfolio.map((item, index) => (
                        <div key={index} className="grid sm:grid-cols-[1fr_auto] gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input value={item.label} onChange={e => updateItem(setPortfolio, index, 'label', e.target.value)} placeholder="Label (Portfolio, GitHub)" className="input-field" />
                            <input value={item.url} onChange={e => updateItem(setPortfolio, index, 'url', e.target.value)} placeholder="https://..." className="input-field" />
                          </div>
                          <button type="button" onClick={() => removeItem(setPortfolio, index)} className="btn-danger px-4 py-2 text-sm">
                            <FiMinus />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Achievements</p>
                        <p className="text-xs text-slate-500">Add awards, certificates, or campus accomplishments.</p>
                      </div>
                      <button type="button" onClick={() => addItem(setAchievements, emptyAchievement)} className="btn-ghost text-sm px-3 py-2">
                        <FiPlus className="inline mr-1" /> Add achievement
                      </button>
                    </div>
                    <div className="space-y-3">
                      {achievements.map((item, index) => (
                        <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <input value={item.title} onChange={e => updateItem(setAchievements, index, 'title', e.target.value)} placeholder="Title" className="input-field" />
                            <input value={item.year} onChange={e => updateItem(setAchievements, index, 'year', e.target.value)} placeholder="Year" className="input-field" />
                            <input value={item.link} onChange={e => updateItem(setAchievements, index, 'link', e.target.value)} placeholder="Link (optional)" className="input-field" />
                            <textarea value={item.description} onChange={e => updateItem(setAchievements, index, 'description', e.target.value)} placeholder="Description" rows={2} className="input-field resize-none sm:col-span-3" />
                          </div>
                          <button type="button" onClick={() => removeItem(setAchievements, index)} className="btn-danger px-4 py-2 text-sm">
                            <FiMinus />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Project Showcase</p>
                        <p className="text-xs text-slate-500">Share your mini projects or team contributions.</p>
                      </div>
                      <button type="button" onClick={() => addItem(setProjects, emptyProject)} className="btn-ghost text-sm px-3 py-2">
                        <FiPlus className="inline mr-1" /> Add project
                      </button>
                    </div>
                    <div className="space-y-3">
                      {projects.map((item, index) => (
                        <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <input value={item.title} onChange={e => updateItem(setProjects, index, 'title', e.target.value)} placeholder="Project title" className="input-field" />
                            <input value={item.link} onChange={e => updateItem(setProjects, index, 'link', e.target.value)} placeholder="Project URL" className="input-field" />
                            <textarea value={item.description} onChange={e => updateItem(setProjects, index, 'description', e.target.value)} placeholder="Short description" rows={2} className="input-field resize-none sm:col-span-3" />
                          </div>
                          <button type="button" onClick={() => removeItem(setProjects, index)} className="btn-danger px-4 py-2 text-sm">
                            <FiMinus />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full text-base font-semibold py-3 mt-2">
                  {saving ? <><span className="inline-block animate-spin mr-2">⏳</span>Saving…</> : <><FiSave size={18} className="inline mr-2" />Save Profile</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default Profile;
