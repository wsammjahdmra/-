import React from 'react';
import { X, Check, UserCheck, ShieldAlert, Briefcase, Building2, User, HelpCircle, DollarSign, Settings, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoleOption {
  role: UserRole;
  label: string;
  sublabel: string;
  personaName: string;
  icon: React.ReactNode;
  badgeColor: string;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { role: currentRole, switchRole, user } = useAuth();
  const [switching, setSwitching] = React.useState(false);

  if (!isOpen) return null;

  const rolesList: RoleOption[] = [
    {
      role: 'visitor',
      label: '1. الزائر العام',
      sublabel: 'تصفح الإعلانات والمشاريع، المؤشرات السوقية، البحث والفلترة دون أي وصول إداري',
      personaName: 'زائر بدون تسجيل دخول',
      icon: <Eye className="w-5 h-5 text-slate-500" />,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      role: 'registered_user',
      label: '2. مستخدم مسجل',
      sublabel: 'إدارة المفضلة، حفظ معايير البحث، إرسال البلاغات، فتح تذاكر الدعم وتعديل الملف',
      personaName: 'أحمد بن فهد الدوسري',
      icon: <User className="w-5 h-5 text-blue-500" />,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'individual_advertiser',
      label: '3. المعلن الفرد',
      sublabel: 'إنشاء الإعلانات كمسودات، تقديمها للترخيص والمراجعة، شراء باقات الترويج، ومتابعة إحصائيات المشاهدات',
      personaName: 'سعود بن عبدالملك العتيبي (معلن مستقل)',
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      role: 'org_manager',
      label: '4. مدير المنشأة العقارية',
      sublabel: 'إدارة ملف المكتب، رخصة فال للمنشآت، دعوة الوسطاء وتحديد نطاقهم، وإدارة إعلانات المنشأة',
      personaName: 'خالد بن عبدالعزيز الشمري (شركة أركان العقارية)',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      role: 'authorized_broker',
      label: '5. وسيط عقاري مفوض',
      sublabel: 'إنشاء وتعديل الإعلانات الموكلة إليه ضمن نطاق تفويض المنشأة التابع لها',
      personaName: 'طارق بن ناصر المطيري (وسيط معتمد بشركة أركان)',
      icon: <Briefcase className="w-5 h-5 text-cyan-600" />,
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      role: 'content_moderator',
      label: '6. مشرف المحتوى',
      sublabel: 'فحص الإعلانات المعلقة، مراجعة الوسائط، القبول والرفض وطلب الاستكمال مع سبب إلزامي',
      personaName: 'منى بنت سليمان التميمي (إشراف ومراقبة جودة)',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      role: 'compliance_officer',
      label: '7. مسؤول الامتثال والتراخيص',
      sublabel: 'فحص التراخيص العقارية ورخص فال، مراقبة سجلات التكامل مع الهيئة العامة للعقار',
      personaName: 'فيصل بن إبراهيم القحطاني (الامتثال والربط الحكومي)',
      icon: <ShieldAlert className="w-5 h-5 text-purple-600" />,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      role: 'support_officer',
      label: '8. مسؤول الدعم الفني',
      sublabel: 'متابعة تذاكر الدعم الواردة وتصنيفها والرد على استفسارات المستخدمين والمعلنين',
      personaName: 'ريم بنت عبدالله العمري (خدمة العملاء)',
      icon: <HelpCircle className="w-5 h-5 text-teal-600" />,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      role: 'financial_officer',
      label: '9. المسؤول المالي',
      sublabel: 'متابعة المدفوعات والباقات، الفواتير الضريبية، ومراجعة واعتماد طلبات الاسترداد',
      personaName: 'ماجد بن صالح الزهراني (الشؤون المالية)',
      icon: <DollarSign className="w-5 h-5 text-rose-600" />,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      role: 'system_admin',
      label: '10. مدير النظام الشامل',
      sublabel: 'صلاحيات كاملة، تخصيص هوية المنصة والألوان والضرائب، إدارة المستخدمين، وسجل التدقيق',
      personaName: 'عبدالرحمن بن حمود الحربي (مدير النظام العام)',
      icon: <Settings className="w-5 h-5 text-red-600" />,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    },
  ];

  const handleSelectRole = async (targetRole: UserRole) => {
    setSwitching(true);
    try {
      await switchRole(targetRole);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              تبديل الأدوار وتجربة الصلاحيات (10 أدوار نظامية)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              يتيح لك هذا المحاكي التبديل الفوري بين أدوار النظام لاختبار التحقق الخادمي وواجهات كل مستخدم.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar */}
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="text-emerald-800 font-medium">
            المستخدم الحالي المعتمد في الخادم: <strong className="font-bold">{user?.fullName || 'زائر'}</strong>
          </span>
          <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
            {currentRole}
          </span>
        </div>

        {/* Roles list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {rolesList.map((item) => {
            const isCurrent = currentRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                        <Check className="w-4 h-4" /> الدور النشط
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">انقر للتبديل</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.sublabel}</p>
                  <div className="mt-2 text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400">الشخصية الاختبارية:</span>
                    <span className="font-semibold text-slate-800">{item.personaName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
          {switching ? 'جاري تطبيق الصلاحيات على الخادم...' : 'التحقق من الصلاحيات يتم في الخادم الخلفي (Server-Side) مع كل عملية.'}
        </div>
      </div>
    </div>
  );
};
