import { Link } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';

const Footer = () => (
  <footer className="border-t border-white/10 bg-slate-950/70 py-12 text-slate-300 backdrop-blur-2xl">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
      <div className="glass-surface space-y-5 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 text-white shadow-xl shadow-cyan-500/20">
            <FiZap size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">SkillSwap Campus</p>
            <p className="text-sm text-slate-400">Campus services, notes, and talent in one premium workspace.</p>
          </div>
        </div>
        <p className="max-w-md text-sm leading-7 text-slate-400">
          Secure peer discovery, trusted reviews, and real-time collaboration for modern student builders.
        </p>
      </div>

      <div className="glass-surface p-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Navigate</p>
        <div className="space-y-3 text-sm">
          <Link to="/" className="block text-slate-300 transition-colors hover:text-white">Home</Link>
          <Link to="/marketplace" className="block text-slate-300 transition-colors hover:text-white">Services</Link>
          <Link to="/notes" className="block text-slate-300 transition-colors hover:text-white">Notes</Link>
          <Link to="/dashboard" className="block text-slate-300 transition-colors hover:text-white">Dashboard</Link>
        </div>
      </div>

      <div className="glass-surface p-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Support</p>
        <div className="space-y-3 text-sm">
          <button type="button" className="block w-full text-left text-slate-300 transition-colors hover:text-white">Help center</button>
          <button type="button" className="block w-full text-left text-slate-300 transition-colors hover:text-white">Community</button>
          <button type="button" className="block w-full text-left text-slate-300 transition-colors hover:text-white">Terms</button>
        </div>
      </div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
      © {new Date().getFullYear()} SkillSwap Campus. Crafted for modern campus freelancing.
    </div>
  </footer>
);

export default Footer;
