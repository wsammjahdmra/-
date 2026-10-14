import React, { useState, useEffect } from 'react';
import { PlusCircle, Eye, Heart, Sparkles, Clock, CheckCircle2, AlertCircle, FileEdit, ArrowLeft } from 'lucide-react';
import { Listing, ListingStatus } from '../types/database';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface MyAdsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectListing: (id: string) => void;
  onViewTimeline: (id: string) => void;
}

export const MyAdsPage: React.FC<MyAdsPageProps> = ({
  onNavigate,
  onSelectListing,
  onViewTimeline,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchMyAds = async () => {
    setLoading(true);
    try {
      const res = await api.getListings({ ownerOnly: true });
      if (res.success) {
        setListings(res.listings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, [user]);

  const handleSubmitAd = async (id: string) => {
    try {
      const res = await api.submitListingForReview(id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchMyAds();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered =
    statusFilter === 'all'
      ? listings
      : listings.filter((l) => l.status === statusFilter);

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> منشور للعامة
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> بانتظار التحقق
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
            مسودة خاصة
          </span>
        );
      case 'needs_completion':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
            مطلوب استكمال
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> موقوف مؤقتاً
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300">
            مرفوض
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 block mb-1">لوحة المعلن والوسيط</span>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            إدارة إعلاناتي العقارية ({listings.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة حالة الإعلانات، إحصائيات المشاهدات، طلب الترويج المميز وسجل التراخيص
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-ad')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إنشاء إعلان جديد</span>
        </button>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {[
          { key: 'all', label: 'كافة الإعلانات', count: listings.length },
          { key: 'published', label: 'المنشورة', count: listings.filter((l) => l.status === 'published').length },
          {
            key: 'pending_verification',
            label: 'بانتظار التحقق',
            count: listings.filter((l) => l.status === 'pending_verification').length,
          },
          { key: 'draft', label: 'المسودات', count: listings.filter((l) => l.status === 'draft').length },
          {
            key: 'suspended',
            label: 'الموقوفة / المرفوضة',
            count: listings.filter((l) => ['suspended', 'rejected', 'needs_completion'].includes(l.status)).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.key ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-100 h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Thumbnail + info */}
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectListing(l.id)}>
                <img
                  src={l.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'}
                  alt={l.title}
                  className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(l.status)}
                    {l.isFeatured && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> مميز
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition">
                    {l.title}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {l.property?.city}، حي {l.property?.district} • المساحة: {l.property?.totalAreaSqm} م²
                  </div>
                  <div className="text-xs font-black text-emerald-800">
                    {new Intl.NumberFormat('ar-SA').format(l.price)} ر.س
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1" title="عدد المشاهدات">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>{l.viewsCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="في المفضلة">
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>{l.favoritesCount || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onViewTimeline(l.id)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    مسار الحالة
                  </button>

                  {l.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitAd(l.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
                    >
                      إرسال للتحقق
                    </button>
                  )}

                  {l.status === 'published' && !l.isFeatured && (
                    <button
                      onClick={() => onNavigate('finance-promote', l.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ترويج مميز</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectListing(l.id)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    معاينة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <FileEdit className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد إعلانات مسجلة في هذا القسم</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            قم بإنشاء إعلان جديد وسجله كمسودة أو أرسله للمراجعة الرسمية لنشره في المنصة.
          </p>
          <button
            onClick={() => onNavigate('create-ad')}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700"
          >
            إضافة إعلانك الأول
          </button>
        </div>
      )}
    </div>
  );
};
