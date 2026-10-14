import React, { useState } from 'react';
import { Settings, Save, ArrowRight, Sparkles, CheckCircle2, Palette } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AdminSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { settings, updateSettings } = useSettings();

  const [platformName, setPlatformName] = useState(settings.platformName);
  const [platformSubtitle, setPlatformSubtitle] = useState(settings.platformSubtitle);
  const [logoText, setLogoText] = useState(settings.logoText);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presetColors = [
    { name: 'الزمردي (افتراضي)', hex: '#059669' },
    { name: 'الأزرق الملكي', hex: '#1d4ed8' },
    { name: 'الكحلي الداكن', hex: '#0f172a' },
    { name: 'العنابي الراقي', hex: '#991b1b' },
    { name: 'البترولي الهادئ', hex: '#0d9488' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        platformName,
        platformSubtitle,
        logoText,
        primaryColor,
        secondaryColor,
        supportPhone,
        supportEmail,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-600 block mb-1">تخصيص النظام والهوية</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            إعدادات وهوية المنصة القابلة للتخصيص
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تغيير اسم المنصة وشعارها وألوانها الرئيسية وبيانات الاتصال وانعكاسها فورياً في كافة الشاشات
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

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تم حفظ الإعدادات وتحديث هوية المنصة بنجاح في كامل التطبيق!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
            1. الهوية والاسم التجاري
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المنصة الرسمي *</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold focus:outline-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نص الشعار / الرمز *</label>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold focus:outline-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الوصف التعريفي للعنوان الرئيسي</label>
            <input
              type="text"
              value={platformSubtitle}
              onChange={(e) => setPlatformSubtitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 font-heading border-b border-slate-100 pb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>2. نمط الألوان والثيم البصري</span>
          </h2>

          <div>
            <label className="block font-bold text-slate-700 mb-2">اختر من الألوان المجهزة أو حدد كود HEX مخصص:</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPrimaryColor(c.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                    primaryColor === c.hex ? 'ring-2 ring-emerald-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
              />
              <span className="font-mono text-slate-700 font-bold">{primaryColor}</span>
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
            3. بيانات الدعم والتواصل الموحد
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرقم الموحد للدعم الفني</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات وتطبيق الهوية'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
