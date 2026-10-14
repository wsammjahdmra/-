import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, CheckCircle2, AlertCircle, XCircle, FileEdit, ShieldAlert } from 'lucide-react';
import { Listing, ListingStatusHistory } from '../types/database';
import { api } from '../services/api';

interface AdStatusTimelinePageProps {
  listingId: string;
  onBack: () => void;
  onSelectListing: (id: string) => void;
}

export const AdStatusTimelinePage: React.FC<AdStatusTimelinePageProps> = ({
  listingId,
  onBack,
  onSelectListing,
}) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [history, setHistory] = useState<ListingStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getListing(listingId);
        if (res.success) {
          setListing(res.listing);
          setHistory(res.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [listingId]);

  const handleResubmit = async () => {
    try {
      const res = await api.submitListingForReview(listingId);
      if (res.success) {
        alert(res.message);
        const ref = await api.getListing(listingId);
        if (ref.success) {
          setListing(ref.listing);
          setHistory(ref.history || []);
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-100 rounded-3xl h-64 animate-pulse" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'pending_verification':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'suspended':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-rose-700" />;
      case 'needs_completion':
        return <FileEdit className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لإعلاناتي</span>
        </button>

        <button
          onClick={() => onSelectListing(listing.id)}
          className="text-xs font-bold text-emerald-700 hover:underline"
        >
          معاينة صفحة الإعلان
        </button>
      </div>

      {/* Listing Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">الإعلان رقم: #{listing.id}</div>
          <h1 className="text-lg font-bold text-slate-900 font-heading mt-0.5">{listing.title}</h1>
          <div className="text-xs text-slate-500 mt-1">
            {listing.property?.city}، حي {listing.property?.district} • السعر:{' '}
            <strong className="text-emerald-800">{new Intl.NumberFormat('ar-SA').format(listing.price)} ر.س</strong>
          </div>
        </div>

        <div className="text-left">
          <div className="text-xs text-slate-400 mb-1">الحالة الراهنة</div>
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
            {listing.status}
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            سجل التغييرات ومسار مراجعة الإعلان (LISTING_STATUS_HISTORY)
          </h2>
          <span className="text-xs text-slate-400">{history.length} حركات مسجلة</span>
        </div>

        <div className="relative pl-4 pr-6 space-y-8 before:absolute before:right-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {history.map((h, idx) => (
            <div key={h.id || idx} className="relative flex items-start gap-4">
              <div className="absolute -right-6 top-1 bg-white p-1 rounded-full border border-slate-200 shadow-xs">
                {getStatusIcon(h.toStatus)}
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex-1 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    الانتقال إلى: <strong className="text-emerald-800">{h.toStatus}</strong>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(h.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  المنفّذ: <strong>{h.changedByName || 'النظام'}</strong> ({h.changedByUserId})
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-700 leading-relaxed mt-2">
                  <strong>بيان الإجراء والملاحظات:</strong> {h.reason || 'لا توجد ملاحظات إضافية'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resubmit button if needs_completion or rejected */}
        {['needs_completion', 'rejected', 'suspended'].includes(listing.status) && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-amber-900">
              <strong>هل استكملت النواقص المطلوبة في الإعلان؟</strong>
              <p className="text-[11px] text-amber-700 mt-0.5">
                يمكنك إعادة إرسال الإعلان للفحص النظامي ومطابقة الشروط مجدداً.
              </p>
            </div>
            <button
              onClick={handleResubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              إعادة إرسال للمراجعة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
