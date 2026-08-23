import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiPlus, FiCompass, FiSearch, FiStar, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import FilterBar from '../components/FilterBar';
import { EmptyState, GlassCard, GradientBadge, PageContainer, PageShell, SearchBar } from '../components/ui';

const INIT = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 };

const Marketplace = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INIT);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
      );
      const { data } = await api.get(`/services?${params}`);
      setServices(Array.isArray(data?.services) ? data.services : []);
      setTotal(data?.total || 0);
      setPages(data?.pages || 1);
    } catch (err) {
      console.error('Failed to load services:', err);
      setServices([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setFilters(INIT);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      ...INIT,
      search: params.get('search') || '',
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || 'newest',
      page: Number(params.get('page')) || 1,
    });
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(fetchServices, filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchServices, filters.search]);

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-7xl">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <GradientBadge>Campus freelance marketplace</GradientBadge>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Hire verified student talent for every campus challenge.</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover tutoring, design, code help, academic notes, and campus services from trusted peers. Filter by skill, price, and delivery to hire faster.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard className="border-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live marketplace</p>
                <p className="mt-4 text-4xl font-semibold text-white">{total}</p>
                <p className="mt-2 text-sm text-slate-400">Active services available now.</p>
              </GlassCard>
              <GlassCard className="border-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Popular fast picks</p>
                <p className="mt-4 text-4xl font-semibold text-white">25+</p>
                <p className="mt-2 text-sm text-slate-400">Top-rated student experts.</p>
              </GlassCard>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {user && (
                <Link to="/marketplace/create" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                  <FiPlus size={16} /> List service
                </Link>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm text-slate-300 border border-white/10">
                <FiSearch /> Instant discovery with filters, previews, and ratings
              </span>
            </div>
          </div>
          <GlassCard className="border-white/10 p-6 bg-slate-950/70">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Marketplace trends</p>
              <div className="space-y-3">
                {[
                  { label: 'Top categories', value: 'Coding, Notes, Tutoring' },
                  { label: 'Fastest responses', value: 'Under 1 hour' },
                  { label: 'Trusted listings', value: '4.8+ ratings' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <GlassCard className="border-white/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Smart search</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Refine your campus service search</h2>
              </div>
              <SearchBar value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))} placeholder="Search campus services, notes…" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Best sellers</p>
                <p className="mt-3 text-xl font-semibold text-white">Curated student experts you can trust.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Secure hiring</p>
                <p className="mt-3 text-xl font-semibold text-white">Connect directly through trusted campus messaging.</p>
              </div>
            </div>
          </GlassCard>

          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-64 rounded-[1.75rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState icon={FiSearch} title="No services found" description="Try adjusting your filters or search criteria to widen your results." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setFilters((prev) => ({ ...prev, page: pageNumber }))}
                className={`min-w-[2.25rem] rounded-2xl px-4 py-2 text-sm transition-all duration-200 ${filters.page === pageNumber ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
};

export default Marketplace;
