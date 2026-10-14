import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Phone,
  Plus,
  ArrowRight,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface BookingItem {
  id: string;
  listingTitle: string;
  listingPrice: number;
  listingType: string;
  city: string;
  district: string;
  clientName: string;
  clientPhone: string;
  brokerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
}

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'bk_1',
    listingTitle: 'فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا',
    listingPrice: 5200000,
    listingType: 'فيلا للبيع',
    city: 'الرياض',
    district: 'الملقا',
    clientName: 'أحمد بن فهد الدوسري',
    clientPhone: '+966501112233',
    brokerName: 'سعود العتيبي (معلن معتمد)',
    date: '2026-10-18',
    time: '04:30 مساءً',
    status: 'confirmed',
    notes: 'معاينة عائلية، يرغب العميل بالاطلاع على الضمانات الإنشائية والمصعد.',
  },
  {
    id: 'bk_2',
    listingTitle: 'شقة سكنية مؤثثة بالكامل للإيجار السنوي بحي النرجس',
    listingPrice: 78000,
    listingType: 'شقة للإيجار',
    city: 'الرياض',
    district: 'النرجس',
    clientName: 'محمد بن سالم الغامدي',
    clientPhone: '+966542223311',
    brokerName: 'طارق المطيري (شركة أركان)',
    date: '2026-10-19',
    time: '06:00 مساءً',
    status: 'pending',
    notes: 'بانتظار تأكيد حارس العمارة لتسليم المفتاح.',
  },
  {
    id: 'bk_3',
    listingTitle: 'فيلا مودرن مع مسبح وتراس بحري في أبحر الشمالية',
    listingPrice: 3850000,
    listingType: 'فيلا للبيع',
    city: 'جدة',
    district: 'أبحر الشمالية',
    clientName: 'عبدالله بن خالد القحطاني',
    clientPhone: '+966558889900',
    brokerName: 'مكتب السعيدان العقاري',
    date: '2026-10-14',
    time: '05:00 مساءً',
    status: 'completed',
    notes: 'تمت المعاينة بنجاح وتقديم طلب تفاوض رسمي للشراء.',
  },
];

interface BookingsPageProps {
  onSelectListing?: (id: string) => void;
  onNavigateHome?: () => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onSelectListing, onNavigateHome }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [filter, setFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Booking Form
  const [newTitle, setNewTitle] = useState('فيلا مودرن فاخرة بحي الملقا');
  const [newDate, setNewDate] = useState('2026-10-20');
  const [newTime, setNewTime] = useState('05:00 مساءً');
  const [newNotes, setNewNotes] = useState('');

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleUpdateStatus = (id: string, newStatus: BookingItem['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    const statusText =
      newStatus === 'confirmed' ? 'تأكيد' : newStatus === 'completed' ? 'إكمال' : 'إلغاء';
    showToast(`تم ${statusText} الموعد بنجاح`, 'success');
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBk: BookingItem = {
      id: `bk_${Date.now()}`,
      listingTitle: newTitle,
      listingPrice: 2500000,
      listingType: 'معاينة عقار',
      city: 'الرياض',
      district: 'شمال الرياض',
      clientName: user?.fullName || 'أحمد بن فهد الدوسري',
      clientPhone: user?.phone || '+966501112233',
      brokerName: 'الوسيط المعتمد بالمنصة',
      date: newDate,
      time: newTime,
      status: 'pending',
      notes: newNotes || 'طلب معاينة جديد عبر منصة عقار',
    };
    setBookings([newBk, ...bookings]);
    setShowNewModal(false);
    setNewNotes('');
    showToast('تم إرسال طلب حجز المعاينة بنجاح، سيتواصل معك الوسيط قريباً', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>نظام إدارة المواعيد والمعاينات الميدانية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            حجوزات المعاينة الميدانية
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            تابع مواعيدك المجدولة لمعاينة العقارات مع الوسطاء المعتمدين والمطورين العقاريين
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>حجز موعد معاينة جديد</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {[
          { key: 'all', label: 'جميع المواعيد', count: bookings.length },
          { key: 'confirmed', label: 'المؤكدة', count: bookings.filter((b) => b.status === 'confirmed').length },
          { key: 'pending', label: 'بانتظار التأكيد', count: bookings.filter((b) => b.status === 'pending').length },
          { key: 'completed', label: 'المكتملة', count: bookings.filter((b) => b.status === 'completed').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              filter === tab.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    item.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : item.status === 'completed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.status === 'confirmed'
                    ? 'موعد مؤكد ✓'
                    : item.status === 'pending'
                    ? 'بانتظار التأكيد ⏳'
                    : item.status === 'completed'
                    ? 'تمت المعاينة ✓'
                    : 'ملغي ✕'}
                </span>

                <span className="text-[11px] text-slate-400 font-medium">#{item.id}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                {item.listingTitle}
              </h3>

              <div className="text-xs text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.city}، حي {item.district}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>التاريخ: {item.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>الوقت: {item.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>الوسيط المسؤول: {item.brokerName}</span>
                </div>
              </div>

              {item.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-700">ملاحظات: </span>
                  {item.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {item.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تأكيد الموعد</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                    className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </>
              ) : item.status === 'confirmed' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'completed')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تمت المعاينة بنجاح</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                    className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-medium">سجل الموعد مؤرشف</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating a new booking */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 font-heading">
                حجز موعد معاينة ميدانية
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العقار المطلوب معاينته
                </label>
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا">فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا</option>
                  <option value="شقة سكنية مؤثثة بالكامل للإيجار السنوي بحي النرجس">شقة سكنية مؤثثة بالكامل للإيجار السنوي بحي النرجس</option>
                  <option value="فيلا مودرن مع مسبح وتراس بحري في أبحر الشمالية">فيلا مودرن مع مسبح وتراس بحري في أبحر الشمالية</option>
                  <option value="دور علوي مودرن مع سطح خاص بحي الملقا">دور علوي مودرن مع سطح خاص بحي الملقا</option>
                  <option value="أرض سكنية زاوية بحي النرجس">أرض سكنية زاوية بحي النرجس</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ المفضل</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوقت المفضل</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="10:00 صباحاً">10:00 صباحاً</option>
                    <option value="04:30 مساءً">04:30 مساءً</option>
                    <option value="05:30 مساءً">05:30 مساءً</option>
                    <option value="07:00 مساءً">07:00 مساءً</option>
                    <option value="08:30 مساءً">08:30 مساءً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو استفسارات خاصة</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="مثال: يرجى إحضار مخطط البناء والمواصفات التفصيلية للمصعد..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500 h-20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition cursor-pointer"
                >
                  تأكيد إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
