import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Bell, BellOff, Trash2, ArrowLeft } from 'lucide-react';
import { Listing, SavedSearch } from '../types/database';
import { api } from '../services/api';
import { ListingCard } from '../components/ListingCard';

interface FavoritesPageProps {
  onSelectListing: (id: string) => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onSelectListing, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'saved_searches'>('favorites');
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [favRes, schRes] = await Promise.all([api.getFavorites(), api.getSavedSearches()]);
      if (favRes.success) setFavorites(favRes.listings);
      if (schRes.success) setSavedSearches(schRes.savedSearches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 block mb-1">خدمات المستخدم الشخصية</span>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            المفضلة والبحث المحفوظ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            الوصول السريع إلى العقارات المحفوظة وإدارة تنبيهات البحث الفورية
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'favorites' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>العقارات المفضلة ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved_searches')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'saved_searches' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>البحث المحفوظ ({savedSearches.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'favorites' ? (
        favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                onSelect={onSelectListing}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">قائمة المفضلة فارغة حالياً</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              يمكنك النقر على أيقونة القلب على أي بطاقة عقارية لحفظها هنا والرجوع إليها لاحقاً.
            </p>
            <button
              onClick={() => onNavigate('search')}
              className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700"
            >
              استعراض العقارات
            </button>
          </div>
        )
      ) : (
        /* Saved Searches Tab */
        <div className="space-y-4">
          {savedSearches.length > 0 ? (
            savedSearches.map((s) => (
              <div
                key={s.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                    {s.notifyEnabled ? (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Bell className="w-3 h-3" /> التنبيهات مفعلة
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <BellOff className="w-3 h-3" /> التنبيهات معطلة
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    المدينة: {s.criteria?.city || 'جميع المدن'} • الغرض: {s.criteria?.purpose === 'sale' ? 'بيع' : 'إيجار'} • النوع:{' '}
                    {s.criteria?.propertyType || 'الكل'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const q = new URLSearchParams();
                      if (s.criteria?.city) q.set('city', s.criteria.city);
                      if (s.criteria?.purpose) q.set('purpose', s.criteria.purpose);
                      if (s.criteria?.propertyType) q.set('propertyType', s.criteria.propertyType);
                      onNavigate('search', q.toString());
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                  >
                    <span>فتح نتائج البحث</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">لا توجد عمليات بحث محفوظة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                يمكنك حفظ معايير بحثك من صفحة البحث لتلقي تنبيهات فور نزول أي عقار مطابق.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
