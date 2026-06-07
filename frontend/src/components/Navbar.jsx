import { Link } from 'react-router-dom';
import { Sun } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Sun className="w-8 h-8 text-emerald-400 group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-xl tracking-tight text-white">SolarVision<span className="text-emerald-400">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/new" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors shadow-lg shadow-emerald-500/20">
              New Assessment
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
