import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiShoppingBag, FiBook, FiStar,
  FiDollarSign, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import StarRating from '../components/StarRating';

const TABS = ['Overview', 'My Services', 'My Notes'];

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab]             = useState(0);
  const [services, setServices]   = useState([]);
  const [notes, setNotes]         = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [loadingNts, setLoadingNts] = useState(true);
  const [editBio, setEditBio]     = useState(false);
  const [bio, setBio]             = useState(user?.bio || '');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    api.get('/services/mine')
      .then(r => setServices(r.data))
      .finally(() => setLoadingSvc(false));
    api.get('/notes/mine')
      .then(r => setNotes(r.data))
      .finally(() => setLoadingNts(false));
  }, []);

  const saveBio = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { bio });
      updateUser({ bio: data.bio });
      setEditBio(false);
      toast.success('Bio updated');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const deleteService = async id => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices(p => p.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const deleteNote = async id => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(p => p.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const toggleService = async id => {
    try {
      const svc = services.find(s => s._id === id);
      const { data } = await api.put(`/services/${id}`, { isActive: !svc.isActive });
      setServices(p => p.map(s => s._id === id ? { ...s, isActive: data.isActive } : s));
    } catch { toast.error('Failed'); }
  };

  const totalRating = services.reduce((a, s) => a + s.rating, 0);
  const avgRating   = services.length ? (totalRating / services.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">

        {/* Profile header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-xl font-semibold text-white">{user?.name}</h1>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {user?.college && <p className="text-xs text-gray-600 mt-0.5">{user?.college}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={user?.rating} />
                  <span className="text-xs text-gray-500">({user?.totalReviews})</span>
                </div>
              </div>

              {/* Bio */}
              {editBio ? (
                <div className="mt-3 space-y-2">
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    rows={2} maxLength={200}
                    className="input-field resize-none text-sm w-full" />
                  <div className="flex gap-2">
                    <button onClick={saveBio} disabled={saving} className="btn-primary py-1.5 px-4 text-sm">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditBio(false)} className="btn-ghost py-1.5 px-4 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 mt-2">
                  <p className="text-sm text-gray-400 flex-1">{user?.bio || 'No bio yet.'}</p>
                  <button onClick={() => setEditBio(true)} className="text-gray-600 hover:text-indigo-400 transition-colors shrink-0">
                    <FiEdit2 size={13}/>
                  </button>
                </div>
              )}

              {/* Skills */}
              {user?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {user.skills.map(s => (
                    <span key={s} className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Services Listed" value={services.length} icon={FiShoppingBag} color="indigo" />
          <StatsCard label="Notes Listed"    value={notes.length}    icon={FiBook}        color="violet" />
          <StatsCard label="Avg Rating"      value={avgRating || '—'} icon={FiStar}       color="yellow" />
          <StatsCard label="Total Downloads" value={notes.reduce((a, n) => a + n.downloads, 0)} icon={FiDollarSign} color="green" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${tab === i ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Quick actions */}
            <div className="card">
              <h3 className="font-medium text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/marketplace/create', label: 'List a new service', icon: FiShoppingBag },
                  { to: '/notes/create',       label: 'Upload notes',       icon: FiBook },
                  { to: '/marketplace',        label: 'Browse marketplace', icon: FiShoppingBag },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm text-gray-300 hover:text-white">
                    <Icon size={15} className="text-indigo-400" />{label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent services */}
            <div className="card">
              <h3 className="font-medium text-white mb-4">Recent Services</h3>
              {loadingSvc ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm text-gray-600">No services yet.</p>
              ) : (
                <div className="space-y-2">
                  {services.slice(0,3).map(s => (
                    <Link key={s._id} to={`/marketplace/${s._id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <span className="text-sm text-gray-300 group-hover:text-white truncate">{s.title}</span>
                      <span className="text-sm text-indigo-400 shrink-0 ml-2">₹{s.price}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Services */}
        {tab === 1 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''}</p>
              <Link to="/marketplace/create" className="btn-primary text-sm py-2 flex items-center gap-1.5">
                <FiPlus size={15}/> Add Service
              </Link>
            </div>
            {loadingSvc ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 card animate-pulse" />)}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <FiShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
                <p>No services listed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(s => (
                  <div key={s._id} className="card flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-md capitalize
                          ${s.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>
                          {s.isActive ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">{s.category}</span>
                      </div>
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <StarRating value={s.rating} size={12} />
                        <span className="text-xs text-gray-500">₹{s.price}</span>
                        <span className="text-xs text-gray-600">{s.totalOrders} orders</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleService(s._id)}
                        className="text-gray-500 hover:text-indigo-400 transition-colors">
                        {s.isActive ? <FiToggleRight size={20}/> : <FiToggleLeft size={20}/>}
                      </button>
                      <Link to={`/marketplace/${s._id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors">
                        <FiEdit2 size={15}/>
                      </Link>
                      <button onClick={() => deleteService(s._id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                        <FiTrash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Notes */}
        {tab === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
              <Link to="/notes/create" className="btn-primary text-sm py-2 flex items-center gap-1.5">
                <FiPlus size={15}/> Upload Notes
              </Link>
            </div>
            {loadingNts ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-20 card animate-pulse" />)}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <FiBook size={36} className="mx-auto mb-3 opacity-30" />
                <p>No notes uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(n => (
                  <div key={n._id} className="card flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{n.subject}</span>
                        {n.semester && <span className="text-xs text-gray-600">Sem {n.semester}</span>}
                        <span className="text-xs text-indigo-400">₹{n.price}</span>
                        <span className="text-xs text-gray-600">{n.downloads} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/notes/${n._id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors">
                        <FiEdit2 size={15}/>
                      </Link>
                      <button onClick={() => deleteNote(n._id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                        <FiTrash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;