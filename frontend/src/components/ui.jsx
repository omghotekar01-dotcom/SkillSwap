import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const baseMotion = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.36, ease: 'easeOut' },
};

export const PageShell = ({ children, className = '' }) => (
  <motion.main
    className={`app-bg ${className}`}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
  >
    <div className="pointer-events-none fixed left-[-18rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-cyan-500/12 blur-3xl" />
    <div className="pointer-events-none fixed right-[-16rem] bottom-[-4rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/12 blur-3xl" />
    {children}
  </motion.main>
);

export const PageContainer = ({ children, className = '' }) => (
  <div className={`page-container ${className}`}>{children}</div>
);

export const GlassCard = ({ children, className = '' }) => (
  <motion.div className={`card floating-card ${className}`} {...baseMotion} whileHover={{ y: -6, scale: 1.01 }}>
    {children}
  </motion.div>
);

export const GradientBadge = ({ children, className = '' }) => (
  <span className={`badge-gradient ${className}`}>{children}</span>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card py-14 text-center">
    {Icon && (
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300 shadow-lg shadow-cyan-500/10">
        <Icon size={24} />
      </div>
    )}
    <p className="text-lg font-semibold text-white">{title}</p>
    {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const FloatingAction = ({ to, children, className = '' }) => (
  <Link to={to} className={`btn-primary inline-flex items-center justify-center ${className}`}>
    {children}
  </Link>
);

export const AnimatedInput = ({ className = '', ...props }) => (
  <motion.input
    className={`input-field ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    {...props}
  />
);

export const SearchBar = ({ value, onChange, placeholder = 'Search campus services, notes…' }) => (
  <motion.div
    className="glass flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur-xl"
    {...baseMotion}
  >
    <span className="text-slate-300">🔍</span>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field w-full border-none bg-transparent px-0 text-sm placeholder:text-slate-500 focus:ring-0"
    />
  </motion.div>
);

export const DashboardWidget = ({ title, value, metric, icon, accent = 'from-cyan-400 to-violet-500', className = '' }) => (
  <GlassCard className={`border border-white/10 ${className}`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        {metric && <p className="mt-2 text-sm text-slate-400">{metric}</p>}
      </div>
      <div className={`grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-cyan-500/20`}>{icon}</div>
    </div>
  </GlassCard>
);
