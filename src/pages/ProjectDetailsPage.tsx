import React, { useState, useEffect } from 'react';
import { Project, ProjectUnit } from '../types/database';
import { api } from '../services/api';
import { MapPin, Calendar, Building, ArrowRight, Bed, Maximize2, CheckCircle2, ShieldCheck, Phone, Check } from 'lucide-react';

interface ProjectDetailsPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('all');
  const [inquiryUnit, setInquiryUnit] = useState<ProjectUnit | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const res = await api.getProject(projectId);
        if (res.success && res.project) {
          setProject(res.project);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-100 rounded-3xl aspect-[16/9] animate-pulse" />
      </div>
    );
  }

  const units = project.units || [];
  const filteredUnits =
    unitStatusFilter === 'all' ? units : units.filter((u) => u.status === unitStatusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">متاحة للحجز</span>;
      case 'reserved':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">محجوزة مؤقتاً</span>;
      case 'sold':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">تم البيع</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة المشاريع</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/7] sm:aspect-[21/8] bg-slate-900 shadow-xl">
        <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 right-6 left-6 text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Building className="w-3.5 h-3.5" />
            <span>المطور: {project.developerName}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading">{project.name}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>
              {project.city}، حي {project.district}
            </span>
            <span>•</span>
            <Calendar className="w-4 h-4 text-slate-300" />
            <span>التسليم المتوقع: {project.handoverDate}</span>
          </div>
        </div>
      </div>

      {/* Description & Masterplan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
              عن المشروع والمجتمع السكني
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-3">مرافق وخدمات المجتمع:</h3>
              <div className="flex flex-wrap gap-2">
                {project.features.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{f}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Units Inventory */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  الوحدات العقارية المتاحة ({units.length} وحدة مسجلة)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تصفح الوحدات المحددة بالأسعار والمساحات مع إمكانية طلب الحجز
                </p>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setUnitStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    unitStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  الكل ({units.length})
                </button>
                <button
                  onClick={() => setUnitStatusFilter('available')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    unitStatusFilter === 'available' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  متاحة ({units.filter((u) => u.status === 'available').length})
                </button>
                <button
                  onClick={() => setUnitStatusFilter('reserved')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    unitStatusFilter === 'reserved' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  محجوزة ({units.filter((u) => u.status === 'reserved').length})
                </button>
              </div>
            </div>

            {/* Units List Table/Cards */}
            <div className="space-y-3">
              {filteredUnits.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-100">
                      {u.unitNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.unitType}</span>
                        {getStatusBadge(u.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          {u.areaSqm} م²
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5" />
                          {u.rooms} غرف
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400">سعر الوحدة</div>
                      <div className="text-base font-black text-slate-900">
                        {new Intl.NumberFormat('ar-SA').format(u.price)} ر.س
                      </div>
                    </div>

                    {u.status === 'available' ? (
                      <button
                        onClick={() => {
                          setInquiryUnit(u);
                          setInquirySubmitted(false);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        طلب حجز واستفسار
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed"
                      >
                        غير متاحة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Developer Contact Card */}
        <div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 font-heading">
              مركز مبيعات المشروع
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                يقوم فريق المبيعات بتزويدك بكتيب المخططات والمواصفات التفصيلية، وجدولة زيارة لفيلا أو شقة العرض في مقر المشروع.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">ساعات الاستقبال:</div>
              <div className="text-slate-500">من السبت إلى الخميس: 9:00 ص - 8:00 م</div>
            </div>
            <a
              href={`tel:920001234`}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition text-xs"
            >
              <Phone className="w-4 h-4" />
              <span>الاتصال بمركز المبيعات</span>
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              طلب استفسار وحجز للوحدة رقم ({inquiryUnit.unitNumber})
            </h3>
            {inquirySubmitted ? (
              <div className="py-6 text-center text-emerald-600 space-y-2">
                <Check className="w-12 h-12 mx-auto bg-emerald-100 rounded-full p-2" />
                <div className="font-bold text-sm">تم إرسال طلبك إلى المطور العقاري بنجاح!</div>
                <p className="text-xs text-slate-500">سيتواصل معك مستشار المبيعات خلال ساعات العمل الرسمية.</p>
                <button
                  onClick={() => setInquiryUnit(null)}
                  className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs mt-3"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  الوحدة: <strong>{inquiryUnit.unitType}</strong> بمساحة {inquiryUnit.areaSqm} م² — السعر:{' '}
                  <strong>{new Intl.NumberFormat('ar-SA').format(inquiryUnit.price)} ر.س</strong>
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    defaultValue="أحمد بن فهد الدوسري"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الجوال</label>
                  <input
                    type="text"
                    defaultValue="+966501112233"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setInquiryUnit(null)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setInquirySubmitted(true)}
                    className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl hover:bg-emerald-700"
                  >
                    تأكيد إرسال الطلب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
