import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, MapPin, ExternalLink, ShieldCheck, ArrowUpRight, ArrowDownRight, Info, Search } from 'lucide-react';
import { MarketIndicator, NeighborhoodInsight } from '../types/database';
import { api } from '../services/api';

export const MarketInsightsPage: React.FC = () => {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Gemini Maps Grounding Interactive Analyzer
  const [targetCity, setTargetCity] = useState('الرياض');
  const [targetDistrict, setTargetDistrict] = useState('الملقا');
  const [aiInsight, setAiInsight] = useState<NeighborhoodInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getMarketIndicators();
        if (res.success) {
          setIndicators(res.indicators);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    runAiAnalysis('الرياض', 'الملقا');
  }, []);

  const runAiAnalysis = async (c: string, d: string) => {
    setAiLoading(true);
    try {
      const res = await api.getNeighborhoodInsights({ city: c, district: d });
      if (res.success) {
        setAiInsight(res.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDistrict.trim()) return;
    runAiAnalysis(targetCity, targetDistrict);
  };

  const filtered = cityFilter
    ? indicators.filter((i) => i.city.includes(cityFilter))
    : indicators;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-right">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>البيانات والمؤشرات العقارية المعتمدة</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          المؤشرات السوقية وتحليلات الأحياء
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          بيانات موثوقة تستند إلى الصفقات الفعلية المسجلة لدى الهيئة العامة للعقار والبورصة العقارية، مصحوبة بتحليلات حية للأحياء والمرافق عبر الذكاء الاصطناعي وخرائط Google Maps.
        </p>
      </div>

      {/* AI Neighborhood Analyzer powered by gemini-3.8-flash & googleMaps */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحليل استكشافي ذكي مدعوم بخرائط Google Maps الحية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading">
              مستكشف الأحياء والخدمات الذكي
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              اختر أي مدينة وحي بالمملكة للاطلاع على تحليل متكامل للمدارس، المستشفيات، والمرافق الترفيهية مع روابط خرائط Google المباشرة.
            </p>
          </div>
        </div>

        {/* Input bar */}
        <form onSubmit={handleRunAnalysis} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div>
            <select
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
            >
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الخبر">الخبر</option>
              <option value="الدمام">الدمام</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="اكتب اسم الحي (مثال: النرجس، الشاطئ، حطين)"
              value={targetDistrict}
              onChange={(e) => setTargetDistrict(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {aiLoading ? (
                <span>جاري استدعاء Google Maps...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>تحليل الحي ومرافقه</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results of AI Grounding */}
        {aiLoading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">
              جاري فحص مرافق حي {targetDistrict} وربط البيانات مع خرائط Google Maps...
            </p>
          </div>
        ) : aiInsight ? (
          <div className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 leading-relaxed text-xs text-slate-200">
              {aiInsight.summary}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">المدارس والتعليم</h4>
                <ul className="space-y-1 text-slate-300">
                  {aiInsight.schools.map((s, idx) => (
                    <li key={idx} className="line-clamp-1">• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-400 flex items-center gap-1.5">الرعاية الصحية والمستشفيات</h4>
                <ul className="space-y-1 text-slate-300">
                  {aiInsight.hospitals.map((h, idx) => (
                    <li key={idx} className="line-clamp-1">• {h}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">الحدائق والمرافق العامة</h4>
                <ul className="space-y-1 text-slate-300">
                  {aiInsight.parks.map((p, idx) => (
                    <li key={idx} className="line-clamp-1">• {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Direct Google Maps links */}
            {aiInsight.groundingUrls && aiInsight.groundingUrls.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  معالم وروابط حقيقية على Google Maps:
                </span>
                <div className="flex flex-wrap gap-2">
                  {aiInsight.groundingUrls.map((chunk, i) => (
                    <a
                      key={i}
                      href={chunk.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 text-xs px-3.5 py-1.5 rounded-xl transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{chunk.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Official Market Indices Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            مؤشرات الأسعار والصفقات المسجلة
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">تصفية المؤشرات:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-emerald-500"
            >
              <option value="">جميع المدن</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الخبر">الخبر</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((ind) => (
            <div
              key={ind.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-700">{ind.city}</span>
                <span>حي {ind.district}</span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500">
                  {ind.propertyType === 'villa' ? 'فلل سكنية' : 'شقق عائلية'} ({ind.purpose === 'sale' ? 'بيع' : 'إيجار سنوي'})
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {new Intl.NumberFormat('ar-SA').format(ind.avgPricePerSqm)}{' '}
                  <span className="text-xs font-normal text-emerald-700">ر.س/م²</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`flex items-center gap-1 font-bold ${
                    ind.quarterlyChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {ind.quarterlyChangePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>
                    {ind.quarterlyChangePercent >= 0 ? '+' : ''}
                    {ind.quarterlyChangePercent}%
                  </span>
                </span>
                <span className="text-slate-400">{ind.totalTransactionsRecorded} صفقة</span>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="line-clamp-1">المصدر: {ind.source}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
