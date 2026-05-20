import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCompass, FiSearch, FiStar } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import FilterBar from '../components/FilterBar';

const INIT = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 };
const CATEGORIES = ['coding', 'design', 'editing', 'notes', 'tutoring'];

const Marketplace = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState(INIT);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''))
      );
      const { data } = await api.get(`/services?${params}`);
      setServices(data.services);
      setTotal(data.total);
      setPages(data.pages);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchServices, filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchServices, filters.search]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Campus freelance marketplace</p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white">Hire student talent for every campus project.</h1>
              <p className="mt-4 text-slate-400 leading-8 text-sm sm:text-base">
                Discover verified student freelancers offering tutoring, design, development, notes, and event services. Filter by skill, price, and delivery to find the right campus expert fast.
              </p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-sm text-slate-400">Live listings</p>
              <p className="text-3xl font-semibold text-white">{total}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-[1.75rem] p-5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-300 mb-4">
                <FiStar size={20} />
              </div>
              <p className="text-sm text-gray-400">Fast discovery with curated categories and top-rated student sellers.</p>
            </div>
            <div className="glass rounded-[1.75rem] p-5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-300 mb-4">
                <FiCompass size={20} />
              </div>
              <p className="text-sm text-gray-400">Secure messages, reviews, and direct campus connections for every job.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            {user && (
              <Link to="/marketplace/create" className="btn-primary flex items-center gap-2 text-sm py-2">
                <FiPlus size={16} /> List Service
              </Link>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
              <FiSearch /> Search, filter, and connect instantly
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat, page: 1 }))}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${filters.category === cat ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card h-48 animate-pulse">
                <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No services found</p>
            <p className="text-gray-700 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map(s => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                className={`w-9 h-9 rounded-lg text-sm transition-colors
                  ${filters.page === p ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;