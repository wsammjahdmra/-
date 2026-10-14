import React from 'react';
import { Building, ShieldCheck, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Building className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white font-heading">{settings.platformName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{settings.platformSubtitle}</p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>منصة عقارية مرخصة رسمياً بالمملكة</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>متوافقة مع متطلبات رخص فال وإيجار</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition">
                  البحث في العقارات المعروضة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-emerald-400 transition">
                  أحدث المشاريع والضواحي السكنية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('market')} className="hover:text-emerald-400 transition">
                  مؤشرات أسعار الأحياء والصفقات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('create-ad')} className="hover:text-emerald-400 transition">
                  إضافة إعلان عقاري جديد
                </button>
              </li>
            </ul>
          </div>

          {/* Reg and Compliance */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">الامتثال والتراخيص</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>الربط مع الهيئة العامة للعقار</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>فواتير ضريبية إلكترونية معتمدة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>حماية الخصوصية وحقوق المبلّغين</span>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-emerald-400 transition text-emerald-400 underline">
                  تقديم بلاغ رسمي عن إعلان مخالف
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">مركز الدعم والمساعدة</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>الهاتف الموحد: {settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>البريد: {settings.supportEmail}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                ساعات العمل: من الأحد إلى الخميس من 8:00 صباحاً حتى 6:00 مساءً بتوقيت الرياض.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.platformName}.
          </div>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">سياسة الخصوصية</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">شروط الاستخدام</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">لائحة الإعلانات العقارية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
