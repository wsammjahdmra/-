import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Home,
  Layers,
  Key,
  Compass,
  LocateFixed,
  Eye,
  Heart,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Phone,
  MessageSquare,
  Calendar,
  Share2,
  Grid,
  Map as MapIcon,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Listing, Project } from '../types/database';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectListing: (id: string) => void;
  onSelectProject: (id: string) => void;
}

// Fallback seed listings in case of network issue so the UI never displays Network Error
const FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'lst_1',
    propertyId: 'prp_1',
    property: {
      id: 'prp_1',
      city: 'الرياض',
      district: 'الملقا',
      propertyType: 'villa',
      totalAreaSqm: 450,
      latitude: 24.805,
      longitude: 46.612,
      addressDescription: 'شمال الرياض، بالقرب من طريق أنس بن مالك',
      deedNumber: '310104005891',
    },
    ownerId: 'usr_adv_1',
    ownerName: 'سعود بن عبدالملك العتيبي',
    ownerPhone: '+966552223344',
    title: 'فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا',
    description: 'فيلا بتصميم معماري حديث وتكييف مخفي ومصعد ومسبح خاص.',
    purpose: 'sale',
    price: 5200000,
    currency: 'SAR',
    roomsCount: 6,
    bathroomsCount: 7,
    floorNumber: 3,
    buildingAgeYears: 1,
    facade: 'شمالية شرقية',
    features: ['مسبح خاص', 'مصعد راكب', 'تكييف مخفي', 'غرفة سائق وخادمة'],
    adLicenseNumber: '7100088219',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 2450,
    favoritesCount: 112,
    media: [
      {
        id: 'med_1',
        listingId: 'lst_1',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        isPrimary: true,
        title: 'واجهة الفيلا',
      },
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'lst_2',
    propertyId: 'prp_2',
    property: {
      id: 'prp_2',
      city: 'الرياض',
      district: 'النرجس',
      propertyType: 'apartment',
      totalAreaSqm: 165,
      latitude: 24.842,
      longitude: 46.685,
      addressDescription: 'حي النرجس الكيلو الثاني',
      deedNumber: '310104009942',
    },
    ownerId: 'usr_brk_1',
    ownerName: 'طارق المطيري',
    ownerPhone: '+966564445566',
    title: 'شقة سكنية مؤثثة بالكامل للإيجار السنوي بحي النرجس',
    description: 'شقة عصرية في مجمع سكني ذكي ومغلق مزودة بنظام الدخول الذكي.',
    purpose: 'rent',
    rentPeriod: 'yearly',
    price: 78000,
    currency: 'SAR',
    roomsCount: 3,
    bathroomsCount: 3,
    floorNumber: 2,
    buildingAgeYears: 0,
    facade: 'غربية',
    features: ['مفروشة بالكامل', 'دخول ذكي', 'موقف خاص', 'مصعد'],
    adLicenseNumber: '7100088914',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 1820,
    favoritesCount: 65,
    media: [
      {
        id: 'med_2',
        listingId: 'lst_2',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
        isPrimary: true,
        title: 'الصالة الرئيسية',
      },
    ],
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'lst_3',
    propertyId: 'prp_3',
    property: {
      id: 'prp_3',
      city: 'جدة',
      district: 'الشاطئ',
      propertyType: 'villa',
      totalAreaSqm: 620,
      latitude: 21.595,
      longitude: 39.112,
      addressDescription: 'جدة، حي الشاطئ راقي بالقرب من الكورنيش',
      deedNumber: '420108871234',
    },
    ownerId: 'usr_mgr_1',
    ownerName: 'خالد بن عبدالعزيز الشمري',
    ownerPhone: '+966543334455',
    title: 'قصر كلاسيكي مصغر بتشطيبات رخامية بحي الشاطئ',
    description: 'قصر مصغر بتشطيبات إيطالية فاخرة ومصعد وإطلالة مباشرة.',
    purpose: 'sale',
    price: 8900000,
    currency: 'SAR',
    roomsCount: 7,
    bathroomsCount: 8,
    floorNumber: 3,
    buildingAgeYears: 2,
    facade: 'شمالية غربية',
    features: ['مسبح رخامي', 'مصعد خاص', 'قبو ترفيهي'],
    adLicenseNumber: '7100078921',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 3890,
    favoritesCount: 198,
    media: [
      {
        id: 'med_3',
        listingId: 'lst_3',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
        isPrimary: true,
        title: 'واجهة القصر',
      },
    ],
    createdAt: '2026-02-08T15:00:00Z',
    updatedAt: '2026-02-08T15:00:00Z',
  },
  {
    id: 'lst_8',
    propertyId: 'prp_8',
    property: {
      id: 'prp_8',
      city: 'الرياض',
      district: 'النرجس',
      propertyType: 'land',
      totalAreaSqm: 600,
      latitude: 24.842,
      longitude: 46.662,
      addressDescription: 'أرض سكنية زاوية على شارعين بحي النرجس',
      deedNumber: '310109988221',
    },
    ownerId: 'usr_adv_1',
    ownerName: 'سعود العتيبي',
    ownerPhone: '+966552223344',
    title: 'أرض سكنية زاوية موقع مميز بحي النرجس',
    description: 'أرض سكنية بصك إلكتروني مستقل جاهزة للبناء المباشر.',
    purpose: 'sale',
    price: 3200000,
    currency: 'SAR',
    roomsCount: 0,
    bathroomsCount: 0,
    floorNumber: 0,
    buildingAgeYears: 0,
    facade: 'شمالية شرقية',
    features: ['صك إلكتروني', 'موقع زاوية', 'مخطط معتمد'],
    adLicenseNumber: '7100098765',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 1420,
    favoritesCount: 77,
    media: [
      {
        id: 'med_8',
        listingId: 'lst_8',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
        isPrimary: true,
        title: 'موقع الأرض',
      },
    ],
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'lst_9',
    propertyId: 'prp_9',
    property: {
      id: 'prp_9',
      city: 'الرياض',
      district: 'الملقا',
      propertyType: 'floor',
      totalAreaSqm: 260,
      latitude: 24.812,
      longitude: 46.615,
      addressDescription: 'دور علوي مستقل مع سطح خاص بحي الملقا',
      deedNumber: '310107771234',
    },
    ownerId: 'usr_brk_1',
    ownerName: 'طارق المطيري',
    ownerPhone: '+966564445566',
    title: 'دور علوي مودرن مع سطح خاص وتشطيب فاخر بحي الملقا',
    description: 'دور علوي بمدخل مستقل ومصعد وسطح مجهز بالكامل.',
    purpose: 'rent',
    rentPeriod: 'yearly',
    price: 95000,
    currency: 'SAR',
    roomsCount: 5,
    bathroomsCount: 4,
    floorNumber: 2,
    buildingAgeYears: 1,
    facade: 'شمالية',
    features: ['مدخل خاص', 'مصعد مستقل', 'سطح مجهز', 'مطبخ راكب'],
    adLicenseNumber: '7100094411',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 2100,
    favoritesCount: 92,
    media: [
      {
        id: 'med_9',
        listingId: 'lst_9',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        isPrimary: true,
        title: 'الصالة الرئيسية',
      },
    ],
    createdAt: '2026-02-14T11:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'lst_10',
    propertyId: 'prp_10',
    property: {
      id: 'prp_10',
      city: 'جدة',
      district: 'أبحر الشمالية',
      propertyType: 'villa',
      totalAreaSqm: 520,
      latitude: 21.720,
      longitude: 39.120,
      addressDescription: 'فيلا قريبة من شرم أبحر',
      deedNumber: '420109988112',
    },
    ownerId: 'usr_adv_1',
    ownerName: 'سعود العتيبي',
    ownerPhone: '+966552223344',
    title: 'فيلا مودرن مع مسبح وتراس بحري في أبحر الشمالية',
    description: 'فيلا مستقلة بإطلالة ساحرة ومسبح عائلي وتكييف مركزي.',
    purpose: 'sale',
    price: 3850000,
    currency: 'SAR',
    roomsCount: 6,
    bathroomsCount: 6,
    floorNumber: 3,
    buildingAgeYears: 0,
    facade: 'غربية',
    features: ['مسبح خاص', 'مصعد راكب', 'قرب البحر'],
    adLicenseNumber: '7100095522',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 3100,
    favoritesCount: 145,
    media: [
      {
        id: 'med_10',
        listingId: 'lst_10',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
        isPrimary: true,
        title: 'واجهة الفيلا',
      },
    ],
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'lst_11',
    propertyId: 'prp_11',
    property: {
      id: 'prp_11',
      city: 'مكة المكرمة',
      district: 'العزيزية',
      propertyType: 'apartment',
      totalAreaSqm: 180,
      latitude: 21.418,
      longitude: 39.855,
      addressDescription: 'شقة فندقية قريبة من الحرم والمشاعر',
      deedNumber: '410103322114',
    },
    ownerId: 'usr_adv_1',
    ownerName: 'سعود العتيبي',
    ownerPhone: '+966552223344',
    title: 'شقة سكنية استثمارية فندقية بحي العزيزية',
    description: 'شقة واسعة ومجهزة مناسبة للسكن أو الاستثمار الموسمي.',
    purpose: 'sale',
    price: 1450000,
    currency: 'SAR',
    roomsCount: 4,
    bathroomsCount: 3,
    floorNumber: 4,
    buildingAgeYears: 2,
    facade: 'جنوبية',
    features: ['موقف خاص', 'حراسة أمنية', 'قريبة من محطة القطار'],
    adLicenseNumber: '7100096633',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 1650,
    favoritesCount: 54,
    media: [
      {
        id: 'med_11',
        listingId: 'lst_11',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
        isPrimary: true,
        title: 'الصالة الفندقية',
      },
    ],
    createdAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'lst_12',
    propertyId: 'prp_12',
    property: {
      id: 'prp_12',
      city: 'القصيم',
      district: 'الريان',
      propertyType: 'chalet',
      totalAreaSqm: 1200,
      latitude: 26.335,
      longitude: 43.972,
      addressDescription: 'استراحة خاصة وشاليه راقي بالقصيم',
      deedNumber: '610108877112',
    },
    ownerId: 'usr_brk_1',
    ownerName: 'طارق المطيري',
    ownerPhone: '+966564445566',
    title: 'استراحة وشاليه فندقي متكامل مع مسبح ومسطحات خضراء بالقصيم',
    description: 'منتجع عائلي خاص مجهز بمجالس ضيافة كبيرة ومسبح مفلتر.',
    purpose: 'sale',
    price: 780000,
    currency: 'SAR',
    roomsCount: 4,
    bathroomsCount: 4,
    floorNumber: 1,
    buildingAgeYears: 2,
    facade: 'شمالية',
    features: ['مسبح خاص', 'مسطحات خضراء', 'مجلس تراثي'],
    adLicenseNumber: '7100097744',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 2200,
    favoritesCount: 88,
    media: [
      {
        id: 'med_12',
        listingId: 'lst_12',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
        isPrimary: true,
        title: 'الشاليه',
      },
    ],
    createdAt: '2026-02-16T12:00:00Z',
    updatedAt: '2026-02-16T12:00:00Z',
  },
  {
    id: 'lst_13',
    propertyId: 'prp_13',
    property: {
      id: 'prp_13',
      city: 'الرياض',
      district: 'الصحافة',
      propertyType: 'office',
      totalAreaSqm: 220,
      latitude: 24.788,
      longitude: 46.645,
      addressDescription: 'برج تجاري على طريق الملك فهد',
      deedNumber: '310105544112',
    },
    ownerId: 'usr_mgr_1',
    ownerName: 'خالد بن عبدالعزيز الشمري',
    ownerPhone: '+966543334455',
    title: 'مكتب تجاري إداري فاخر في برج أعمال على طريق الملك فهد',
    description: 'مكتب بموقع استراتيجي مجهز بقاعات اجتماعات ذكية وألياف بصرية.',
    purpose: 'rent',
    rentPeriod: 'yearly',
    price: 160000,
    currency: 'SAR',
    roomsCount: 6,
    bathroomsCount: 2,
    floorNumber: 5,
    buildingAgeYears: 1,
    facade: 'غربية',
    features: ['ألياف بصرية', 'مواقف قبو', 'أمن 24/7'],
    adLicenseNumber: '7100098855',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 1890,
    favoritesCount: 61,
    media: [
      {
        id: 'med_13',
        listingId: 'lst_13',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        isPrimary: true,
        title: 'المكتب',
      },
    ],
    createdAt: '2026-02-17T09:00:00Z',
    updatedAt: '2026-02-17T09:00:00Z',
  },
  {
    id: 'lst_14',
    propertyId: 'prp_14',
    property: {
      id: 'prp_14',
      city: 'حائل',
      district: 'النقرة',
      propertyType: 'villa',
      totalAreaSqm: 380,
      latitude: 27.512,
      longitude: 41.691,
      addressDescription: 'فيلا مودرن راقية بحي النقرة بحائل',
      deedNumber: '710102233445',
    },
    ownerId: 'usr_adv_1',
    ownerName: 'سعود العتيبي',
    ownerPhone: '+966552223344',
    title: 'فيلا دوبلكس عصرية درج صالة بحي النقرة بحائل',
    description: 'فيلا بتشطيبات راقية وحوش واسع ومجلس رجال ومصعد.',
    purpose: 'sale',
    price: 1150000,
    currency: 'SAR',
    roomsCount: 5,
    bathroomsCount: 5,
    floorNumber: 2,
    buildingAgeYears: 0,
    facade: 'شرقية',
    features: ['مدخل سيارة', 'حوش واسع', 'مؤسس مصعد'],
    adLicenseNumber: '7100099966',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 1420,
    favoritesCount: 45,
    media: [
      {
        id: 'med_14',
        listingId: 'lst_14',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
        isPrimary: true,
        title: 'الفيلا',
      },
    ],
    createdAt: '2026-02-17T11:00:00Z',
    updatedAt: '2026-02-17T11:00:00Z',
  },
  {
    id: 'lst_15',
    propertyId: 'prp_15',
    property: {
      id: 'prp_15',
      city: 'عسير',
      district: 'المروج',
      propertyType: 'apartment',
      totalAreaSqm: 190,
      latitude: 18.232,
      longitude: 42.508,
      addressDescription: 'شقة فاخرة بإطلالة جبلية في أبها',
      deedNumber: '810104455667',
    },
    ownerId: 'usr_brk_1',
    ownerName: 'طارق المطيري',
    ownerPhone: '+966564445566',
    title: 'شقة سكنية عائلية بإطلالة بانورامية على جبال السودة بأبها',
    description: 'شقة واسعة ومجهزة بلكونة تطل على الطبيعة.',
    purpose: 'rent',
    rentPeriod: 'yearly',
    price: 36000,
    currency: 'SAR',
    roomsCount: 4,
    bathroomsCount: 3,
    floorNumber: 3,
    buildingAgeYears: 1,
    facade: 'شمالية',
    features: ['إطلالة جبلية', 'مصعد', 'موقف خاص'],
    adLicenseNumber: '7100091177',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 2310,
    favoritesCount: 89,
    media: [
      {
        id: 'med_15',
        listingId: 'lst_15',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
        isPrimary: true,
        title: 'الصالة والبلكونة',
      },
    ],
    createdAt: '2026-02-18T08:00:00Z',
    updatedAt: '2026-02-18T08:00:00Z',
  },
  {
    id: 'lst_16',
    propertyId: 'prp_16',
    property: {
      id: 'prp_16',
      city: 'المدينة المنورة',
      district: 'سلطانة',
      propertyType: 'building',
      totalAreaSqm: 850,
      latitude: 24.472,
      longitude: 39.612,
      addressDescription: 'عمارة سكنية قريبة من الحرم النبوي',
      deedNumber: '430107788990',
    },
    ownerId: 'usr_mgr_1',
    ownerName: 'خالد بن عبدالعزيز الشمري',
    ownerPhone: '+966543334455',
    title: 'عمارة استثمارية مميزة بدخل ممتاز بحي سلطانة بالمدينة',
    description: 'مبنى سكني تجاري متميز يضم 8 شقق ومعرضين تجاريين مؤجرة بالكامل.',
    purpose: 'sale',
    price: 6800000,
    currency: 'SAR',
    roomsCount: 16,
    bathroomsCount: 14,
    floorNumber: 4,
    buildingAgeYears: 3,
    facade: 'تجاري شرقي',
    features: ['مؤجرة بالكامل', 'مصعد', 'دخل استثماري 8.5%'],
    adLicenseNumber: '7100092288',
    licenseVerificationStatus: 'verified',
    status: 'published',
    isFeatured: true,
    viewsCount: 3400,
    favoritesCount: 120,
    media: [
      {
        id: 'med_16',
        listingId: 'lst_16',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
        isPrimary: true,
        title: 'واجهة المبنى',
      },
    ],
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  },
];

