import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, ArrowRight, X, Clock, Check } from 'lucide-react';
import { ReportCase } from '../types/database';
import { api } from '../services/api';

export const AdminReportsPage: React.FC<{ onBack: () => void; onSelectListing: (id: string) => void }> = ({
  onBack,
  onSelectListing,
}) => {
  const [reports, setReports] = useState<ReportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportCase | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string>('closed');
  const [resolutionNote, setResolutionNote] = useState('');
  const [suspendListing, setSuspendListing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReports();
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setProcessing(true);
    try {
      const res = await api.resolveReport(selectedReport.id, {
        status: resolutionStatus,
        resolutionNote: resolutionNote || 'تمت المعالجة والإغلاق وفق النظام.',
        suspendListing,
      });

      if (res.success) {
        alert(res.message);
        setSelectedReport(null);
        setResolutionNote('');
        fetchReports();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 block mb-1">حماية المستفيدين والرقابة</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            إدارة البلاغات ومكافحة الإعلانات المضللة ({reports.length})
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

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>قائمة البلاغات الواردة</span>
          <span className="text-slate-400 font-normal">معالجة فورية وتوثيق مرجعي</span>
        </div>

        <div className="divide-y divide-slate-100">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rep.listingTitle}</span>
                  <span className="bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded text-[10px]">
                    {rep.referenceNo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rep.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'under_investigation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                <div className="text-xs text-rose-700 font-bold">
                  نوع المخالفة: {rep.reasonType}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl leading-relaxed">
                  {rep.description}
                </p>

                {rep.resolutionNote && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl">
                    <strong>الإجراء المتخذ:</strong> {rep.resolutionNote} (بواسطة {rep.resolvedBy})
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectListing(rep.listingId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  معاينة الإعلان
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(rep);
                    setResolutionStatus('closed');
                    setResolutionNote('');
                    setSuspendListing(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  معالجة البلاغ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">معالجة البلاغ رقم ({selectedReport.referenceNo})</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">حالة البلاغ الجديدة *</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="under_investigation">قيد التحقيق والتدقيق</option>
                  <option value="escalated">تصعيد للشؤون القانونية</option>
                  <option value="closed">إغلاق البلاغ (تم اتخاذ الإجراء)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">بيان الإجراء وقرار المشرف *</label>
                <textarea
                  rows={3}
                  placeholder="اكتب التوجيه أو الإجراء المتخذ..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-800 text-xs">
                  <input
                    type="checkbox"
                    checked={suspendListing}
                    onChange={(e) => setSuspendListing(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span>إيقاف الإعلان فوراً عن العرض للعامة</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  {processing ? 'جاري الحفظ...' : 'حفظ الإجراء في النظام'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
