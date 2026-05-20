import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiZap, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const STEPS = ['Account', 'Profile', 'Done'];

const passwordStrength = pw => {
  let s = 0;
  if (pw.length >= 6)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const StrengthBar = ({ pw }) => {
  const s = passwordStrength(pw);
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!pw) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= s ? colors[s] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${s <= 1 ? 'text-red-400' : s === 2 ? 'text-orange-400' : s === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[s]}
      </p>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [step, setStep]       = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', college: '', skills: ''
  });

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const nextStep = e => {
    e.preventDefault();
    if (step === 0) {
      if (!form.name || !form.email) return toast.error('Name and email required');
      if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error('Invalid email');
    }
    if (step === 1) {
      if (!form.password) return toast.error('Password required');
      if (form.password.length < 6) return toast.error('Min 6 characters');
      if (form.password !== form.confirm) return toast.error('Passwords do not match');
    }
    setStep(p => p + 1);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await register({ name: form.name, email: form.email, password: form.password, college: form.college, skills: skillsArr });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FiZap className="text-white text-lg" />
          </div>
          <span className="text-xl font-semibold text-white">SkillSwap <span className="gradient-text">Campus</span></span>
        </div>

        <div className="card">
          <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-6">Join thousands of students earning on campus</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 shrink-0
                  ${i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-400' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
                  {i < step ? <FiCheck size={12} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-indigo-400' : 'text-gray-600'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-indigo-600' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          {/* Step 0 — Basic info */}
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Full name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="name" value={form.name} onChange={onChange}
                    placeholder="Alex Johnson" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="email" type="email" value={form.email} onChange={onChange}
                    placeholder="you@college.edu" className="input-field pl-10" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Continue</button>
            </form>
          )}

          {/* Step 1 — Password */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={onChange}
                    placeholder="Min 6 characters" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <StrengthBar pw={form.password} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Confirm password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="confirm" type="password" value={form.confirm} onChange={onChange}
                    placeholder="Repeat password" className="input-field pl-10" />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button type="submit" className="btn-primary flex-1">Continue</button>
              </div>
            </form>
          )}

          {/* Step 2 — Profile */}
          {step === 2 && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">College / University</label>
                <div className="relative">
                  <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="college" value={form.college} onChange={onChange}
                    placeholder="MIT, Stanford, IIT…" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Skills <span className="text-gray-600">(comma separated, optional)</span>
                </label>
                <input name="skills" value={form.skills} onChange={onChange}
                  placeholder="React, Python, UI Design…" className="input-field" />
                {form.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-600/20 border border-indigo-500/30 rounded-md text-indigo-300 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-indigo-950/60 to-violet-950/60 border border-indigo-500/20 rounded-xl p-3 space-y-1.5">
                {['List services & earn money', 'Sell your college notes', 'Connect with campus talent'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-xs text-gray-300">
                    <FiCheck className="text-indigo-400 shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating…
                      </span>
                    : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;