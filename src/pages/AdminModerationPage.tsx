import React, { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, XCircle, FileEdit, ArrowRight, ShieldCheck, MapPin, AlertCircle, X } from 'lucide-react';
import { Listing, ListingStatus } from '../types/database';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminModerationPageProps {
  onBack: () => void;
  onSelectListing: (id: string) => void;
}

export const AdminModerationPage: React.FC<AdminModerationPageProps> = ({ onBack, onSelectListing }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionDecision, setActionDecision] = useState<'published' | 'needs_completion' | 'rejected' | 'suspended'>('published');
  const [reasonNote, setReasonNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getListings({});
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
    fetchQueue();
  }, []);

  const handleApplyDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    if (['rejected', 'suspended', 'needs_completion'].includes(actionDecision) && !reasonNote.trim()) {
      alert('يجب كتابة سبب القرار وملاحظات الاستكمال وفق اللائحة الإعلانية.');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.updateListingStatus(selectedListing.id, actionDecision, reasonNote);
      if (res.success) {
        alert(res.message);
        setSelectedListing(null);
        setReasonNote('');
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = listings.filter((l) => l.status === 'pending_verification').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-amber-600 block mb-1">وحدة الرقابة والمطابقة</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            مراجعة واعتماد الإعلانات ({pendingCount} بانتظار الفحص)
          </h1>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الإدارة</span>
        </button>
      </div>

      {/* Main Review Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">قائمة الإعلانات بانتظار المراجعة والتحقق</span>
          <span className="text-slate-400">انقر على الإعلان لمعاينة الصك ورخصة فال واتخاذ الإجراء</span>
        </div>

        <div className="divide-y divide-slate-100">
          {listings.map((l) => (
            <div
              key={l.id}
              className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={l.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150'}
                  alt=""
                  className="w-16 h-16 object-cover rounded-2xl flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{l.title}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {l.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    المعلن: <strong>{l.ownerName}</strong> • {l.property?.city}، حي {l.property?.district} • السعر:{' '}
                    <strong>{new Intl.NumberFormat('ar-SA').format(l.price)} ر.س</strong>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                    رخصة الإعلان: {l.adLicenseNumber || 'قيد التدقيق'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectListing(l.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  معاينة كاملة
                </button>
                <button
                  onClick={() => {
                    setSelectedListing(l);
                    setActionDecision('published');
                    setReasonNote('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  اتخاذ قرار المشرف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">اتخاذ قرار مراجعة الإعلان</h3>
              <button onClick={() => setSelectedListing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedListing.title}</div>
              <div className="text-slate-500">
                المعلن: {selectedListing.ownerName} • السعر: {new Intl.NumberFormat('ar-SA').format(selectedListing.price)} ر.س
              </div>
            </div>

            <form onSubmit={handleApplyDecision} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">القرار الرقابي *</label>
                <select
                  value={actionDecision}
                  onChange={(e) => setActionDecision(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="published">اعتماد ونشر الإعلان للعامة</option>
                  <option value="needs_completion">طلب استكمال نواقص وملاحظات</option>
                  <option value="rejected">رفض الإعلان نهائياً</option>
                  <option value="suspended">إيقاف مؤقت للإعلان</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  سبب القرار والملاحظات (إلزامي عند الرفض أو الاستكمال أو الإيقاف)
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب التوجيه للمعلن أو سبب الرفض النظامي..."
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  {processing ? 'جاري توثيق القرار...' : 'تثبيت القرار في سجل الحالة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
