import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Home,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  FileCheck2,
  Award,
} from 'lucide-react';
import { Listing, Project, MarketIndicator } from '../types/database';
import { api } from '../services/api';
import { ListingCard } from '../components/ListingCard';
import { useSettings } from '../context/SettingsContext';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectListing: (id: string) => void;
  onSelectProject: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectListing,
  onSelectProject,
}) => {
  const { settings } = useSettings();
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState<string>('');
  const [city, setCity] = useState<string>('الرياض');
  const [district, setDistrict] = useState<string>('');

  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [indicators, setIndicators] = useState<MarketIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [listRes, projRes, indRes] = await Promise.all([
          api.getListings({ status: 'published' }),
          api.getProjects(),
          api.getMarketIndicators(),
        ]);

        if (listRes.success) {
          const featured = listRes.listings.filter((l) => l.isFeatured);
          setFeaturedListings(featured.slice(0, 3));
          setRecentListings(listRes.listings.slice(0, 6));
        }

        if (projRes.success) {
          setProjects(projRes.projects.slice(0, 2));
        }

        if (indRes.success) {
          setIndicators(indRes.indicators.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (purpose) query.set('purpose', purpose);
    if (propertyType) query.set('propertyType', propertyType);
    if (city) query.set('city', city);
    if (district) query.set('district', district);
    onNavigate('search', query.toString());
  };

  const quickCategories = [
    { label: 'فلل للبيع', icon: <Home className="w-5 h-5 text-emerald-600" />, p: 'sale', t: 'villa' },
    { label: 'شقق للإيجار', icon: <Building2 className="w-5 h-5 text-blue-600" />, p: 'rent', t: 'apartment' },
    { label: 'أدوار فاخرة', icon: <Layers className="w-5 h-5 text-purple-600" />, p: 'sale', t: 'floor' },
    { label: 'عماير تجارية', icon: <Building2 className="w-5 h-5 text-amber-600" />, p: 'sale', t: 'building' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric background overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>المنصة العقارية المعتمدة والموثقة برخص فال الرسمية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight">
            ابحث عن عقارك القادم <br />
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400"
            >
              بكل ثقة وشفافية نظامية
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            آلاف الإعلانات العقارية والمشاريع السكنية الموثقة برقم الصك ورخصة الإعلان المعتمدة من الهيئة العامة للعقار.
          </p>

          {/* Search Box Box */}
          <div className="max-w-4xl mx-auto mt-8 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-900 border border-white/20 text-right">
            {/* Purpose Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setPurpose('sale')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  purpose === 'sale'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                عقارات للبيع
              </button>
              <button
                type="button"
                onClick={() => setPurpose('rent')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  purpose === 'rent'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                عقارات للإيجار
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدينة</label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="">جميع المدن</option>
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الخبر">الخبر</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الحي</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: الملقا، النرجس، الشاطئ"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-emerald-500"
                  />
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع العقار</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="villa">فيلا</option>
                  <option value="apartment">شقة</option>
                  <option value="building">عمارة كاملة</option>
                  <option value="land">أرض</option>
                  <option value="floor">دور مستقل</option>
                  <option value="office">مكتب تجاري</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>بحث متقدم</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick category pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPurpose(cat.p as any);
                  setPropertyType(cat.t);
                  onNavigate('search', `purpose=${cat.p}&propertyType=${cat.t}`);
                }}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-2xl transition cursor-pointer backdrop-blur-sm"
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>عقارات مميزة ومدققة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                إعلانات مختارة بعناية
              </h2>
            </div>
            <button
              onClick={() => onNavigate('search', 'featuredOnly=true')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <span>مشاهدة الكل</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((l) => (
              <ListingCard key={l.id} listing={l} onSelect={onSelectListing} />
            ))}
          </div>
        </section>
      )}

      {/* Major Projects Showcase */}
      {projects.length > 0 && (
        <section className="bg-slate-100/70 py-12 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-blue-600 block mb-1">مشاريع كبرى وضواحي متكاملة</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                  المشاريع العقارية السكنية
                </h2>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                <span>استكشاف كافة المشاريع</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row"
                >
                  <div className="md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden relative">
                    <img
                      src={proj.imageUrl}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      {proj.status === 'under_construction'
                        ? 'قيد الإنشاء'
                        : proj.status === 'ready'
                        ? 'جاهز للسكن'
                        : 'على الخارطة'}
                    </div>
                  </div>
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-700 mb-1">{proj.developerName}</div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                        {proj.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {proj.city}، حي {proj.district}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400">يبدأ السعر من</div>
                        <div className="text-base font-bold text-slate-900">
                          {new Intl.NumberFormat('ar-SA').format(proj.priceStartsFrom)} ر.س
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 group-hover:underline">
                        عرض الوحدات ({proj.units?.length || 0})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 block mb-1">أحدث العروض المضافة</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              عقارات منشورة حديثاً
            </h2>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>استعراض جميع الإعلانات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentListings.map((l) => (
            <ListingCard key={l.id} listing={l} onSelect={onSelectListing} />
          ))}
        </div>
      </section>

      {/* Market Indicators Snapshot */}
      {indicators.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-700/80 gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>نبض السوق العقاري الحقيقي</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading">
                  مؤشرات متوسط أسعار المتر المربع
                </h3>
              </div>
              <button
                onClick={() => onNavigate('market')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                تحليل الأحياء بالذكاء الاصطناعي مع Google Maps
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {indicators.map((ind) => (
                <div key={ind.id} className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 mb-1">
                    {ind.city} • حي {ind.district}
                  </div>
                  <div className="text-sm font-bold text-white mb-2">
                    {ind.propertyType === 'villa' ? 'فلل سكنية' : 'شقق عائلية'} ({ind.purpose === 'sale' ? 'بيع' : 'إيجار'})
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mb-1">
                    {new Intl.NumberFormat('ar-SA').format(ind.avgPricePerSqm)}{' '}
                    <span className="text-xs font-normal text-slate-300">ر.س/م²</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <span
                      className={`font-bold ${
                        ind.quarterlyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ind.quarterlyChangePercent >= 0 ? '+' : ''}
                      {ind.quarterlyChangePercent}% خلال الربع
                    </span>
                    <span>{ind.totalTransactionsRecorded} صفقة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust & Regulations Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700">لماذا يختارنا الباحثون والمعلنون؟</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
            معايير صارمة تضمن حقوق الجميع
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">التحقق من التراخيص ورخص فال</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              لا يُنشر أي إعلان في المنصة قبل التدقيق في رقم الترخيص العقاري ومطابقته مع اللائحة الصادرة من الهيئة العامة للعقار.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">فواتير ضريبية ومنع المعاملات المزدوجة</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              جميع أوامر الدفع للترويج محمية بنظام Idempotency Keys، مع إصدار فواتير إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">مراقبة الجودة وحماية المبلّغين</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              نظام رقابة وإشراف على مدار الساعة مع رقم مرجعي رسمي لكل بلاغ لحماية المستفيدين من الإعلانات الوهمية أو الأسعار المضللة.
            </p>
          </div>
        </div>
      </section>

      {/* Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-right">
            <h3 className="text-2xl sm:text-3xl font-black font-heading">
              هل أنت مالك عقار أو وسيط معتمد؟
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl leading-relaxed">
              اعرض عقارك أمام مئات الآلاف من المشترين والمستأجرين الجادين بسهولة تامة وبأعلى درجات الموثوقية.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create-ad')}
            className="bg-white text-emerald-900 hover:bg-slate-50 font-bold px-8 py-3.5 rounded-2xl shadow-lg transition cursor-pointer text-sm flex-shrink-0"
          >
            نشر إعلان جديد الآن
          </button>
        </div>
      </section>
    </div>
  );
};
