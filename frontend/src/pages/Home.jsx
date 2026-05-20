import { Link } from 'react-router-dom';
import { FiSearch, FiZap, FiUsers, FiStar } from 'react-icons/fi';

const features = [
  {
    title: 'Campus services at your fingertips',
    description: 'Browse verified service providers for tutoring, projects, notes, and campus help.',
    icon: FiSearch,
  },
  {
    title: 'Earn while you help',
    description: 'List your skillset and get matched with students who need your expertise.',
    icon: FiZap,
  },
  {
    title: 'Secure payments & support',
    description: 'Trusted connections with direct messaging, ratings, and admin protection.',
    icon: FiStar,
  },
];

const Home = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_25%)]" />
      <div className="relative max-w-7xl mx-auto px-4 pt-28 pb-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-indigo-200 ring-1 ring-white/10">
              <FiUsers /> Empowering campus connections
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
              Discover skilled peers, launch requests, and earn on campus.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300 leading-8">
              SkillSwap Campus makes it easy to connect with verified students offering tutoring, design, development, note-sharing, and campus support services.
              Build your own profile, publish services, and grow your learning network.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/marketplace" className="btn-primary inline-flex items-center justify-center gap-2">
                Explore services
              </Link>
              <Link to="/register" className="btn-ghost inline-flex items-center justify-center gap-2">
                Join SkillSwap
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mt-8">
              <div className="glass rounded-3xl px-4 py-5 text-center shadow-xl shadow-black/20">
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-200">Trusted</p>
                <p className="mt-3 text-3xl font-semibold text-white">1200+</p>
                <p className="text-sm text-slate-400 mt-1">student collaborators</p>
              </div>
              <div className="glass rounded-3xl px-4 py-5 text-center shadow-xl shadow-black/20">
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-200">Live</p>
                <p className="mt-3 text-3xl font-semibold text-white">540+</p>
                <p className="text-sm text-slate-400 mt-1">active service listings</p>
              </div>
              <div className="glass rounded-3xl px-4 py-5 text-center shadow-xl shadow-black/20">
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-200">Rated</p>
                <p className="mt-3 text-3xl font-semibold text-white">4.9/5</p>
                <p className="text-sm text-slate-400 mt-1">average peer rating</p>
              </div>
            </div>
          </div>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-600/40 to-transparent blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <span className="rounded-full bg-white/5 px-3 py-1 uppercase tracking-[0.22em]">Campus spotlight</span>
                <span className="text-slate-400">Connect, collaborate, and grow</span>
              </div>
              <div className="rounded-3xl bg-slate-950/90 p-6 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-indigo-300 uppercase tracking-[0.24em]">New listing</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">AI project support</h2>
                  </div>
                  <div className="text-indigo-400 text-4xl">⚡</div>
                </div>
                <p className="mt-4 text-slate-400">Get help structuring your AI assignment, code reviews, and model deployment with expert student mentors.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="glass rounded-3xl p-5 hover:-translate-y-1 transition-transform duration-300">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600/15 text-indigo-300 mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
