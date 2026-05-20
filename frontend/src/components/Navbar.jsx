import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiBook, FiShoppingBag, FiZap } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const NAV = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/marketplace', label: 'Services', icon: FiShoppingBag },
  { to: '/notes',       label: 'Notes',    icon: FiBook },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FiZap className="text-white" />
          </div>
          <span className="font-semibold text-white hidden sm:block">
            SkillSwap <span className="gradient-text">Campus</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${pathname === to ? 'bg-white/10 text-white shadow-lg shadow-black/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button onClick={() => setDdOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-medium">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block max-w-[100px] truncate">{user.name}</span>
              </button>
              {ddOpen && (
                <div className="absolute right-0 top-11 w-44 glass rounded-xl py-1 shadow-xl shadow-black/40">
                        <Link to="/dashboard" onClick={() => setDdOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <FiGrid size={14} /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setDdOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <FiUser size={14} /> Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-300 hover:bg-white/5 transition-colors">
                      <FiGrid size={14} /> Admin
                    </Link>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-ghost py-1.5 px-4 text-sm">Login</Link>
              <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">Sign up</Link>
            </div>
          )}
          <button className="md:hidden p-2 text-gray-400" onClick={() => setOpen(p => !p)}>
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-950 border-t border-white/5 px-4 py-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">
              <Icon size={15} />{label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;