import React from 'react';
import { Heart, MapPin, Bed, Bath, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
import { Listing } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface ListingCardProps {
  listing: Listing;
  onSelect: (id: string) => void;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  isFavorited?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fav, setFav] = React.useState(isFavorited);
  const [favCount, setFavCount] = React.useState(listing.favoritesCount || 0);
  const [animating, setAnimating] = React.useState(false);

  const primaryImage =
    listing.media?.find((m) => m.isPrimary)?.url ||
    listing.media?.[0]?.url ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('ar-SA').format(p);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || user.role === 'visitor') {
      showToast('يرجى تسجيل الدخول أو اختيار دور "مستخدم مسجل" لاستخدام المفضلة.', 'info');
      return;
    }
    setAnimating(true);
    try {
      const res = await api.toggleFavorite(listing.id);
      if (res.success) {
        setFav(res.isFavorited);
        setFavCount(res.favoritesCount);
        onFavoriteToggle?.(listing.id, res.isFavorited);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <div
      onClick={() => onSelect(listing.id)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 items-center">
          {listing.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              مميز
            </span>
          )}
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${
              listing.purpose === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
          >
            {listing.purpose === 'sale' ? 'للبيع' : `للإيجار ${listing.rentPeriod === 'yearly' ? 'السنوي' : 'الشهري'}`}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label="إضافة للمفضلة"
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all ${
            fav ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          } ${animating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
        </button>

        {/* License Verification Badge */}
        {listing.licenseVerificationStatus === 'verified' && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">ترخيص معتمد: {listing.adLicenseNumber}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-xl font-black text-slate-900">{formatPrice(listing.price)}</span>
            <span className="text-xs font-semibold text-emerald-700">ريال سعودي</span>
            {listing.purpose === 'rent' && (
              <span className="text-xs text-slate-500">/{listing.rentPeriod === 'yearly' ? 'سنة' : 'شهر'}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-500 text-xs mt-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="line-clamp-1">
              {listing.property?.city}، حي {listing.property?.district}
            </span>
          </div>
        </div>

        {/* Specs bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1" title="المساحة">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{listing.property?.totalAreaSqm} م²</span>
          </div>
          {listing.roomsCount > 0 && (
            <div className="flex items-center gap-1" title="غرف النوم">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{listing.roomsCount} غرف</span>
            </div>
          )}
          {listing.bathroomsCount > 0 && (
            <div className="flex items-center gap-1" title="دورات المياه">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{listing.bathroomsCount} حمام</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
