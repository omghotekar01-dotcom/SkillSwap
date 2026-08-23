import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText, FiDownload, FiBookOpen } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { EmptyState, GlassCard, GradientBadge, PageContainer, PageShell } from '../components/ui';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes')
      .then((r) => {
        const notes = Array.isArray(r.data) ? r.data : r.data?.notes || [];
        setNotes(notes);
      })
      .catch((err) => {
        console.error('Failed to load notes:', err);
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-7xl">
        <div className="mb-10 grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <GradientBadge><FiBookOpen /> Academic exchange</GradientBadge>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Campus notes curated for smarter study sessions.</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Explore polished study materials, lab records, and exam prep shared by your peers. Discover resources that help you learn faster and score higher.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              {user && (
                <Link to="/notes/create" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                  <FiPlus size={16} /> Upload notes
                </Link>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm text-slate-300 border border-white/10">
                <FiDownload /> Download to review anytime
              </span>
            </div>
          </div>
          <GlassCard className="border-white/10 p-6 bg-slate-950/70">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notes by category</p>
              <div className="grid gap-4">
                {[
                  { label: 'Math & Science', value: '520 notes' },
                  { label: 'Computer Science', value: '430 notes' },
                  { label: 'Humanities', value: '280 notes' },
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

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-64 rounded-[1.75rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState icon={FiFileText} title="No notes available yet" description="Shared academic resources will appear here as students upload them." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note._id}
                to={`/notes/${note._id}`}
                className="group block overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{note.subject || 'General'}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">Sem {note.semester || 'N/A'}</span>
                </div>
                <h2 className="mb-3 line-clamp-2 text-xl font-semibold text-white group-hover:text-cyan-200">{note.title}</h2>
                <p className="mb-6 line-clamp-3 text-sm leading-6 text-slate-400">{note.description || 'Well-organized notes from campus contributors.'}</p>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{note.college || 'Campus contributor'}</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-cyan-200">₹{note.price || 'Free'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
};

export default Notes;
