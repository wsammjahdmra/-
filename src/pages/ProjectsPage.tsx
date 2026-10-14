import React, { useState, useEffect } from 'react';
import { Layers, MapPin, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Project } from '../types/database';
import { api } from '../services/api';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await api.getProjects();
        if (res.success) {
          setProjects(res.projects);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filtered = cityFilter
    ? projects.filter((p) => p.city.includes(cityFilter))
    : projects;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 text-right">
        <div>
          <span className="text-xs font-bold text-blue-600 block mb-1">المجتمعات العمرانية والضواحي السكنية</span>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            المشاريع العقارية المعتمدة
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            استكشف المشاريع الكبرى والضواحي السكنية الحديثة، مع إمكانية فرز الوحدات السكنية المتاحة للحجز والبيع على الخارطة.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">تصفية بالمدينة:</span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
          >
            <option value="">جميع المدن</option>
            <option value="الرياض">الرياض</option>
            <option value="جدة">جدة</option>
            <option value="الخبر">الخبر</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl aspect-[16/10] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={proj.imageUrl}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {proj.status === 'under_construction'
                      ? 'قيد الإنشاء'
                      : proj.status === 'ready'
                      ? 'جاهز للتسليم'
                      : 'بيع على الخارطة'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-xl">
                    التسليم: {proj.handoverDate}
                  </div>
                </div>

                <div className="p-6 text-right space-y-3">
                  <div className="text-xs font-bold text-emerald-700">{proj.developerName}</div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition font-heading">
                    {proj.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {proj.city}، حي {proj.district}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Features pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[11px] text-slate-400">يبدأ سعر الوحدات من</div>
                  <div className="text-base font-black text-slate-900">
                    {new Intl.NumberFormat('ar-SA').format(proj.priceStartsFrom)} ر.س
                  </div>
                </div>

                <div className="flex items-center gap-1 text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
                  <span>استعراض الوحدات ({proj.units?.length || proj.unitsTotal})</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
