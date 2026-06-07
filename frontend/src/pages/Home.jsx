import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, MapPin, Zap } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8000';
    axios.get(`${API_URL}/api/projects/`)
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Unlock Your Building's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Solar Potential</span>
          </h1>
          <p className="text-lg text-slate-300">
            Upload images of your rooftop and let our AI engine instantly calculate solar feasibility, detect obstacles, predict energy generation, and estimate your ROI.
          </p>
          <div className="pt-4">
            <Link to="/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5">
              Start Free Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Recent Projects */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" /> Recent Assessments
        </h2>
        
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400">No projects yet. Start your first assessment!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link key={project.id} to={`/project/${project.id}`} className="group relative rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-emerald-500/50 p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-slate-400 flex items-center gap-1 mb-4 text-sm">
                  <MapPin className="w-4 h-4" /> {project.location}
                </p>
                <div className="flex justify-between items-end mt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Solar Score</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {project.analysis ? `${project.analysis.solar_score}/10` : 'Pending'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
