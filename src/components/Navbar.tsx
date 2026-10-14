import React, { useState } from 'react';
import {
  Building,
  Search,
  PlusCircle,
  Menu,
  X,
  UserCircle2,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Briefcase,
  Layers,
  Heart,
  Calendar,
  MessageSquare,
  Grid,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { RoleSwitcherModal } from './RoleSwitcherModal';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, role, canCreateAd, canModerate, canManageOrg, canAccessFinance, canAdmin } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const isStaffOrAdmin = canModerate || canAccessFinance || canAdmin;

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeLabel = () => {
    switch (role) {
      case 'visitor':
        return 'وضع الزائر';
      case 'registered_user':
        return 'مستخدم مسجل';
      case 'individual_advertiser':
        return 'معلن فرد';
      case 'org_manager':
        return 'مدير منشأة';
      case 'authorized_broker':
        return 'وسيط مفوض';
      case 'content_moderator':
        return 'مشرف محتوى';
      case 'compliance_officer':
        return 'مسؤول امتثال';
      case 'support_officer':
        return 'دعم فني';
      case 'financial_officer':
        return 'مسؤول مالي';
      case 'system_admin':
        return 'مدير النظام';
      default:
        return role;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Regulatory Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{settings.regaLicenseNote}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRoleModalOpen(true)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold bg-slate-800 px-2 py-0.5 rounded cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تبديل الدور التجريبي: {getRoleBadgeLabel()}</span>
            </button>
            <span className="hidden sm:inline text-slate-400">الهاتف الموحد: {settings.supportPhone}</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                  {settings.platformName}
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 -mt-1 tracking-wider">
                  بوابة العقار المعتمدة
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-700">
              <button
                onClick={() => handleNav('home')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  currentTab === 'home' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                الخريطة والإعلانات
              </button>
              <button
                onClick={() => handleNav('projects')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentTab === 'projects' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-500" />
                المشاريع
              </button>
              <button
                onClick={() => handleNav('bookings')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentTab === 'bookings' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                الحجوزات
              </button>
              <button
                onClick={() => handleNav('chats')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentTab === 'chats' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-500" />
                المحادثات
              </button>
              <button
                onClick={() => handleNav('services')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentTab === 'services' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <Grid className="w-4 h-4 text-slate-500" />
                الخدمات
              </button>


              {role !== 'visitor' && (
                <button
                  onClick={() => handleNav('favorites')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'favorites' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  المفضلة
                </button>
              )}

              {canCreateAd && (
                <button
                  onClick={() => handleNav('my-ads')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'my-ads' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  إعلاناتي
                </button>
              )}

              {canManageOrg && (
                <button
                  onClick={() => handleNav('organization')}
                  className={`px-3 py-2 rounded-xl transition-all ${
                    currentTab === 'organization' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  إدارة المنشأة
                </button>
              )}

              {isStaffOrAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                    currentTab.startsWith('admin')
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  لوحة الإدارة والتشغيل
                </button>
              )}

              <button
                onClick={() => handleNav('help')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentTab === 'help' ? 'bg-slate-100 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                المساعدة والبلاغات
              </button>
            </nav>

            {/* Actions: Add Listing & User */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleNav('create-ad')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">أضف إعلانك</span>
              </button>

              <button
                onClick={() => setRoleModalOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="تغيير الدور والمستخدم"
              >
                <UserCircle2 className="w-6 h-6 text-slate-600" />
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold leading-none">{user?.fullName || 'زائر'}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{getRoleBadgeLabel()}</div>
                </div>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-right px-3 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
            >
              الرئيسية
            </button>
            <button
              onClick={() => handleNav('search')}
              className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
            >
              البحث والعقارات
            </button>
            <button
              onClick={() => handleNav('projects')}
              className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
            >
              المشاريع العقارية
            </button>
            <button
              onClick={() => handleNav('market')}
              className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
            >
              المعلومات السوقية وMaps Grounding
            </button>
            {role !== 'visitor' && (
              <button
                onClick={() => handleNav('favorites')}
                className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
              >
                المفضلة والبحث المحفوظ
              </button>
            )}
            {canCreateAd && (
              <button
                onClick={() => handleNav('my-ads')}
                className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
              >
                لوحة إعلاناتي
              </button>
            )}
            {canManageOrg && (
              <button
                onClick={() => handleNav('organization')}
                className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
              >
                إدارة المنشأة والوسطاء
              </button>
            )}
            {isStaffOrAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-right px-3 py-2.5 rounded-xl font-bold text-emerald-800 bg-emerald-50"
              >
                لوحة الإدارة والتشغيل الشاملة
              </button>
            )}
            <button
              onClick={() => handleNav('help')}
              className="w-full text-right px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
            >
              المساعدة وتقديم بلاغ
            </button>
          </div>
        )}
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </>
  );
};
