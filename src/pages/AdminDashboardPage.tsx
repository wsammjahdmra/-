import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  Users,
  Settings,
  History,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await api.getAdminMetrics();
        if (res.success) {
          setMetrics(res.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const adminModules = [
    {
      id: 'admin-moderation',
      title: 'مراجعة واعتماد الإعلانات',
      desc: 'فحص الإعلانات في قائمة الانتظار، التدقيق في الصور والوصف، قبول أو رفض مع سبب إلزامي',
      count: metrics?.pendingReviews || 0,
      badge: 'قيد المراجعة',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: <FileCheck2 className="w-6 h-6 text-amber-600" />,
    },
    {
      id: 'admin-reports',
      title: 'إدارة البلاغات والشكاوى',
      desc: 'متابعة البلاغات الواردة، التحقق من المخالفات، تصعيد وإغلاق البلاغ وتوثيق الإجراء',
      count: metrics?.openReports || 0,
      badge: 'بلاغات مفتوحة',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    },
    {
      id: 'admin-compliance',
      title: 'الامتثال والتراخيص',
      desc: 'مراقبة سجلات الربط مع الهيئة العامة للعقار وفحص رخص فال وإعادة المحاولات المتعثرة',
      count: '99.4%',
      badge: 'معدل الامتثال',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: <ShieldAlert className="w-6 h-6 text-purple-600" />,
    },
    {
      id: 'admin-finance',
      title: 'العمليات المالية والفواتير',
      desc: 'متابعة سداد باقات الترويج، الفواتير الضريبية ZATCA، ومراجعة واعتماد طلبات الاسترداد',
      count: `${metrics?.totalPaidRevenue || 0} ر.س`,
      badge: 'المتحصلات الضريبية',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    },
    {
      id: 'admin-users',
      title: 'المستخدمون والصلاحيات',
      desc: 'البحث في الحسابات، تجميد أو تنشيط الحساب، وتعديل الأدوار والصلاحيات (10 أدوار)',
      count: metrics?.totalUsers || 0,
      badge: 'مستخدم مسجل',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: <Users className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 'admin-audit',
      title: 'سجل التدقيق الإداري المحمي',
      desc: 'سجل تاريخي غير قابل للتعديل يوثق كل عملية حساسة تمت في النظام مع الفاعل والتوقيت والـ IP',
      count: 'محمي',
      badge: 'AUDIT_EVENT',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: <History className="w-6 h-6 text-slate-600" />,
    },
    {
      id: 'admin-settings',
      title: 'تخصيص هوية المنصة وإعداداتها',
      desc: 'تعديل اسم المنصة والشعار والألوان والضرائب مباشرة دون الحاجة للمساس بالكود المصدري',
      count: 'ديناميكي',
      badge: 'تخصيص كامل',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: <Settings className="w-6 h-6 text-teal-600" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>لوحة التحكم والتشغيل المركزية — منصة عقار</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            إدارة المنصة والرقابة النظامية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            المشغل الحالي: <strong className="text-slate-800">{user?.fullName}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
          <Clock className="w-3.5 h-3.5" />
          <span>آخر تحديث: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString('ar-SA') : 'الآن'}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs text-slate-400 font-medium">إجمالي الإعلانات المسجلة</div>
          <div className="text-2xl font-black text-slate-900 font-heading">{metrics?.totalListings || 0}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{metrics?.publishedListings || 0} إعلان منشور للعامة</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs text-slate-400 font-medium">إعلانات بانتظار الفحص</div>
          <div className="text-2xl font-black text-amber-600 font-heading">{metrics?.pendingReviews || 0}</div>
          <div className="text-[11px] text-slate-500">تتطلب تدقيق المشرفين</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs text-slate-400 font-medium">إجمالي المدفوعات المحصلة</div>
          <div className="text-2xl font-black text-emerald-700 font-heading">
            {metrics?.totalPaidRevenue || 0}{' '}
            <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <div className="text-[11px] text-slate-500">شاملة ضريبة 15% ZATCA</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs text-slate-400 font-medium">البلاغات والشكاوى المفتوحة</div>
          <div className="text-2xl font-black text-rose-600 font-heading">{metrics?.openReports || 0}</div>
          <div className="text-[11px] text-rose-600 font-bold">تتطلب معالجة فورية</div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-heading">الوحدات والأنظمة الفرعية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onNavigateTab(mod.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 transition border border-slate-100">
                    {mod.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${mod.badgeColor}`}>
                    {mod.badge}: {mod.count}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition font-heading">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>فتح الوحدة</span>
                <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
