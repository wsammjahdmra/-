import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, RotateCcw, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';
import { PaymentOrder, Invoice, Refund } from '../types/database';
import { api } from '../services/api';

export const AdminFinancePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices'>('orders');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      setLoading(true);
      try {
        const invRes = await api.getInvoices();
        if (invRes.success) {
          setInvoices(invRes.invoices);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 block mb-1">الشؤون المالية والفوترة</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            العمليات المالية والفواتير الضريبية
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

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          الفواتير الضريبية المصدرة ({invoices.length})
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>سجل الفواتير الضريبية الإلكترونية (متوافقة مع ZATCA)</span>
          <span className="text-slate-400 font-normal">ضريبة القيمة المضافة 15%</span>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-sm">{inv.invoiceNumber}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {inv.zatcaStatus}
                  </span>
                </div>
                <div className="text-slate-600">
                  العميل: <strong>{inv.customerName}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  التاريخ: {new Date(inv.createdAt).toLocaleString('ar-SA')}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-slate-400 text-[11px]">المبلغ شامل الضريبة</div>
                <div className="text-lg font-black text-emerald-800">{inv.total} ر.س</div>
                <div className="text-[10px] text-slate-400">
                  (الأساس: {inv.subtotal} ر.س • الضريبة: {inv.taxAmount} ر.س)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
