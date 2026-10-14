import React, { useState } from 'react';
import {
  FileText,
  Calculator,
  ShieldCheck,
  Building,
  Key,
  BadgeCheck,
  TrendingUp,
  CreditCard,
  Briefcase,
  HelpCircle,
  FileCheck2,
  Sparkles,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ServicesHubPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ServicesHubPage: React.FC<ServicesHubPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  // Mortgage Calculator State
  const [propertyPrice, setPropertyPrice] = useState<number>(1500000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(10);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(4.2);

  // Tax Calculator State
  const [taxPropertyPrice, setTaxPropertyPrice] = useState<number>(1200000);
  const [isFirstHome, setIsFirstHome] = useState<boolean>(true);

  // Calculations
  const downPaymentAmount = (propertyPrice * downPaymentPct) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = tenureYears * 12;
  const monthlyInstallment =
    loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  // Real estate transaction tax (5%), first home exempted up to 1,000,000 SAR
  const taxableAmount = isFirstHome ? Math.max(0, taxPropertyPrice - 1000000) : taxPropertyPrice;
  const transactionTax = taxableAmount * 0.05;

  const services = [
    {
      id: 'fal',
      title: 'التحقق من رخصة فال',
      desc: 'فحص فوري لصلاحية رخصة الوساطة والتسويق العقاري المعتمدة من الهيئة العامة للعقار.',
      icon: <BadgeCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionText: 'فحص رخصة الآن',
      badge: 'خدمة حكومية موثقة',
    },
    {
      id: 'ejar',
      title: 'توثيق عقود إيجار الرسمية',
      desc: 'إنشاء وتوثيق العقود السكنية والتجارية بصيغة إلكترونية ملزمة لحماية حقوق المالك والمستأجر.',
      icon: <Key className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionText: 'طلب توثيق عقد',
      badge: 'شبكة إيجار المعتمدة',
    },
    {
      id: 'taqyeem',
      title: 'التقييم العقاري المعتمد',
      desc: 'احصل على تقييم مهني عادل لعقارك من مقيمين معتمدين من الهيئة السعودية للمقيمين المعتمدين.',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionText: 'طلب تقرير تقييم',
      badge: 'معتمد من تقييم',
    },
    {
      id: 'market_intel',
      title: 'التحليلات والمؤشرات السوقية',
      desc: 'اطّلع على متوسط أسعار المتر الصفقات الحقيقية واتجاهات النمو في جميع أحياء المملكة.',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      actionText: 'عرض بيانات السوق',
      badge: 'ذكاء سوقي فوري',
      tabTarget: 'market',
    },
    {
      id: 'promotion',
      title: 'الترويج المميز للإعلانات',
      desc: 'ميّز إعلانك العقاري في الصدارة لمضاعفة المشاهدات بنسبة 400% والتسويق عبر شبكات التواصل.',
      icon: <Sparkles className="w-6 h-6 text-sky-600" />,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      actionText: 'ترقية إعلانك',
      badge: 'باقات تسويقية احترافية',
      tabTarget: 'finance-promote',
    },
    {
      id: 'inspection',
      title: 'فحص جودة المباني والإنشاء',
      desc: 'فحص إنشائي وهندسي شامل للسباكة والكهرباء والعوازل قبل الشراء مع تقرير فني مصور.',
      icon: <FileCheck2 className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionText: 'حجز فحص فني',
      badge: 'مهندسون معتمدون',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right" dir="rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
          <Briefcase className="w-4 h-4" />
          <span>المنظومة العقارية المتكاملة</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          مركز الخدمات العقارية الشاملة
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          مجموعة متكاملة من الحلول الرقمية، التوثيق النظامي، التقييم، الحاسبات المالية المعتمدة لدعم قراراتك العقارية.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border ${s.color}`}>
                  {s.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {s.badge}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>

            <button
              onClick={() => {
                if (s.tabTarget) {
                  onNavigate(s.tabTarget);
                } else {
                  showToast(`تم فتح خدمة ${s.title} بنجاح`, 'success');
                }
              }}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{s.actionText}</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Financial & Tax Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        {/* Mortgage Calculator */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading">حاسبة التمويل العقاري</h2>
              <p className="text-xs text-slate-400">احسب قسطك الشهري التقديري للتمويل السكني المدعوم</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>سعر العقار التقديري:</span>
                <span className="text-emerald-700 font-black">{propertyPrice.toLocaleString()} ريال</span>
              </div>
              <input
                type="range"
                min={300000}
                max={5000000}
                step={50000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الدفعة الأولى ({downPaymentPct}%):</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                  {downPaymentAmount.toLocaleString()} ريال
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">مدة التمويل:</label>
                <select
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-emerald-500"
                >
                  <option value={10}>10 سنوات</option>
                  <option value={15}>15 سنة</option>
                  <option value={20}>20 سنة</option>
                  <option value={25}>25 سنة</option>
                  <option value={30}>30 سنة</option>
                </select>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-center space-y-1">
              <span className="text-xs text-emerald-800 font-bold block">القسط الشهري التقديري:</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-heading">
                {Math.round(monthlyInstallment).toLocaleString()} ريال
              </span>
              <span className="text-[10px] text-emerald-600 block">
                مبلغ التمويل: {loanAmount.toLocaleString()} ريال بنسبة ربح تقديرية {interestRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Real Estate Transaction Tax Calculator */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading">حاسبة ضريبة التصرفات العقارية</h2>
              <p className="text-xs text-slate-400">حساب نسبة 5% مع احتساب إعفاء المسكن الأول للمواطن</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>قيمة الصفقة أو سعر العقار:</span>
                <span className="text-blue-700 font-black">{taxPropertyPrice.toLocaleString()} ريال</span>
              </div>
              <input
                type="range"
                min={200000}
                max={4000000}
                step={50000}
                value={taxPropertyPrice}
                onChange={(e) => setTaxPropertyPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isFirstHome}
                  onChange={(e) => setIsFirstHome(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>مواطن مستحق لتحمل الدولة لضريبة المسكن الأول (حتى 1,000,000 ريال)</span>
              </label>
              <p className="text-[11px] text-slate-500 pr-6 leading-relaxed">
                تتحمل الدولة ضريبة التصرفات العقارية عن المسكن الأول للمواطن لما لا يتجاوز مليون ريال من قيمة العقار.
              </p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-center space-y-1">
              <span className="text-xs text-blue-800 font-bold block">مبلغ ضريبة التصرفات العقارية المستحق:</span>
              <span className="text-2xl sm:text-3xl font-black text-blue-700 font-heading">
                {Math.round(transactionTax).toLocaleString()} ريال
              </span>
              <span className="text-[10px] text-blue-600 block">
                {isFirstHome && taxPropertyPrice <= 1000000
                  ? 'معفى بالكامل بنسبة 100% وفق برنامج تحمل الدولة'
                  : isFirstHome
                  ? 'تم تطبيق إعفاء 1,000,000 ريال واحتساب 5% على المبلغ المتبقي'
                  : 'تم احتساب ضريبة 5% على كامل مبلغ الصفقة'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
