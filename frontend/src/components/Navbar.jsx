import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiBook, FiShoppingBag, FiZap, FiVideo, FiMoon, FiSun } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const NAV = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/marketplace', label: 'Services', icon: FiShoppingBag },
  { to: '/notes', label: 'Notes', icon: FiBook },
  { to: '/ai', label: 'AI', icon: FiZap },
  { to: '/video', label: 'Video', icon: FiVideo },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme');
    const defaultTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(defaultTheme);
    document.documentElement.classList.toggle('dark', defaultTheme === 'dark');
    document.body.classList.toggle('light', defaultTheme === 'light');
    document.body.classList.toggle('dark', defaultTheme === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    document.body.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <motion.nav
      className="fixed inset-x-0 top-4 z-50 px-4"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[2rem] border border-white/10 bg-slate-950/75 px-4 py-3 shadow-[0_30px_90px_-38px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:-translate-y-0.5">
            <FiZap size={24} />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">SkillSwap</p>
            <p className="text-lg font-semibold text-white">Campus</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive(to)
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-600/25 text-white shadow-lg shadow-cyan-500/10 border border-cyan-300/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <Icon size={16} /> <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition duration-300 hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun size={18} className="text-amber-300" /> : <FiMoon size={18} className="text-slate-700" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDdOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-lg text-slate-100 transition duration-300 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate text-sm font-medium text-slate-100">{user.name}</span>
              </button>

              <AnimatePresence>
                {ddOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-14 z-10 w-52 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-indigo-600/15 hover:text-white"
                    >
                      <FiGrid size={14} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-indigo-600/15 hover:text-white"
                    >
                      <FiUser size={14} /> Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDdOpen(false)}
                        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-indigo-300 transition hover:bg-indigo-600/15 hover:text-white"
                      >
                        <FiGrid size={14} /> Admin Panel
                      </Link>
                    )}
                    <div className="my-2 border-t border-white/10" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-600/15 hover:text-white"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost rounded-2xl px-4 py-2 text-sm font-medium">Login</Link>
              <Link to="/register" className="btn-primary rounded-2xl px-4 py-2 text-sm font-medium">Get Started</Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/95 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-2">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-indigo-600/15 hover:text-white"
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
            </div>
            {!user && (
              <div className="mt-3 space-y-2">
                <Link to="/login" onClick={() => setOpen(false)} className="block btn-ghost w-full rounded-2xl px-4 py-3 text-center text-sm">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block btn-primary w-full rounded-2xl px-4 py-3 text-center text-sm">Get Started</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
