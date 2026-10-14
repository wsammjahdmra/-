import React, { useState, useEffect } from 'react';
import { History, Shield, ArrowRight, Clock, User, Filter } from 'lucide-react';
import { AuditEvent } from '../types/database';
import { api } from '../services/api';

export const AdminAuditPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    async function loadAudit() {
      setLoading(true);
      try {
        const res = await api.getAuditEvents();
        if (res.success) {
          setEvents(res.events);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-500 block mb-1">الرقابة والنزاهة المؤسسية</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            سجل التدقيق الإداري المحمي (AUDIT_EVENT)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل تاريخي غير قابل للتعديل يوثق جميع العمليات الحساسة وتغيير الحالات والقرارات المالية
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الإدارة</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>أحدث العمليات المسجلة ({events.length})</span>
          <span className="text-slate-400 font-normal">معرف ترابط وسجل IP لكل عملية</span>
        </div>

        <div className="divide-y divide-slate-100">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="p-4 hover:bg-slate-50 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-900 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                    {ev.eventType}
                  </span>
                  <span className="font-bold text-slate-900">{ev.entityName}: {ev.entityId}</span>
                </div>
                <p className="text-slate-600 line-clamp-1">{ev.details}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>المنفذ: <strong>{ev.userName || 'النظام'}</strong> ({ev.userRole || 'system'})</span>
                  <span>•</span>
                  <span>IP: {ev.ipAddress}</span>
                </div>
              </div>

              <div className="text-left text-slate-400 text-[11px] flex-shrink-0">
                {new Date(ev.createdAt).toLocaleString('ar-SA')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Drawer/Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-heading">
              تفاصيل حدث التدقيق: {selectedEvent.eventType}
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono">
              <div>معرف الحدث: {selectedEvent.id}</div>
              <div>الوقت: {selectedEvent.createdAt}</div>
              <div>المنفذ: {selectedEvent.userName} ({selectedEvent.userId})</div>
              <div>الدور: {selectedEvent.userRole}</div>
              <div>الكيان المتأثر: {selectedEvent.entityName} #{selectedEvent.entityId}</div>
              <div className="pt-2 border-t border-slate-200 font-sans text-slate-700">
                <strong>البيان التفصيلي:</strong> {selectedEvent.details}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
