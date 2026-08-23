import { useState, useEffect } from 'react';
import { FiBarChart, FiUsers, FiBook, FiTrendingUp, FiSearch, FiZap, FiClock } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { GradientBadge, PageContainer, PageShell } from '../components/ui';
import toast from 'react-hot-toast';

const AI = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [projects, setProjects] = useState({ suggestedNotes: [], suggestedServices: [] });
  const [noteId, setNoteId] = useState('');
  const [summary, setSummary] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get('/ai/analytics'),
      api.get('/ai/recommend/collaborators'),
      api.get('/ai/recommend/projects')
    ]).then(([analyticsRes, collaboratorsRes, projectsRes]) => {
      setAnalytics(analyticsRes.data);
      setCollaborators(collaboratorsRes.data.collaborators || []);
      setProjects({
        suggestedNotes: projectsRes.data.suggestedNotes || [],
        suggestedServices: projectsRes.data.suggestedServices || []
      });
    }).catch(err => {
      console.error('AI load error:', err);
      toast.error('Unable to load AI insights right now.');
      setAnalytics(null);
      setCollaborators([]);
      setProjects({ suggestedNotes: [], suggestedServices: [] });
    }).finally(() => setLoading(false));
  }, [user]);

  const summarizeNote = async () => {
    if (!noteId) {
      toast.error('Please enter a note ID');
      return;
    }
    setSummarizing(true);
    try {
      const { data } = await api.post(`/ai/notes/${noteId}/summary`);
      setSummary(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Summary failed');
    } finally {
      setSummarizing(false);
    }
  };

  const detectDuplicates = async () => {
    if (!noteId) {
      toast.error('Please enter a note ID');
      return;
    }
    setDetecting(true);
    try {
      const { data } = await api.post(`/ai/notes/${noteId}/plagiarism`);
      setDuplicates(data.duplicates || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate check failed');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <GradientBadge>AI Insights</GradientBadge>
            <h1 className="mt-3 text-4xl font-semibold text-white">Campus AI workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Get smart recommendations, analytics, and note summaries powered by campus data and platform activity.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Users</p>
              <p className="mt-3 text-2xl font-semibold text-white">{analytics?.usersCount ?? '—'}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-violet-400">Services</p>
              <p className="mt-3 text-2xl font-semibold text-white">{analytics?.servicesCount ?? '—'}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Notes</p>
              <p className="mt-3 text-2xl font-semibold text-white">{analytics?.notesCount ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] mb-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiBarChart className="text-cyan-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">Campus analytics</h2>
                <p className="text-sm text-slate-400">AI trends from notes and services on the platform.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 w-full rounded-3xl bg-white/5 animate-pulse" />)}
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trending skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analytics.trendingSkills?.slice(0, 6).map(item => (
                      <span key={item.label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{item.label}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Popular subjects</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analytics.popularSubjects?.slice(0, 6).map(item => (
                      <span key={item.label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{item.label}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analytics.mostRequestedCategories?.slice(0, 6).map(item => (
                      <span key={item.label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{item.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Analytics are unavailable. Please retry after signing in.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiUsers className="text-violet-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">Collaborator picks</h2>
                <p className="text-sm text-slate-400">AI-selected team members for your next project.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full rounded-3xl bg-white/5 animate-pulse" />)}
              </div>
            ) : collaborators.length ? (
              <div className="space-y-3">
                {collaborators.map(collab => (
                  <div key={collab._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{collab.name}</p>
                        <p className="text-xs text-slate-400">{collab.college} · Semester {collab.semester}</p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">Score {collab.score}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Skills: {(collab.skills || []).join(', ') || 'No skills listed yet'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No collaborator matches available yet.</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mb-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiBook className="text-emerald-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">Project recommendations</h2>
                <p className="text-sm text-slate-400">AI suggestions for notes and services to jumpstart your campus work.</p>
              </div>
            </div>
            {projects.suggestedNotes.length || projects.suggestedServices.length ? (
              <div className="space-y-4">
                {projects.suggestedNotes.map(note => (
                  <div key={note.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{note.title}</p>
                    <p className="mt-1 text-xs text-slate-400">Note · {note.subject} · Score {note.score}</p>
                  </div>
                ))}
                {projects.suggestedServices.map(svc => (
                  <div key={svc.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{svc.title}</p>
                    <p className="mt-1 text-xs text-slate-400">Service · {svc.category} · Score {svc.score}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No project suggestions available.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiSearch className="text-cyan-300" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">Smart note tools</h2>
                <p className="text-sm text-slate-400">Summarize any note or check for overlap by note ID.</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-slate-300">
                Note ID
                <input
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                  placeholder="note-1"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={summarizeNote} disabled={summarizing} className="btn-primary w-full text-sm py-3">
                  {summarizing ? 'Summarizing…' : 'Summarize note'}
                </button>
                <button onClick={detectDuplicates} disabled={detecting} className="btn-ghost w-full text-sm py-3">
                  {detecting ? 'Checking…' : 'Check duplicates'}
                </button>
              </div>
              {summary && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-300">
                  <p className="text-sm font-semibold text-white">Summary</p>
                  <p className="mt-2 text-sm leading-relaxed">{summary.summary}</p>
                </div>
              )}
              {duplicates.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-300">
                  <p className="text-sm font-semibold text-white">Potential duplicates</p>
                  <ul className="mt-2 space-y-2">
                    {duplicates.map(item => (
                      <li key={item.id} className="text-sm text-slate-300">{item.title} — similarity {item.similarity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiZap className="text-violet-300" size={22} />
            <div>
              <h2 className="text-lg font-semibold text-white">Summary</h2>
              <p className="text-sm text-slate-400">AI features are available with an authenticated account and work in both MongoDB and fallback modes.</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Explore smarter campus collaboration with recommendations that help you find the right teammates and resources faster.</p>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default AI;
