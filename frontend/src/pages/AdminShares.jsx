import { useState } from 'react';
import { FiKey, FiTrash2, FiExternalLink } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { EmptyState, GradientBadge, PageContainer, PageShell } from '../components/ui';

const AdminShares = () => {
  const [key, setKey] = useState('');
  const [shares, setShares] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/shares', { headers: { 'x-admin-key': key } });
      setShares(res.data);
    } catch (err) {
      alert('Failed to load shares (check admin key)');
      setShares([]);
    } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this share?')) return;
    try {
      await api.delete(`/admin/shares/${id}`, { headers: { 'x-admin-key': key } });
      setShares(shares.filter(s => s.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-5xl">
        <div className="page-hero mb-6">
          <GradientBadge><FiKey /> Secure moderation</GradientBadge>
          <h1 className="mt-4 text-3xl font-semibold text-white">Admin Shares</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">Inspect and remove shared code snippets without changing the share API flow.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input value={key} onChange={e => setKey(e.target.value)} placeholder="Admin key" className="input-field" />
            <button onClick={fetchShares} className="btn-primary shrink-0">Load Shares</button>
          </div>
        </div>

        {loading && <div className="card h-28 animate-pulse" />}
        {shares && shares.length === 0 && <EmptyState title="No shares found" description="There are no active snippets for this key." />}
        <div className="space-y-3">
          {shares && shares.map(s => (
            <div key={s.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-white">{s.title || s.id}</div>
                <div className="text-sm text-slate-400">Views: {s.views} - {s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</div>
              </div>
              <div className="flex gap-2">
                <a className="btn-ghost px-4 py-2 text-sm" href={`/share/${s.id}`} target="_blank" rel="noreferrer"><FiExternalLink /> Open</a>
                <button onClick={() => del(s.id)} className="btn-danger px-4 py-2 text-sm"><FiTrash2 /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default AdminShares;
