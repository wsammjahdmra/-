import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Compass,
  Signpost,
  ShieldCheck,
  Share2,
  Heart,
  AlertTriangle,
  Phone,
  MessageCircle,
  Building2,
  Sparkles,
  ExternalLink,
  Calculator,
  ArrowRight,
  X,
  CheckCircle,
} from 'lucide-react';
import { Listing, NeighborhoodInsight } from '../types/database';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ListingDetailsPageProps {
  listingId: string;
  onBack: () => void;
  onSelectListing: (id: string) => void;
}

export const ListingDetailsPage: React.FC<ListingDetailsPageProps> = ({
  listingId,
  onBack,
  onSelectListing,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  // Neighborhood Insights with Google Maps Grounding
  const [insights, setInsights] = useState<NeighborhoodInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('fake_ad');
  const [reportDescription, setReportDescription] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [reportRefNo, setReportRefNo] = useState<string | null>(null);

  // Mortgage Calculator
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [years, setYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(4.5);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const res = await api.getListing(listingId);
        if (res.success && res.listing) {
          setListing(res.listing);
          setIsFavorited(res.isFavorited);
          setHistory(res.history || []);

          // Fetch similar listings
          const simRes = await api.getListings({
            city: res.listing.property?.city,
            propertyType: res.listing.property?.propertyType,
          });
          if (simRes.success) {
            setSimilarListings(simRes.listings.filter((l) => l.id !== listingId).slice(0, 3));
          }

          // Trigger Neighborhood Insights with Google Maps Grounding
          fetchInsights(
            res.listing.property?.city || 'الرياض',
            res.listing.property?.district || 'الملقا',
            res.listing.property?.latitude,
            res.listing.property?.longitude
          );
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [listingId]);

  const fetchInsights = async (city: string, district: string, lat?: number, lng?: number) => {
    setInsightsLoading(true);
    try {
      const res = await api.getNeighborhoodInsights({ city, district, latitude: lat, longitude: lng });
      if (res.success) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error('Insights fetch failed:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleToggleFav = async () => {
    if (!user || user.role === 'visitor') {
      showToast('يرجى تسجيل الدخول أو اختيار دور مسجل لإضافة العقار إلى المفضلة.', 'info');
      return;
    }
    try {
      const res = await api.toggleFavorite(listingId);
      if (res.success) {
        setIsFavorited(res.isFavorited);
        if (listing) {
          listing.favoritesCount = res.favoritesCount;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `تفقد هذا العقار في منصة عقار: ${listing?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط الإعلان إلى الحافظة.', 'success');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      showToast('يرجى كتابة تفاصيل البلاغ والملاحظات.', 'error');
      return;
    }

    try {
      const res = await api.submitReport({
        listingId,
        reasonType: reportReason,
        description: reportDescription,
        reporterContact: reportContact || user?.phone,
      });
      if (res.success) {
        setReportRefNo(res.referenceNo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-100 rounded-3xl aspect-[16/9] animate-pulse" />
      </div>
    );
  }

  // Calculate Monthly Installment
  const loanAmount = listing.price * (1 - downPaymentPercent / 100);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = years * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

  const images = listing.media && listing.media.length > 0 ? listing.media : [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', isPrimary: true, id: 'm1' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button and actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لنتائج البحث</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl transition"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
          <button
            onClick={handleToggleFav}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition ${
              isFavorited
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            <span>{isFavorited ? 'في المفضلة' : 'حفظ'}</span>
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2.5 rounded-xl hover:bg-rose-50 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">إبلاغ عن مخالفة</span>
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
          <img
            src={images[activeImageIdx]?.url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-md ${
                listing.purpose === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {listing.purpose === 'sale' ? 'معروض للبيع' : `للإيجار ${listing.rentPeriod === 'yearly' ? 'السنوي' : 'الشهري'}`}
            </span>
            {listing.isFeatured && (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                إعلان مميز
              </span>
            )}
          </div>
          {listing.licenseVerificationStatus === 'verified' && (
            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-bold shadow-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>مرخص من الهيئة العامة للعقار: {listing.adLicenseNumber}</span>
            </div>
          )}
        </div>

        {/* Thumbnail selector */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                  activeImageIdx === idx ? 'border-emerald-600 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details & Sidebar Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Price Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                  {new Intl.NumberFormat('ar-SA').format(listing.price)}
                </span>
                <span className="text-base font-bold text-emerald-700 mr-2">ريال سعودي</span>
                {listing.purpose === 'rent' && (
                  <span className="text-xs text-slate-500">/{listing.rentPeriod === 'yearly' ? 'سنة' : 'شهر'}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                رقم الإعلان المرجعي: <strong className="text-slate-800">#{listing.id}</strong>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-snug">
              {listing.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {listing.property?.city}، حي {listing.property?.district} — {listing.property?.addressDescription}
              </span>
            </div>
          </div>

          {/* Key Specifications Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              المواصفات الأساسية للعقار
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>المساحة الإجمالية</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{listing.property?.totalAreaSqm} م²</div>
              </div>

              {listing.roomsCount > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-slate-500" />
                    <span>غرف النوم</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{listing.roomsCount} غرف</div>
                </div>
              )}

              {listing.bathroomsCount > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-slate-500" />
                    <span>دورات المياه</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{listing.bathroomsCount} حمام</div>
                </div>
              )}

              {listing.facade && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>الواجهة</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{listing.facade}</div>
                </div>
              )}

              {listing.streetWidthM && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Signpost className="w-3.5 h-3.5 text-slate-500" />
                    <span>عرض الشارع</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{listing.streetWidthM} متر</div>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>عمر العقار</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {listing.buildingAgeYears === 0 ? 'جديد (أول ساكن)' : `${listing.buildingAgeYears} سنوات`}
                </div>
              </div>
            </div>

            {/* Features checklist */}
            {listing.features && listing.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 mb-3">المزايا والمرافق الإضافية:</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-xl border border-emerald-100 font-medium"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              الوصف والتفاصيل
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* AI Neighborhood Insights with Google Maps Grounding */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading">
                    تحليل الحي المحيط بالذكاء الاصطناعي وGoogle Maps
                  </h3>
                  <p className="text-xs text-slate-400">
                    معلومات حية مدعومة بنموذج gemini-3.8-flash مع أداة خرائط Google
                  </p>
                </div>
              </div>
            </div>

            {insightsLoading ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">جاري تحليل مرافق حي {listing.property?.district} وخرائط Google Maps...</p>
              </div>
            ) : insights ? (
              <div className="space-y-6 text-xs">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 leading-relaxed text-slate-200">
                  {insights.summary}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Schools */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs text-emerald-400">
                      <span>المدارس والتعليم القريب</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {insights.schools.map((s, i) => (
                        <li key={i} className="line-clamp-1">• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Hospitals */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs text-sky-400">
                      <span>المستشفيات والرعاية الصحية</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {insights.hospitals.map((h, i) => (
                        <li key={i} className="line-clamp-1">• {h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Parks */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs text-amber-400">
                      <span>الحدائق والمرافق الترفيهية</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {insights.parks.map((p, i) => (
                        <li key={i} className="line-clamp-1">• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Grounding URLs / Maps Links */}
                {insights.groundingUrls && insights.groundingUrls.length > 0 && (
                  <div className="pt-2">
                    <div className="text-slate-400 text-[11px] mb-2 font-bold">
                      روابط المواقع المباشرة على Google Maps:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {insights.groundingUrls.map((chunk, idx) => (
                        <a
                          key={idx}
                          href={chunk.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{chunk.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mortgage Calculator for Sale listings */}
          {listing.purpose === 'sale' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  حاسبة التمويل العقاري والأقساط التقديرية
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الدفعة الأولى ({downPaymentPercent}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    {new Intl.NumberFormat('ar-SA').format((listing.price * downPaymentPercent) / 100)} ر.س
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مدة التمويل ({years} سنة)</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">{years * 12} شهر</div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هامش الربح التقديري ({interestRate}%)</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-semibold">القسط الشهري التقديري</div>
                  <div className="text-2xl font-black text-emerald-900">
                    {new Intl.NumberFormat('ar-SA').format(Math.round(monthlyPayment))} ر.س
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 max-w-xs text-left">
                  * الحسبة استرشادية وتخضع لشروط جهات التمويل المعتمدة وسجل المستفيد الائتماني.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Advertiser Card & Actions) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 font-heading">
              بيانات الوسيط والمعلن المصرح به
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                {listing.ownerName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{listing.ownerName}</div>
                {listing.orgName ? (
                  <div className="text-xs text-emerald-700 flex items-center gap-1 font-semibold mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{listing.orgName}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">معلن فرد موثق</div>
                )}
              </div>
            </div>

            {/* Direct contact action buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={`tel:${listing.ownerPhone}`}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition text-xs"
              >
                <Phone className="w-4 h-4" />
                <span>الاتصال بالمعلن ({listing.ownerPhone})</span>
              </a>

              <a
                href={`https://wa.me/${listing.ownerPhone.replace(/\+/g, '')}?text=${encodeURIComponent(
                  `السلام عليكم، بخصوص العقار المعروض في منصة عقار: ${listing.title} برقم مرجعي #${listing.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border border-emerald-200 transition text-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>محادثة واتساب سريعة</span>
              </a>
            </div>

            {/* Security notice */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>إرشادات التعامل الآمن:</span>
              </div>
              <p>• لا تقم بتحويل أي عربون قبل معاينة العقار شخصياً والتحقق من صك الملكية وعقد الوساطة.</p>
              <p>• تأكد من توثيق عقد الإيجار عبر شبكة إيجار الرسمية لحفظ حقوقك.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings Carousel */}
      {similarListings.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6 text-right">
          <h2 className="text-xl font-black text-slate-900 font-heading">
            عقارات مشابهة قد تهمك
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarListings.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectListing(sim.id)}
                className="bg-white rounded-2xl border border-slate-200 p-3 hover:shadow-md transition cursor-pointer flex gap-3"
              >
                <img
                  src={sim.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'}
                  alt={sim.title}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{sim.title}</h4>
                  <div className="text-emerald-700 font-black text-sm mt-1">
                    {new Intl.NumberFormat('ar-SA').format(sim.price)} ر.س
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {sim.property?.city} • {sim.property?.district}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">تقديم بلاغ رسمي عن مخالفة إعلان</h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportRefNo ? (
              <div className="py-6 text-center text-emerald-600 space-y-3">
                <CheckCircle className="w-14 h-14 mx-auto" />
                <h4 className="font-bold text-base">تم استلام بلاغك بنجاح!</h4>
                <p className="text-xs text-slate-600">
                  الرقم المرجعي للبلاغ: <strong className="text-slate-900 font-mono text-sm">{reportRefNo}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  سيتم فحص البلاغ من قبل فريق الرقابة والامتثال واتخاذ الإجراء اللازم فوراً.
                </p>
                <button
                  onClick={() => {
                    setReportRefNo(null);
                    setReportModalOpen(false);
                  }}
                  className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-emerald-700 transition"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع المخالفة</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="fake_ad">إعلان وهمي أو مضلل</option>
                    <option value="wrong_price">سعر غير حقيقي أو مخالف للسوق</option>
                    <option value="unlicensed">إعلان بدون ترخيص رسمي معتمد</option>
                    <option value="duplicate_ad">إعلان مكرر لنفس العقار</option>
                    <option value="inappropriate_content">محتوى أو صور غير لائقة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">شرح المخالفة بالتفصيل</label>
                  <textarea
                    rows={4}
                    placeholder="يرجى ذكر سبب البلاغ والقرائن الداعمة لحماية المستفيدين..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم للتواصل (اختياري)</label>
                  <input
                    type="text"
                    placeholder="+9665xxxxxxxx"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-rose-700 transition shadow-md"
                  >
                    إرسال البلاغ للرقابة
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
