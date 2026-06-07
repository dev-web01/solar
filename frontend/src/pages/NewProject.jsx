import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Loader2, Building, MapPin, Ruler, DollarSign } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    roof_length: '',
    roof_width: '',
    roof_pitch: '20',
    roof_azimuth: 'South',
    panel_type: 'Standard',
    monthly_electricity_bill: ''
  });
  const [images, setImages] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Project
      const projectRes = await axios.post('http://localhost:8000/api/projects/', formData);
      const projectId = projectRes.data.id;

      // 2. Upload Images
      for (const img of images) {
        const imgData = new FormData();
        imgData.append('image', img);
        await axios.post(`http://localhost:8000/api/projects/${projectId}/upload_image/`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Trigger Analysis
      await axios.post(`http://localhost:8000/api/projects/${projectId}/analyze/`);

      // 4. Navigate to Dashboard
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to process project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">New Solar Assessment</h1>
          <p className="text-slate-400">Enter property details and upload rooftop images for AI analysis.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" /> Project Name
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. Smith Residence"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Location
              </label>
              <input
                required
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-400" /> Roof Length (m)
              </label>
              <input
                required
                type="number"
                step="0.1"
                name="roof_length"
                value={formData.roof_length}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. 15"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-400" /> Roof Width (m)
              </label>
              <input
                required
                type="number"
                step="0.1"
                name="roof_width"
                value={formData.roof_width}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Monthly Bill ($)
              </label>
              <input
                required
                type="number"
                step="1"
                name="monthly_electricity_bill"
                value={formData.monthly_electricity_bill}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. 150"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Roof Pitch (Degrees)</label>
              <input
                required
                type="number"
                step="1"
                name="roof_pitch"
                value={formData.roof_pitch}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Roof Direction</label>
              <select
                name="roof_azimuth"
                value={formData.roof_azimuth}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="South">South</option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="South-West">South-West</option>
                <option value="South-East">South-East</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Panel Efficiency</label>
              <select
                name="panel_type"
                value={formData.panel_type}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="Standard">Standard (15%)</option>
                <option value="Premium">Premium (20%)</option>
                <option value="Ultra">Ultra (22%)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-slate-300 block">Rooftop Images</label>
            <div className="relative border-2 border-dashed border-slate-600 rounded-2xl p-8 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group cursor-pointer text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 mx-auto mb-3 transition-colors" />
              <p className="text-slate-300 font-medium">Click or drag images to upload</p>
              <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG (Max 5MB each)</p>
              
              {images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-emerald-400 font-medium">{images.length} image(s) selected</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing AI Analysis...
                </>
              ) : (
                'Generate Feasibility Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
