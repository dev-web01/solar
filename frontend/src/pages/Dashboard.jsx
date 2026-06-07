import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Download, CheckCircle, AlertTriangle, Info, MapPin } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${API_URL}/api/projects/${id}/`)
      .then(res => {
        setProject(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return <div className="text-center text-slate-400 mt-20">Project not found</div>;

  const { analysis, prediction, report } = project;

  // Chart Data
  const roiData = {
    labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25'],
    datasets: [
      {
        label: 'Cumulative Savings ($)',
        data: [
          prediction?.annual_savings,
          prediction?.annual_savings * 5,
          prediction?.annual_savings * 10,
          prediction?.annual_savings * 15,
          prediction?.annual_savings * 20,
          prediction?.annual_savings * 25
        ],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Installation Cost ($)',
        data: Array(6).fill(prediction?.installation_cost),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        tension: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#cbd5e1' } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
    }
  };

  const scoreColor = analysis?.solar_score > 7 ? 'text-emerald-400' : analysis?.solar_score > 4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
          <p className="text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> {project.location}</p>
        </div>
        {report?.report_pdf && (
          <a
            href={`${API_URL}${report.report_pdf}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors border border-slate-600"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Scores & AI Insights */}
        <div className="space-y-8">
          {/* Solar Score Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="text-slate-400 font-medium mb-2">Solar Feasibility Score</h3>
            <div className={`text-6xl font-black ${scoreColor} mb-2`}>
              {analysis?.solar_score}<span className="text-2xl text-slate-500">/10</span>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> AI Confidence: {analysis?.confidence_score}%
            </p>
          </div>

          {/* AI Analysis Details */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" /> AI Site Analysis
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Light Intensity</span>
                  <span className="text-emerald-400 font-bold">{analysis?.light_intensity_percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${analysis?.light_intensity_percentage}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Shadow Coverage</span>
                  <span className="text-amber-400 font-bold">{analysis?.shadow_coverage_percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${analysis?.shadow_coverage_percentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Obstacles */}
            {analysis?.obstacle_data && Object.keys(analysis.obstacle_data).length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Detected Obstacles</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.obstacle_data).map(([key, val]) => (
                    val > 0 && (
                      <span key={key} className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-300 capitalize flex items-center gap-2">
                        {key.replace('_', ' ')} <span className="bg-slate-600 text-white text-xs px-2 py-0.5 rounded-full">{val}</span>
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Generation & Financials */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <p className="text-slate-400 text-sm mb-1">Recommended System</p>
              <p className="text-3xl font-bold text-white">{analysis?.recommended_system_size_kw} <span className="text-lg text-slate-500">kW</span></p>
              <p className="text-xs text-slate-500 mt-2">{prediction?.panels_required} Panels ({analysis?.recommended_panel_orientation})</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <p className="text-slate-400 text-sm mb-1">Annual Generation</p>
              <p className="text-3xl font-bold text-cyan-400">{prediction?.annual_generation_kwh?.toLocaleString()} <span className="text-lg text-slate-500">kWh</span></p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5" />
              <p className="text-slate-400 text-sm mb-1">Annual Savings</p>
              <p className="text-3xl font-bold text-emerald-400">${prediction?.annual_savings?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Payback in {prediction?.payback_period_years} yrs</p>
            </div>
          </div>

          {/* ROI Chart */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-6">Financial ROI Projection</h3>
            <div className="h-[300px]">
              <Line data={roiData} options={chartOptions} />
            </div>
          </div>
          
          {/* Images Gallery */}
          {project.images && project.images.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold text-white mb-4">Uploaded Rooftop Images</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {project.images.map(img => (
                  <img 
                    key={img.id} 
                    src={`${API_URL}${img.image}`} 
                    alt="Rooftop" 
                    className="h-48 w-64 object-cover rounded-xl snap-start border border-slate-700 shadow-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
