const StatsCard = ({ label, value, icon: Icon, color = 'indigo', sub }) => {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    cyan:   'bg-cyan-500/10   text-cyan-300    border-cyan-500/20',
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <div className="card floating-card flex items-center gap-4">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${colors[color] || colors.indigo}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl sm:text-3xl font-semibold text-white">{value}</p>
        <p className="truncate text-sm text-slate-400">{label}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
