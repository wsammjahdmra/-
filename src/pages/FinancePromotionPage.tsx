import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ArrowRight,
  RotateCcw,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { PromotionPackage, PaymentOrder, Invoice, Listing } from '../types/database';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FinancePromotionPageProps {
  initialListingId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const FinancePromotionPage: React.FC<FinancePromotionPageProps> = ({
  initialListingId,
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [vatRate, setVatRate] = useState<number>(0.15);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>(initialListingId || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_pro');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'visa_mastercard' | 'apple_pay'>('mada');

  // Checkout state
  const [processing, setProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<PaymentOrder | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState<'select' | 'payment_gateway' | 'completed'>('select');

  // Refund request state
  const [refundReason, setRefundReason] = useState('');
  const [refundRequested, setRefundRequested] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgRes, listRes] = await Promise.all([
          api.getPackages(),
          api.getListings({ ownerOnly: true }),
        ]);

        if (pkgRes.success) {
          setPackages(pkgRes.packages);
          setVatRate(pkgRes.vatRate);
        }

        if (listRes.success) {
          const eligible = listRes.listings.filter((l) => l.status === 'published' || l.status === 'approved_for_publish');
          setMyListings(eligible);
          if (!selectedListingId && eligible.length > 0) {
            setSelectedListingId(eligible[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const selectedPkg = packages.find((p) => p.id === selectedPackageId);
  const basePrice = selectedPkg?.basePrice || 0;
  const taxAmount = Number((basePrice * vatRate).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount).toFixed(2));

  const handleCreateOrder = async () => {
    if (!selectedListingId) {
      alert('يرجى اختيار الإعلان المراد ترويجه.');
      return;
    }

    setProcessing(true);
    try {
      // Generate client-side Idempotency Key
      const idemKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const res = await api.createPaymentOrder({
        listingId: selectedListingId,
        packageId: selectedPackageId,
        paymentMethod,
        idempotencyKey: idemKey,
      });

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        setStep('payment_gateway');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setProcessing(true);
    try {
      // Simulate bank callback webhook with authentic verification
      const res = await api.processPaymentWebhook({
        orderId: createdOrder.id,
        paymentGatewayRef: `GATEWAY-SA-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'paid',
      });

      if (res.success) {
        setCreatedOrder(res.order);
        setGeneratedInvoice(res.invoice || null);
        setStep('completed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!createdOrder) return;
    if (!refundReason.trim()) {
      alert('يرجى كتابة سبب طلب الاسترداد.');
      return;
    }

    try {
      const res = await api.requestRefund({
        paymentOrderId: createdOrder.id,
        reason: refundReason,
      });
      if (res.success) {
        alert(res.message);
        setRefundRequested(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لإعلاناتي</span>
        </button>
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>الترويج والظهور المتقدم</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          باقات الترويج المميز والإعلانات المدفوعة
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          ضاعف مشاهدات إعلانك واجذب المشترين الجادين عبر تثبيت إعلانك في الصفحة الأولى وأعلى نتائج البحث مع حماية مالية وفاتورة ضريبية فورية.
        </p>
      </div>

      {step === 'select' && (
        <div className="space-y-8">
          {/* Select Listing */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-900 font-heading">
              1. اختر الإعلان المراد ترقيته إلى إعلان مميز:
            </label>
            {myListings.length > 0 ? (
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-emerald-500"
              >
                {myListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} — ({new Intl.NumberFormat('ar-SA').format(l.price)} ر.س)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                لا توجد لديك حالياً إعلانات منشورة مؤهلة للترويج. يجب أن يكون الإعلان معتمداً أو منشوراً.
              </div>
            )}
          </div>

          {/* Packages Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 font-heading">2. اختر باقة الترويج المناسبة:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 shadow-xl scale-[1.02]'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {pkg.tier === 'pro' && (
                      <span className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md">
                        الأكثر اختياراً
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <div
                          className={`text-xs font-bold mb-1 ${
                            isSelected ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {pkg.badgeText}
                        </div>
                        <h4 className="text-lg font-bold font-heading">{pkg.name}</h4>
                        <div className="text-[11px] opacity-75 mt-0.5">مدة الترويج: {pkg.durationDays} يوماً</div>
                      </div>

                      <div className="pt-2 border-t border-slate-100/20">
                        <span className="text-3xl font-black">{pkg.basePrice}</span>
                        <span className="text-xs mr-1 opacity-80">ر.س / قبل الضريبة</span>
                      </div>

                      <ul className="space-y-2 text-xs pt-2">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 flex-shrink-0 ${
                                isSelected ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <div
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {isSelected ? 'الباقة المحددة' : 'اختيار هذه الباقة'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Summary */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
              3. طريقة السداد وتفاصيل الفاتورة الضريبية
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'mada', label: 'مدى (Mada)' },
                { key: 'visa_mastercard', label: 'فيزا / ماستركارد' },
                { key: 'apple_pay', label: 'Apple Pay' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key as any)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition text-center ${
                    paymentMethod === m.key
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>سعر الباقة الأساسي:</span>
                <span className="font-bold">{basePrice} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>ضريبة القيمة المضافة (15% ZATCA):</span>
                <span className="font-bold">{taxAmount} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="text-emerald-800 text-lg">{totalAmount} ر.س</span>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={processing || !selectedListingId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-sm cursor-pointer disabled:opacity-50"
            >
              {processing ? 'جاري تحضير أمر الدفع...' : 'الانتقال إلى بوابة الدفع الآمنة'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Simulated Secure Payment Gateway */}
      {step === 'payment_gateway' && createdOrder && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg max-w-lg mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400">بوابة الدفع الإلكتروني المعتمدة</span>
            <h2 className="text-xl font-black text-slate-900 font-heading mt-1">تأكيد عملية السداد البنكي</h2>
            <div className="text-xs text-slate-500 mt-1">
              رقم أمر الدفع: <span className="font-mono font-bold text-slate-800">#{createdOrder.id}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-right">
            <div className="flex justify-between">
              <span className="text-slate-500">الباقة:</span>
              <span className="font-bold text-slate-800">{createdOrder.packageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">طريقة الدفع:</span>
              <span className="font-bold text-slate-800">{paymentMethod.toUpperCase()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>المبلغ الإجمالي:</span>
              <span className="text-emerald-700">{createdOrder.totalAmount} ر.س</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl"
            >
              إلغاء والرجوع
            </button>
            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="flex-2 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md transition"
            >
              {processing ? 'جاري التحقق من البنك...' : 'سداد وتفعيل الترويج الآن'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Completed & Tax Invoice Display */}
      {step === 'completed' && createdOrder && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">
              تم السداد وتفعيل باقة الترويج بنجاح!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              أصبح إعلانك الآن موسوماً ومثبتاً في مقدمة نتائج البحث لجذب أكبر شريحة من الباحثين.
            </p>
          </div>

          {/* Tax Invoice Receipt */}
          {generatedInvoice && (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm font-heading">فاتورة ضريبية مبسطة</div>
                    <div className="text-[10px] text-slate-400 font-mono">{generatedInvoice.invoiceNumber}</div>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ZATCA امتثال إلكتروني
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>العميل: <strong>{generatedInvoice.customerName}</strong></div>
                <div>التاريخ: <strong>{new Date(generatedInvoice.createdAt).toLocaleDateString('ar-SA')}</strong></div>
                <div>المبلغ بدون ضريبة: <strong>{generatedInvoice.subtotal} ر.س</strong></div>
                <div>ضريبة 15%: <strong>{generatedInvoice.taxAmount} ر.س</strong></div>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>المجموع النهائي:</span>
                <span className="text-emerald-800">{generatedInvoice.total} ر.س</span>
              </div>
            </div>
          )}

          {/* Refund request section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">سياسة الاسترداد وإلغاء الباقة:</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              وفقاً للائحة، يمكن طلب استرداد قيمة الباقة خلال 24 ساعة من الشراء في حال عدم ظهور الإعلان، ويتم تدقيق الطلب من قبل المسؤول المالي.
            </p>

            {refundRequested ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
                تم رفع طلب الاسترداد المالي، وسيتم تحويله للمسؤول المالي للاعتماد.
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="سبب طلب الاسترداد إن وجد..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleRequestRefund}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  طلب استرداد
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onSuccess}
              className="bg-slate-900 text-white font-bold px-8 py-3 rounded-2xl text-xs hover:bg-black transition"
            >
              العودة إلى لوحة إعلاناتي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
