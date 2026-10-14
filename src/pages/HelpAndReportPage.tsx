import React, { useState } from 'react';
import { HelpCircle, ShieldAlert, Search, FileText, CheckCircle2, Phone, Mail, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const HelpAndReportPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();

  // Reference number tracker
  const [lookupRef, setLookupRef] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'ما هي الشروط النظامية لنشر إعلان عقاري في المنصة؟',
      a: 'وفقاً لضوابط الهيئة العامة للعقار، يشترط وجود ترخيص إعلان عقاري صادر برقم رسمي، ووجود صك ملكية ساري، وتفويض وساطة عقارية موثق إذا كان المعلن وسيطاً أو منشأة وساطة.',
    },
    {
      q: 'كيف أتحقق من صحة رخصة فال العقارية؟',
      a: 'تقوم المنصة بالتحقق الآلي من رقم رخصة فال ورخصة الإعلان، وتظهر شارة "ترخيص معتمد" باللون الأخضر على جميع الإعلانات التي تم تدقيقها.',
    },
    {
      q: 'كيف يتم إصدار الفاتورة الضريبية عند شراء باقة ترويج؟',
      a: 'بمجرد إتمام عملية السداد الآمنة بنجاح عبر مدى أو البطاقات الائتمانية، يتم إصدار فاتورة ضريبية إلكترونية فورية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) ويمكن تحميلها من لوحة الحساب.',
    },
    {
      q: 'ما هو الإجراء المتبع عند الإبلاغ عن إعلان مخالف؟',
      a: 'يقوم فريق الرقابة والامتثال بمراجعة الإعلان خلال ساعات العمل، والتحقق من صك الملكية وسعر العرض، وفي حال ثبوت المخالفة يتم إيقاف الإعلان فوراً وإشعار المبلّغ بنتيجة البلاغ.',
    },
  ];

  const handleTrackRef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;

    setSearching(true);
    try {
      // Check in reports or tickets
      const res = await api.getAdminReports();
      if (res.success) {
        const found = res.reports.find((r) => r.referenceNo.toLowerCase() === lookupRef.trim().toLowerCase());
        if (found) {
          setLookupResult({
            type: 'بلاغ رقابي',
            refNo: found.referenceNo,
            title: found.listingTitle,
            status: found.status,
            date: found.createdAt,
            note: found.resolutionNote || 'البلاغ قيد الفحص والمراجعة من قبل فريق الامتثال.',
          });
          setSearching(false);
          return;
        }
      }

      const tktRes = await api.getTickets();
      if (tktRes.success) {
        const foundTkt = tktRes.tickets.find((t) => t.ticketNumber.toLowerCase() === lookupRef.trim().toLowerCase());
        if (foundTkt) {
          setLookupResult({
            type: 'تذكرة دعم فني',
            refNo: foundTkt.ticketNumber,
            title: foundTkt.subject,
            status: foundTkt.status,
            date: foundTkt.createdAt,
            note: 'التذكرة قيد المتابعة من فريق خدمة العملاء.',
          });
          setSearching(false);
          return;
        }
      }

      setLookupResult('not_found');
    } catch (err) {
      console.error(err);
      setLookupResult('not_found');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const res = await api.createTicket({
        subject: ticketSubject,
        message: ticketMessage,
        priority: ticketPriority,
      });
      if (res.success) {
        setTicketSuccess(res.ticket.ticketNumber);
        setTicketSubject('');
        setTicketMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-right">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          مركز المساعدة والمتابعة
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          متابعة حالة البلاغات والتذاكر، الأسئلة الشائعة، والتواصل المباشر مع فريق الدعم الفني
        </p>
      </div>

      {/* Tracker Search Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-heading">
          <Search className="w-5 h-5 text-emerald-600" />
          <span>الاستعلام عن حالة بلاغ أو تذكرة دعم</span>
        </div>
        <p className="text-xs text-slate-500">
          أدخل الرقم المرجعي الذي حصلت عليه (مثال: REP-2026-7841 أو TCK-2026-0912) لمتابعة الإجراء المتخذ:
        </p>

        <form onSubmit={handleTrackRef} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="أدخل الرقم المرجعي..."
            value={lookupRef}
            onChange={(e) => setLookupRef(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-emerald-500 font-mono"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            {searching ? 'جاري الاستعلام...' : 'استعلام'}
          </button>
        </form>

        {/* Tracker Result */}
        {lookupResult && lookupResult !== 'not_found' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {lookupResult.type}: <span className="font-mono">{lookupResult.refNo}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                الحالة: {lookupResult.status}
              </span>
            </div>
            <div className="text-slate-600">{lookupResult.title}</div>
            <div className="text-slate-500 text-[11px] bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
              الإجراء: {lookupResult.note}
            </div>
          </div>
        )}

        {lookupResult === 'not_found' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            لم يتم العثور على بلاغ أو تذكرة بهذا الرقم المرجعي. يرجى التأكد من صحة الرمز المدخل.
          </div>
        )}
      </div>

      {/* Support Ticket Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-heading">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>فتح تذكرة دعم فني جديدة</span>
          </div>

          {ticketSuccess ? (
            <div className="py-6 text-center text-emerald-600 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <div className="font-bold text-sm">تم فتح التذكرة بنجاح!</div>
              <div className="text-xs text-slate-600">
                رقم التذكرة: <strong className="font-mono text-slate-900">{ticketSuccess}</strong>
              </div>
              <button
                onClick={() => setTicketSuccess(null)}
                className="mt-3 text-xs bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-xl"
              >
                فتح تذكرة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">موضوع التذكرة</label>
                <input
                  type="text"
                  placeholder="مثال: مشكلة في تحديث رخصة الإعلان أو سداد الباقة"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأولوية</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">طارئة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل الرسالة</label>
                <textarea
                  rows={4}
                  placeholder="اشرح المشكلة بالتفصيل لمساعدتك بأسرع وقت..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                إرسال التذكرة
              </button>
            </form>
          )}
        </div>

        {/* Contact info channels */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-heading">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>قنوات التواصل المعتمدة</span>
          </div>
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-800 text-sm mb-1">الاتصال الموحد:</div>
              <div className="text-emerald-700 font-bold text-base dir-ltr text-right">{settings.supportPhone}</div>
              <div className="text-[11px] text-slate-400 mt-1">متاح طوال أيام العمل الرسمية</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-800 text-sm mb-1">البريد الإلكتروني للعناية بالعملاء:</div>
              <div className="text-emerald-700 font-bold text-sm font-mono">{settings.supportEmail}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-800 text-sm mb-1">حماية المبلّغين وسرية البيانات:</div>
              <p className="text-[11px] text-slate-500">
                تلتزم المنصة بعدم إفشاء بيانات المبلّغ لأي طرف ثالث، وتتم معالجة جميع البلاغات وفق قواعد الامتثال الصادرة من الجهات التنظيمية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
          الأسئلة الشائعة
        </h2>
        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-right p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
