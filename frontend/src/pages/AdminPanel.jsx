import { useState, useEffect } from 'react';
import { FiUsers, FiBookOpen, FiShoppingBag, FiShield, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { GradientBadge, PageContainer, PageShell } from '../components/ui';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/services'),
      api.get('/admin/notes')
    ]).then(([statsRes, usersRes, servicesRes, notesRes]) => {
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
    }).catch(err => {
      console.error('Admin load error:', err);
      toast.error('Unable to load admin dashboard');
    }).finally(() => setLoading(false));
  }, []);

  const toggleUser = async id => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(curr => curr.map(user => user._id === id ? { ...user, isActive: res.data.isActive } : user));
      toast.success('User updated');
    } catch (err) {
      console.error(err);
      toast.error('Unable to update user');
    }
  };

  const deleteUser = async id => {
    if (!confirm('Delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(curr => curr.filter(user => user._id !== id));
      toast.success('User deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const toggleService = async id => {
    try {
      const res = await api.patch(`/admin/services/${id}/toggle`);
      setServices(curr => curr.map(service => service._id === id ? { ...service, isActive: res.data.isActive } : service));
      toast.success('Service visibility updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update service');
    }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer>
        <div className="page-hero mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <GradientBadge><FiShield /> Admin Dashboard</GradientBadge>
            <h1 className="mt-4 text-3xl font-semibold text-white">Platform moderation & insights</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {['stats','users','services','notes'].map(value => (
              <button key={value} onClick={() => setTab(value)}
                className={`px-4 py-2 rounded-full transition ${tab === value ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                {value === 'stats' ? 'Stats' : value === 'users' ? 'Users' : value === 'services' ? 'Services' : 'Notes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : tab === 'stats' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="card px-6 py-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Total users</p>
                  <p className="text-3xl font-semibold text-white">{stats?.users ?? 0}</p>
                </div>
                <FiUsers className="text-indigo-400" size={26} />
              </div>
            </div>
            <div className="card px-6 py-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Services</p>
                  <p className="text-3xl font-semibold text-white">{stats?.services ?? 0}</p>
                </div>
                <FiShoppingBag className="text-indigo-400" size={26} />
              </div>
            </div>
            <div className="card px-6 py-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-3xl font-semibold text-white">{stats?.notes ?? 0}</p>
                </div>
                <FiBookOpen className="text-indigo-400" size={26} />
              </div>
            </div>
            <div className="card px-6 py-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Reviews</p>
                  <p className="text-3xl font-semibold text-white">{stats?.reviews ?? 0}</p>
                </div>
                <FiShield className="text-indigo-400" size={26} />
              </div>
            </div>
          </div>
        ) : tab === 'users' ? (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email} · {user.college || 'Unknown college'}</p>
                  <p className="text-xs text-gray-500 mt-1">Role: {user.role} · Active: {user.isActive ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => toggleUser(user._id)} className="btn-ghost px-4 py-2 text-sm">
                    {user.isActive ? 'Suspend' : 'Restore'}
                  </button>
                  <button onClick={() => deleteUser(user._id)} className="btn-danger px-4 py-2 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'services' ? (
          <div className="space-y-4">
            {services.map(service => (
              <div key={service._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{service.title}</p>
                  <p className="text-sm text-gray-400">{service.category} · ₹{service.price}</p>
                  <p className="text-xs text-gray-500 mt-1">Seller: {service.seller?.name || 'Unknown'}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => toggleService(service._id)} className="btn-ghost px-4 py-2 text-sm">
                    {service.isActive ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{note.title}</p>
                  <p className="text-sm text-gray-400">{note.subject} · ₹{note.price}</p>
                  <p className="text-xs text-gray-500 mt-1">Seller: {note.seller?.name || 'Unknown'}</p>
                </div>
                <div className="text-sm text-gray-400">Active: {note.isActive ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
};

export default AdminPanel;