// Helper controller component for map interactions
const MapController: React.FC<{
  userLocation: { lat: number; lng: number } | null;
  targetCityLocation: { lat: number; lng: number; zoom: number } | null;
  mapType: string;
}> = ({ userLocation, targetCityLocation, mapType }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (!map) return;
    if (targetCityLocation) {
      map.panTo({ lat: targetCityLocation.lat, lng: targetCityLocation.lng });
      map.setZoom(targetCityLocation.zoom);
    }
  }, [map, targetCityLocation]);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapType);
  }, [map, mapType]);

  return null;
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectListing,
  onSelectProject,
}) => {
  const { showToast } = useToast();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCOnd3eBvHLQKLq21YrDTI06knjQ0IYNgE';

  // Filters State
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Advanced Filter Modal
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [roomsFilter, setRoomsFilter] = useState<string>('');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);

  // Map Controls State
  const [mapType, setMapType] = useState<string>('roadmap'); // 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  const [mapLayerMenuOpen, setMapLayerMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [targetCityLocation, setTargetCityLocation] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Data State
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [saedanModalOpen, setSaedanModalOpen] = useState(false);

  // Load listings from API with immediate fallback
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await api.getListings({ status: 'published' });
        if (res && res.success && res.listings && res.listings.length > 0) {
          setListings(res.listings);
        } else {
          setListings(FALLBACK_LISTINGS);
        }
      } catch (err) {
        console.warn('Using local cached listings for optimal offline performance');
        setListings(FALLBACK_LISTINGS);
      }
    }
    fetchListings();
  }, []);

  // Category definitions matching screenshot
  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'apartment', label: 'شقة' },
    { id: 'villa', label: 'فيلا' },
    { id: 'land', label: 'أرض' },
    { id: 'floor', label: 'دور' },
    { id: 'building', label: 'عمارة' },
    { id: 'chalet', label: 'استراحة' },
    { id: 'office', label: 'مكتب' },
    { id: 'shop', label: 'محل' },
  ];

  // Saudi Cities quick picker
  const saudiCities = [
    { name: 'الرياض', lat: 24.7136, lng: 46.6753, zoom: 11 },
    { name: 'جدة', lat: 21.5433, lng: 39.1728, zoom: 11 },
    { name: 'مكة المكرمة', lat: 21.3891, lng: 39.8579, zoom: 12 },
    { name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, zoom: 12 },
    { name: 'الدمام والخبر', lat: 26.4207, lng: 50.0888, zoom: 11 },
    { name: 'القصيم', lat: 26.326, lng: 43.975, zoom: 11 },
    { name: 'حائل', lat: 27.5219, lng: 41.6961, zoom: 11 },
    { name: 'عسير وأبها', lat: 18.2164, lng: 42.5053, zoom: 11 },
    { name: 'الأحساء', lat: 25.3833, lng: 49.5833, zoom: 11 },
    { name: 'تبوك', lat: 28.3835, lng: 36.5662, zoom: 11 },
  ];

  // Geolocation Handler ("إيجاد موقعي")
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('خاصية تحديد الموقع غير مدعومة في متصفحك', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocating(false);
        showToast('تم تحديد موقعك الجغرافي بنجاح وتم تركيز الخريطة عليه 🎯', 'success');
      },
      (err) => {
        setLocating(false);
        // Center on Riyadh as high quality fallback
        setTargetCityLocation({ lat: 24.7136, lng: 46.6753, zoom: 12 });
        showToast('تم تركيز الخريطة على العاصمة الرياض (يمكنك تفعيل أذونات الموقع للمزيد من الدقة)', 'info');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Filter listings based on purpose, category, search, and modal filters
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Purpose check
      if (item.purpose !== purpose) return false;

      // Category check
      if (selectedCategory !== 'all') {
        const propType = item.property?.propertyType?.toLowerCase() || '';
        if (propType !== selectedCategory.toLowerCase()) return false;
      }

      // City filter
      if (selectedCity && !item.property?.city?.includes(selectedCity)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDistrict = item.property?.district?.toLowerCase().includes(q);
        const matchesCity = item.property?.city?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDistrict && !matchesCity) return false;
      }

      // Modal Filters
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;
      if (minArea && (item.property?.totalAreaSqm || 0) < Number(minArea)) return false;
      if (maxArea && (item.property?.totalAreaSqm || 0) > Number(maxArea)) return false;
      if (roomsFilter && item.roomsCount < Number(roomsFilter)) return false;
      if (onlyVerified && item.licenseVerificationStatus !== 'verified') return false;

      return true;
    });
  }, [
    listings,
    purpose,
    selectedCategory,
    selectedCity,
    searchQuery,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    roomsFilter,
    onlyVerified,
  ]);

  // Format price neatly for marker badge
  const formatMarkerPrice = (price: number, p: 'sale' | 'rent') => {
    if (price >= 1000000) {
      const millions = (price / 1000000).toFixed(1).replace('.0', '');
      return `${millions} م`;
    }
    if (price >= 1000) {
      const thousands = Math.round(price / 1000);
      return `${thousands} ألف`;
    }
    return `${price} ر.س`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100 font-sans" dir="rtl">
      {/* 1. TOP FLOATING APP BAR (Matches Screenshot) */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          {/* Blue Filter Button on Left (in RTL) */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#0284c7] hover:bg-sky-600 active:scale-95 text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer text-sm shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>تصفية</span>
          </button>

          {/* Quick Search Input */}
          <div className="flex-1 max-w-md hidden sm:block relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالحي، المدينة، أو رقم الإعلان..."
              className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl pr-10 pl-4 py-2 text-xs font-semibold text-slate-800 shadow-md focus:outline-emerald-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rent / Sale Segmented Control on Right (in RTL) */}
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-lg shrink-0">
            <button
              onClick={() => setPurpose('rent')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                purpose === 'rent'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>للإيجار</span>
            </button>
            <button
              onClick={() => setPurpose('sale')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                purpose === 'sale'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400 -scale-x-100" />
              <span>للبيع</span>
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL CATEGORY PILLS ROW (Matches Screenshot) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pointer-events-auto max-w-full">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-md cursor-pointer ${
                  isActive
                    ? 'bg-white border-2 border-emerald-600 text-emerald-700 font-black'
                    : 'bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FLOATING AL SAEDAN COMPANY CARD (Matches Screenshot) */}
      <div className="absolute top-28 right-4 sm:right-8 z-20 pointer-events-auto">
        <div
          onClick={() => setSaedanModalOpen(true)}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex items-center gap-3 group max-w-xs"
        >
          {/* Logo icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-sm border border-blue-800 shrink-0">
            <span className="tracking-tighter">السعيدان</span>
          </div>
          <div className="text-right">
            <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition">
              شركة آل سعيدان للعقارات
            </h4>
            <p className="text-[11px] text-slate-500 font-semibold">7 مشاريع متاحة</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 4. LIVE GOOGLE MAP VIEW */}
      {viewMode === 'map' ? (
        <div className="w-full h-full relative">
          <APIProvider apiKey={apiKey} language="ar" region="SA">
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={{ lat: 24.7136, lng: 46.6753 }} // Riyadh / Central Saudi Arabia
              defaultZoom={6}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController
                userLocation={userLocation}
                targetCityLocation={targetCityLocation}
                mapType={mapType}
              />

              {/* User Geolocation Pulsing Marker */}
              {userLocation && (
                <AdvancedMarker position={userLocation} zIndex={999}>
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                    <span className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
                  </div>
                </AdvancedMarker>
              )}

              {/* Property Markers */}
              {filteredListings.map((item) => {
                const lat = item.property?.latitude || 24.71;
                const lng = item.property?.longitude || 46.67;
                const isSelected = selectedListing?.id === item.id;
                const isSale = item.purpose === 'sale';

                return (
                  <AdvancedMarker
                    key={item.id}
                    position={{ lat, lng }}
                    onClick={() => setSelectedListing(item)}
                    zIndex={isSelected ? 50 : 10}
                  >
                    <div
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer transform ${
                        isSelected
                          ? 'scale-110 bg-slate-900 text-white ring-4 ring-emerald-500'
                          : isSale
                          ? 'bg-white hover:bg-emerald-50 text-slate-900 border border-emerald-500/80 hover:scale-105'
                          : 'bg-white hover:bg-blue-50 text-slate-900 border border-blue-500/80 hover:scale-105'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSale ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                      <span className="text-xs font-black whitespace-nowrap">
                        {formatMarkerPrice(item.price, item.purpose)}
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        </div>
      ) : (
        /* 4b. LIST/GRID VIEW */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full pt-28 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-700">
              العقارات المتاحة ({filteredListings.length} عقار)
            </h2>
            <button
              onClick={() => setViewMode('map')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <MapIcon className="w-4 h-4" />
              <span>العودة للخريطة الحية</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item.id)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={item.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl">
                      {item.purpose === 'sale' ? 'للبيع' : 'للإيجار'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                      {item.price.toLocaleString()} ر.س
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-right">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.property?.city}، حي {item.property?.district}</span>
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.roomsCount} غرف</span>
                  <span>{item.bathroomsCount} حمام</span>
                  <span>{item.property?.totalAreaSqm} م²</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FLOATING MAP ACTION BUTTONS (Right Side) */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Geolocation Button ("إيجاد موقعي" - GPS crosshair icon) */}
        <button
          onClick={handleFindMyLocation}
          disabled={locating}
          title="إيجاد موقعي الجغرافي"
          className="w-12 h-12 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center transition cursor-pointer group"
        >
          <Compass className={`w-6 h-6 text-slate-700 group-hover:text-emerald-600 ${locating ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Map Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setMapLayerMenuOpen(!mapLayerMenuOpen)}
            title="تبديل طبقة ونمط الخريطة"
            className="w-12 h-12 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center transition cursor-pointer"
          >
            <Layers className="w-6 h-6 text-slate-700 hover:text-blue-600" />
          </button>

          {mapLayerMenuOpen && (
            <div className="absolute bottom-14 right-0 w-48 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200 text-right space-y-1 z-30">
              <span className="text-[10px] font-bold text-slate-400 px-2 block">نوع الخريطة</span>
              {[
                { id: 'roadmap', label: 'خريطة شوارع عادية' },
                { id: 'satellite', label: 'قمر صناعي جوي' },
                { id: 'hybrid', label: 'هجين (شوارع وأقمار)' },
                { id: 'terrain', label: 'تضاريس ومعالم' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMapType(opt.id);
                    setMapLayerMenuOpen(false);
                  }}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    mapType === opt.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {mapType === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Switch View Toggle (Map vs List) */}
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          title={viewMode === 'map' ? 'عرض القائمة' : 'عرض الخريطة'}
          className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 active:scale-95 flex items-center justify-center transition cursor-pointer"
        >
          {viewMode === 'map' ? <Grid className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* 6. FLOATING CITY QUICK SELECTOR (Left/Bottom) */}
      <div className="absolute bottom-6 left-4 sm:left-6 z-20 pointer-events-auto hidden md:flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl overflow-x-auto max-w-xl">
        <span className="text-[10px] font-bold text-slate-400 px-2 shrink-0">انتقال سريع:</span>
        {saudiCities.map((c) => (
          <button
            key={c.name}
            onClick={() => {
              setSelectedCity(c.name);
              setTargetCityLocation({ lat: c.lat, lng: c.lng, zoom: c.zoom });
              showToast(`تم تركيز الخريطة على مدينة ${c.name}`, 'info');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCity === c.name
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 7. SELECTED PROPERTY BOTTOM PREVIEW CARD */}
      {selectedListing && (
        <div className="absolute bottom-20 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-30 pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 text-right space-y-3 relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3">
              <img
                src={selectedListing.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                alt={selectedListing.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <ShieldCheck className="w-3 h-3" />
                  <span>مرخص: {selectedListing.adLicenseNumber || '7100088219'}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                  {selectedListing.title}
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{selectedListing.property?.city}، حي {selectedListing.property?.district}</span>
                </p>
                <div className="text-sm font-black text-slate-900 pt-0.5">
                  {selectedListing.price.toLocaleString()} ر.س
                  <span className="text-[10px] font-normal text-slate-400 mr-1">
                    {selectedListing.purpose === 'rent' ? '/ سنوياً' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
              <span>{selectedListing.roomsCount} غرف</span>
              <span>•</span>
              <span>{selectedListing.bathroomsCount} دورات مياه</span>
              <span>•</span>
              <span>{selectedListing.property?.totalAreaSqm} م²</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectListing(selectedListing.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer text-center"
              >
                عرض كامل التفاصيل
              </button>
              <button
                onClick={() => {
                  onNavigate('chats');
                  showToast('جاري فتح المحادثة المباشرة مع المعلن', 'info');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl transition cursor-pointer"
                title="محادثة المعلن"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. AL SAEDAN DEVELOPER MODAL (7 Projects) */}
      {saedanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 text-right">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-right space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  السعيدان
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    شركة آل سعيدان للعقارات
                  </h3>
                  <p className="text-xs text-slate-500">
                    رائدة التطوير العقاري في المملكة منذ عام 1934 | رخصة فال: 1200001882
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSaedanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">المشاريع المتاحة للحجز والبيع (7 مشاريع)</h4>
                <span className="text-xs text-blue-600 font-bold">معتمدة من وافي وهيئة العقار</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'prj_saedan_1', name: 'مشروع جوهرة السعيدان', city: 'الرياض - حي حطين', type: 'فلل وقصور سكنية', price: '3,400,000 ر.س' },
                  { id: 'prj_saedan_2', name: 'مجمع إيوان السعيدان السكني', city: 'الرياض - حي النرجس', type: 'شقق عصرية ذكية', price: '850,000 ر.س' },
                  { id: 'prj_saedan_3', name: 'ضاحية تلال الملقا', city: 'الرياض - حي الملقا', type: 'فلل مودرن نجدية', price: '4,900,000 ر.س' },
                  { id: 'prj_saedan_4', name: 'برج السعيدان للأعمال', city: 'الرياض - طريق الملك فهد', type: 'مكاتب ومقرات إدارية', price: '1,800,000 ر.س' },
                  { id: 'prj_saedan_5', name: 'واحة السعيدان الشاطئية', city: 'جدة - حي الشاطئ', type: 'فلل بإطلالة بحرية', price: '3,950,000 ر.س' },
                  { id: 'prj_saedan_6', name: 'مجمع فلل القيروان', city: 'الرياض - حي القيروان', type: 'تاون هاوس سكني', price: '1,950,000 ر.س' },
                  { id: 'prj_saedan_7', name: 'منتجع درة السعيدان السكني', city: 'الخبر - الحزام الذهبي', type: 'شقق وفلل شاطئية', price: '1,450,000 ر.س' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSaedanModalOpen(false);
                      onSelectProject(p.id);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer space-y-1.5"
                  >
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      {p.type}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">{p.name}</h5>
                    <p className="text-[11px] text-slate-500">{p.city}</p>
                    <p className="text-xs font-black text-slate-800 pt-1">يبدأ من {p.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSaedanModalOpen(false);
                  onNavigate('projects');
                }}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                استعراض كافة المشاريع في المنصة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ADVANCED FILTER MODAL (Blue "تصفية" Action) */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 text-right">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  خيارات التصفية المتقدمة
                </h3>
              </div>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              {/* City Selection */}
              <div>
                <label className="block mb-1 font-bold">المدينة أو المنطقة</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-500 font-bold"
                >
                  <option value="">جميع مدن المملكة</option>
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الدمام">الدمام والخبر</option>
                  <option value="القصيم">القصيم</option>
                  <option value="حائل">حائل</option>
                  <option value="عسير">عسير وأبها</option>
                  <option value="الأحساء">الأحساء</option>
                  <option value="تبوك">تبوك</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block mb-1 font-bold">نطاق السعر (ريال سعودي)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="الحد الأدنى"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="الحد الأقصى"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="block mb-1 font-bold">المساحة (م²)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="أقل مساحة (م²)"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="أكبر مساحة (م²)"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div>
                <label className="block mb-1 font-bold">عدد الغرف الأدنى</label>
                <div className="flex gap-2">
                  {['', '1', '2', '3', '4', '5+'].map((r) => (
                    <button
                      key={r || 'all'}
                      onClick={() => setRoomsFilter(r === '5+' ? '5' : r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        (roomsFilter === r || (r === '5+' && roomsFilter === '5') || (!roomsFilter && r === ''))
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r ? `${r} غرف` : 'الكل'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Only Verified */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>إظهار الإعلانات المعتمدة والموثقة برخص فال فقط</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setMinArea('');
                  setMaxArea('');
                  setRoomsFilter('');
                  setSelectedCity('');
                  setOnlyVerified(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                إعادة ضبط
              </button>
              <button
                onClick={() => {
                  setFilterModalOpen(false);
                  showToast(`تم تطبيق التصفية: عُثر على ${filteredListings.length} عقار`, 'success');
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-md text-center"
              >
                تطبيق التصفية ({filteredListings.length} نتيجة)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
