import { Link } from 'react-router-dom';
import { FiSearch, FiMessageCircle, FiPlusCircle } from 'react-icons/fi';

const Widget = ({ icon: Icon, title, subtitle, to }) => (
  <Link to={to} className="group block rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md transition duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-cyan-500/10">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600/40 to-violet-600/40 flex items-center justify-center text-white">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  </Link>
);

const WidgetGrid = () => (
  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <Widget icon={FiSearch} title="Quick Search" subtitle="Find services fast" to="/marketplace" />
    <Widget icon={FiPlusCircle} title="Post a Service" subtitle="Share your skills" to="/marketplace/create" />
    <Widget icon={FiMessageCircle} title="Profile" subtitle="Update your campus identity" to="/profile" />
  </div>
);

export default WidgetGrid;
