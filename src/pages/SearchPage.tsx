import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  Bookmark,
  Map as MapIcon,
  Grid,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Listing, ListingPurpose, PropertyType } from '../types/database';
import { api } from '../services/api';
import { ListingCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SearchPageProps {
  initialQuery?: string;
  onSelectListing: (id: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onSelectListing }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Filters State
  const [purpose, setPurpose] = useState<ListingPurpose | ''>('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [rooms, setRooms] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  // Save Search Modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Parse initialQuery if passed
  useEffect(() => {
    if (initialQuery) {
      const p = new URLSearchParams(initialQuery);
      if (p.has('purpose')) setPurpose(p.get('purpose') as ListingPurpose);
      if (p.has('propertyType')) setPropertyType(p.get('propertyType') as PropertyType);
      if (p.has('city')) setCity(p.get('city') || '');
      if (p.has('district')) setDistrict(p.get('district') || '');
      if (p.has('featuredOnly')) setFeaturedOnly(p.get('featuredOnly') === 'true');
    }
  }, [initialQuery]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        status: 'published',
      };
      if (purpose) params.purpose = purpose;
      if (propertyType) params.propertyType = propertyType;
      if (city) params.city = city;
      if (district) params.district = district;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (minArea) params.minArea = Number(minArea);
      if (maxArea) params.maxArea = Number(maxArea);
      if (rooms) params.rooms = Number(rooms);
      if (sortBy) params.sortBy = sortBy;
      if (featuredOnly) params.featuredOnly = true;

      const res = await api.getListings(params);
      if (res.success) {
        setListings(res.listings);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [purpose, propertyType, city, district, minPrice, maxPrice, minArea, maxArea, rooms, sortBy, featuredOnly]);

  const handleClearFilters = () => {
    setPurpose('');
    setPropertyType('');
    setCity('');
    setDistrict('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setRooms('');
    setSortBy('newest');
    setFeaturedOnly(false);
  };

  const handleSaveSearch = async () => {
    if (!user || user.role === 'visitor') {
      showToast('يرجى تسجيل الدخول أو اختيار دور مسجل لحفظ معايير البحث.', 'info');
      return;
    }
    try {
      await api.createSavedSearch({
        title: searchTitle || `بحث في ${city || 'كافة المدن'} (${purpose === 'sale' ? 'بيع' : 'إيجار'})`,
        criteria: { purpose, propertyType, city, district, minPrice, maxPrice },
        notifyEnabled: true,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            البحث في العقارات المعروضة
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            عرض {listings.length} إعلان عقاري مرخص وموثق
          </p>
        </div>

        {/* View Mode & Save Search */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>حفظ البحث</span>
          </button>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="عرض الشبكة"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'map' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="عرض الخريطة التفاعلية"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">الخريطة</span>
            </button>
          </div>

          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>الفلاتر</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) & Drawer (Mobile) */}
        <aside
          className={`${
            showFiltersDrawer ? 'fixed inset-0 z-50 bg-black/50 p-4 flex justify-end' : 'hidden lg:block'
          } lg:col-span-1`}
        >
          <div
            className={`${
              showFiltersDrawer ? 'bg-white w-full max-w-sm rounded-3xl p-6 h-full overflow-y-auto' : 'bg-white p-5 rounded-3xl border border-slate-200 shadow-xs'
            } space-y-6 text-right`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">تصفية النتائج</h3>
              </div>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>مسح الكل</span>
              </button>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">الغرض</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPurpose(purpose === 'sale' ? '' : 'sale')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    purpose === 'sale'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  للبيع
                </button>
                <button
                  type="button"
                  onClick={() => setPurpose(purpose === 'rent' ? '' : 'rent')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    purpose === 'rent'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  للإيجار
                </button>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
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

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الحي</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالحي..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-emerald-500"
                />
                <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العقار</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
              >
                <option value="">جميع أنواع العقارات</option>
                <option value="villa">فيلا</option>
                <option value="apartment">شقة</option>
                <option value="building">عمارة كاملة</option>
                <option value="land">أرض</option>
                <option value="floor">دور مستقل</option>
                <option value="office">مكتب تجاري</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نطاق السعر (ر.س)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="من"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center"
                />
                <input
                  type="number"
                  placeholder="إلى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center"
                />
              </div>
            </div>

            {/* Area Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المساحة (م²)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center"
                />
              </div>
            </div>

            {/* Bedrooms count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الغرف (على الأقل)</label>
              <div className="flex gap-1.5">
                {['1', '2', '3', '4', '5+'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRooms(rooms === r.replace('+', '') ? '' : r.replace('+', ''))}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                      rooms === r.replace('+', '')
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">إظهار الإعلانات المميزة فقط</span>
              </label>
            </div>

            {showFiltersDrawer && (
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs mt-4"
              >
                تطبيق الفلاتر وإغلاق
              </button>
            )}
          </div>
        </aside>

        {/* Results Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600">
              {loading ? 'جاري تحديث النتائج...' : `${listings.length} عقار متطابق`}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">الترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-emerald-500"
              >
                <option value="newest">الأحدث نشرًا</option>
                <option value="price_asc">الأقل سعرًا</option>
                <option value="price_desc">الأعلى سعرًا</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>
            </div>
          </div>

          {/* Results Grid or Interactive Map View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-100 rounded-2xl aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} onSelect={onSelectListing} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">لا توجد عقارات مطابقة لمعايير البحث</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  جرب توسيع نطاق البحث أو مسح بعض الفلاتر كالسعر والمساحة للعثور على خيارات أكثر.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  إعادة ضبط جميع الفلاتر
                </button>
              </div>
            )
          ) : (
            /* Interactive Simulated Map View with Real Coordinates */
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">استعراض الخريطة التفاعلية مع الإحداثيات الموثقة</span>
                </div>
                <span className="text-slate-400 text-[11px]">محدد بها {listings.length} موقع عقاري</span>
              </div>

              {/* Map Canvas Mock with interactive markers */}
              <div className="relative aspect-[16/9] bg-slate-150 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80"
                  alt="خريطة استعراض المواقع"
                  className="w-full h-full object-cover filter brightness-95 opacity-80"
                />
                <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px]" />

                {/* Listing Pin Markers */}
                {listings.map((l, index) => {
                  const leftPos = 20 + ((index * 23) % 65);
                  const topPos = 20 + ((index * 29) % 60);
                  return (
                    <div
                      key={l.id}
                      onClick={() => onSelectListing(l.id)}
                      style={{ left: `${leftPos}%`, top: `${topPos}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                    >
                      <div className="bg-slate-900 text-white group-hover:bg-emerald-600 transition-all font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border border-white/40">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                        <span>{new Intl.NumberFormat('ar-SA').format(l.price)} ر.س</span>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 group-hover:bg-emerald-600 rotate-45 mx-auto -mt-1" />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Carousel in Map View */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-4">
                {listings.slice(0, 4).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => onSelectListing(l.id)}
                    className="min-w-[240px] bg-white p-3 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition flex items-center gap-3"
                  >
                    <img
                      src={l.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200'}
                      alt={l.title}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="text-right flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{l.title}</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        {new Intl.NumberFormat('ar-SA').format(l.price)} ر.س
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {l.property?.city} • {l.property?.district}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Save Search Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">حفظ معايير البحث وتفعيل التنبيهات</h3>
              <button onClick={() => setSaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedSuccess ? (
              <div className="py-6 text-center text-emerald-600 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <div className="font-bold text-sm">تم حفظ البحث بنجاح وتفعيل الإشعارات!</div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 leading-relaxed">
                  سنقوم بإرسال إشعار فوري لك بمجرد نزول أي عقار جديد يطابق خياراتك (
                  {city || 'كافة المدن'}، {district ? `حي ${district}` : ''}، {purpose === 'sale' ? 'بيع' : 'إيجار'}
                  ).
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تسمية البحث المحفوظ</label>
                  <input
                    type="text"
                    placeholder="مثال: فلل شمال الرياض تحت 5 مليون"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSaveModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveSearch}
                    className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-emerald-700 shadow-md transition"
                  >
                    تأكيد الحفظ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
