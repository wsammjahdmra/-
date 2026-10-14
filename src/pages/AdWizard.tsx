import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  FileText,
  MapPin,
  Sparkles,
  Building2,
  DollarSign,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PropertyType, ListingPurpose } from '../types/database';

interface AdWizardProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export const AdWizard: React.FC<AdWizardProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState<ListingPurpose>('sale');
  const [rentPeriod, setRentPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [propertyType, setPropertyType] = useState<PropertyType>('villa');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('');
  const [deedNumber, setDeedNumber] = useState('');
  const [price, setPrice] = useState('');
  const [totalAreaSqm, setTotalAreaSqm] = useState('');
  const [roomsCount, setRoomsCount] = useState('4');
  const [bathroomsCount, setBathroomsCount] = useState('4');
  const [buildingAgeYears, setBuildingAgeYears] = useState('0');
  const [facade, setFacade] = useState('شمالية');
  const [streetWidthM, setStreetWidthM] = useState('20');
  const [features, setFeatures] = useState<string[]>(['موقف سيارات', 'مصعد']);
  const [adLicenseNumber, setAdLicenseNumber] = useState('');
  const [complianceAccepted, setComplianceAccepted] = useState(true);

  // Sample media URLs for testing upload
  const [mediaList, setMediaList] = useState<Array<{ url: string; isPrimary: boolean }>>([
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80', isPrimary: false },
  ]);

  const availableFeatures = [
    'مسبح خاص',
    'مصعد راكب',
    'غرفة خادمة',
    'غرفة سائق',
    'تكييف مركزي',
    'موقف سيارات مظلل',
    'دخول ذكي',
    'شرفة واسعة',
    'حوش واسع',
    'مطبخ مجهز',
  ];

  const toggleFeature = (feat: string) => {
    setFeatures((prev) => (prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]));
  };

  const addSamplePhoto = (url: string) => {
    setMediaList((prev) => [...prev, { url, isPrimary: prev.length === 0 }]);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title || !district || !city) {
        showToast('يرجى كتابة عنوان الإعلان والمدينة والحي.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!price || !totalAreaSqm) {
        showToast('يرجى تحديد السعر والمساحة الإجمالية للعقار.', 'error');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!complianceAccepted) {
      showToast('يجب الإقرار بصحة البيانات ومطابقتها لاشتراطات الهيئة العامة للعقار.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        purpose,
        rentPeriod: purpose === 'rent' ? rentPeriod : undefined,
        propertyType,
        city,
        district,
        deedNumber: deedNumber || `DEED-${Math.floor(100000 + Math.random() * 900000)}`,
        price: Number(price),
        totalAreaSqm: Number(totalAreaSqm),
        roomsCount: Number(roomsCount),
        bathroomsCount: Number(bathroomsCount),
        buildingAgeYears: Number(buildingAgeYears),
        facade,
        streetWidthM: Number(streetWidthM),
        features,
        adLicenseNumber: adLicenseNumber || `71000${Math.floor(10000 + Math.random() * 90000)}`,
        media: mediaList.map((m, idx) => ({
          id: `med_${idx + 1}`,
          mediaType: 'image',
          url: m.url,
          isPrimary: m.isPrimary,
        })),
        status: submitForReview ? 'pending_verification' : 'draft',
      };

      const res = await api.createListing(payload);
      if (res.success && res.listing) {
        showToast(res.message, 'success');
        onSuccess(res.listing.id);
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ الإعلان.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Wizard Header & Steps Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-emerald-700 block mb-1">نموذج النشر الذكي</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              إنشاء إعلان عقاري جديد
            </h1>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl"
          >
            إلغاء وخروج
          </button>
        </div>

        {/* Steps Bar */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { stepNum: 1, label: 'البيانات الأساسية' },
            { stepNum: 2, label: 'المواصفات والسعر' },
            { stepNum: 3, label: 'الصور والوسائط' },
            { stepNum: 4, label: 'الترخيص والامتثال' },
            { stepNum: 5, label: 'المراجعة والحفظ' },
          ].map((s) => (
            <div
              key={s.stepNum}
              className={`p-2.5 rounded-2xl border transition-all ${
                step === s.stepNum
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm'
                  : step > s.stepNum
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="text-[10px] opacity-80">خطوة {s.stepNum}</div>
              <div className="truncate">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* STEP 1: Basic Info & Location */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الخطوة 1: الغرض، نوع العقار، والموقع الجغرافي
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الإعلان *</label>
              <input
                type="text"
                placeholder="مثال: فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الغرض من العرض *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPurpose('sale')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      purpose === 'sale'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    للبيع
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurpose('rent')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      purpose === 'rent'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    للإيجار
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العقار *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="villa">فيلا</option>
                  <option value="apartment">شقة</option>
                  <option value="building">عمارة كاملة</option>
                  <option value="land">أرض</option>
                  <option value="floor">دور مستقل</option>
                  <option value="office">مكتب تجاري</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">المدينة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الخبر">الخبر</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الحي *</label>
                <input
                  type="text"
                  placeholder="مثال: الملقا"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الصك العقاري</label>
                <input
                  type="text"
                  placeholder="مثال: 310104005891"
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Specs & Pricing */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الخطوة 2: السعر، المساحة، والمواصفات المعمارية
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">السعر المطلوب (ر.س) *</label>
                <input
                  type="number"
                  placeholder="مثال: 4500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-emerald-500"
                  required
                />
              </div>

              {purpose === 'rent' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">دورية الإيجار</label>
                  <select
                    value={rentPeriod}
                    onChange={(e) => setRentPeriod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="yearly">سنوي</option>
                    <option value="monthly">شهري</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">المساحة الإجمالية (م²) *</label>
                <input
                  type="number"
                  placeholder="مثال: 450"
                  value={totalAreaSqm}
                  onChange={(e) => setTotalAreaSqm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الغرف</label>
                <input
                  type="number"
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">دورات المياه</label>
                <input
                  type="number"
                  value={bathroomsCount}
                  onChange={(e) => setBathroomsCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الواجهة</label>
                <select
                  value={facade}
                  onChange={(e) => setFacade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="شمالية">شمالية</option>
                  <option value="جنوبية">جنوبية</option>
                  <option value="شرقية">شرقية</option>
                  <option value="غربية">غربية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عرض الشارع (م)</label>
                <input
                  type="number"
                  value={streetWidthM}
                  onChange={(e) => setStreetWidthM(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">المزايا والمرافق الإضافية</label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feat) => {
                  const isChecked = features.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الوصف التفصيلي للعقار</label>
              <textarea
                rows={4}
                placeholder="اذكر مميزات العقار، التشطيبات، والضمانات المتوفرة بالتفصيل..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Media Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الخطوة 3: صور ومعرض وسائط العقار
            </h2>

            <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl text-center space-y-3 bg-slate-50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">إضافة صور العقار عالية الدقة</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                اختر صوراً واضحة للواجهة، الغرف، الصالة، والمرافق لزيادة الإقبال على إعلانك.
              </p>

              {/* Sample high quality photos quick add */}
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80')
                  }
                  className="bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
                >
                  + إضافة صورة واجهة حديثة
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80')
                  }
                  className="bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
                >
                  + إضافة صورة صالة استقبال
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto('https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80')
                  }
                  className="bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
                >
                  + إضافة صورة مطبخ عصري
                </button>
              </div>
            </div>

            {/* Gallery thumbnails */}
            {mediaList.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700">الصور المرفوعة ({mediaList.length}):</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mediaList.map((m, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] group"
                    >
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                      {m.isPrimary && (
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          الرئيسية
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setMediaList((prev) =>
                            prev.map((item, i) => ({ ...item, isPrimary: i === idx }))
                          )
                        }
                        className="absolute bottom-2 inset-x-2 bg-slate-900/80 text-white text-[10px] py-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        تعيين كرئيسية
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: License & Regulatory Compliance */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الخطوة 4: التراخيص والامتثال لنظام الوساطة العقارية
            </h2>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-xs text-emerald-900 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>الامتثال للائحة الإعلانات العقارية:</strong>
                <p className="mt-1">
                  تلتزم المنصة بعدم نشر أي إعلان دون التحقق من رخصة الإعلان ورخصة فال المعتمدة من الهيئة العامة للعقار حمايةً للسوق ولحقوق المستفيدين.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم ترخيص الإعلان العقاري (الهيئة العامة للعقار)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 7100099881 (اتركه فارغاً للتوليد الآلي التجريبي)"
                  value={adLicenseNumber}
                  onChange={(e) => setAdLicenseNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم رخصة فال للمعلن / الوسيط</label>
                <input
                  type="text"
                  readOnly
                  value={user?.falLicenseNumber || '1100023451'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700 leading-relaxed">
                <input
                  type="checkbox"
                  checked={complianceAccepted}
                  onChange={(e) => setComplianceAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>
                  أقر بأنني مالك العقار أو وسيط عقاري مرخص ومفوض رسميًا بنشر هذا الإعلان، وأن جميع البيانات والمساحات والأسعار المدخلة مطابقة لصك الملكية والأنظمة المعتمدة.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Submission */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الخطوة 5: مراجعة البيانات وتأكيد الحفظ أو الإرسال
            </h2>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">{title}</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {new Intl.NumberFormat('ar-SA').format(Number(price))} ر.س
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                <div>المدينة: <strong>{city}</strong></div>
                <div>الحي: <strong>{district}</strong></div>
                <div>المساحة: <strong>{totalAreaSqm} م²</strong></div>
                <div>الغرض: <strong>{purpose === 'sale' ? 'بيع' : 'إيجار'}</strong></div>
              </div>

              <div className="pt-2 text-slate-500 text-[11px]">
                عدد الصور المرفقة: {mediaList.length} • المزايا المحددة: {features.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <strong>خيارات الحفظ المتاحة:</strong>
              <p className="mt-1">
                • <strong>حفظ كمسودة:</strong> يمكنك العودة لتعديل الإعلان أو إضافة صور في أي وقت دون إرساله للعامة.
                <br />
                • <strong>إرسال للتحقق والمراجعة:</strong> يتم إدراج الإعلان في قائمة مراجعة المشرفين وفحص رخصة الإعلان تمهيداً لنشره.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                <span>المتابعة للخطوة التالية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave(false)}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ كمسودة خاصة'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave(true)}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-7 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة والتحقق'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
