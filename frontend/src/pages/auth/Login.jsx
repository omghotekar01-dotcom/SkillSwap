import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    const email = String(form.email || '').trim().toLowerCase();
    const password = String(form.password || '');
    if (!email || !password) return toast.error('Fill all fields');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg grid min-h-screen place-items-center p-4 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
      <div className="hidden h-full w-full max-w-3xl flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 shadow-2xl shadow-black/25 backdrop-blur-2xl lg:flex">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600">
            <FiZap />
          </div>
          <span className="text-xl font-semibold">SkillSwap Campus</span>
        </Link>
        <div className="space-y-6">
          <p className="badge-gradient w-fit">AI campus workspace</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-white">Enter your premium student talent network.</h1>
          <p className="max-w-lg text-slate-400">Manage services, notes, reputation, and campus conversations from one secure command center.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Trust score', 'Live chat', 'Notes market'].map(item => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FiZap className="text-white text-lg" />
          </div>
          <span className="text-xl font-semibold text-white">SkillSwap <span className="gradient-text">Campus</span></span>
        </div>

        {/* Card */}
        <div className="card">
          <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your account to continue</p>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="email" type="email" value={form.email}
                  onChange={onChange} placeholder="you@college.edu"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-gray-400">Password</label>
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={onChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !form.email || !form.password} className="btn-primary w-full mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo credentials */}
          <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3 mb-4 text-xs text-gray-400 space-y-0.5">
            <p className="text-indigo-400 font-medium mb-1">Demo credentials</p>
            <p>Student — <span className="text-gray-300">student@demo.com / demo123</span></p>
            <p>Admin &nbsp;— <span className="text-gray-300">admin@demo.com / admin123</span></p>
          </div>

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
