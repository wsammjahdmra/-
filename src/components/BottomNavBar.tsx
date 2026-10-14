import React from 'react';
import {
  User,
  MapPin,
  Building2,
  Calendar,
  MessageSquare,
  Grid,
} from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenAccount: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onNavigate,
  onOpenAccount,
}) => {
  // Items in exact RTL order as screenshot:
  // Rightmost: حسابي (User)
  // Next: الإعلانات (Listings / Map)
  // Next: المشاريع (Projects)
  // Next: الحجوزات (Bookings)
  // Next: المحادثات (Chats)
  // Leftmost: الخدمات (Services)

  const navItems = [
    {
      id: 'account',
      label: 'حسابي',
      icon: User,
      action: () => onOpenAccount(),
      isActive: currentTab === 'account' || currentTab === 'my-ads',
    },
    {
      id: 'home',
      label: 'الإعلانات',
      icon: MapPin,
      action: () => onNavigate('home'),
      isActive: currentTab === 'home' || currentTab === 'search' || currentTab === 'listing-details',
    },
    {
      id: 'projects',
      label: 'المشاريع',
      icon: Building2,
      action: () => onNavigate('projects'),
      isActive: currentTab === 'projects' || currentTab === 'project-details',
    },
    {
      id: 'bookings',
      label: 'الحجوزات',
      icon: Calendar,
      action: () => onNavigate('bookings'),
      isActive: currentTab === 'bookings',
    },
    {
      id: 'chats',
      label: 'المحادثات',
      icon: MessageSquare,
      action: () => onNavigate('chats'),
      isActive: currentTab === 'chats',
    },
    {
      id: 'services',
      label: 'الخدمات',
      icon: Grid,
      action: () => onNavigate('services'),
      isActive: currentTab === 'services' || currentTab === 'market' || currentTab === 'help',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-1 px-1 sm:px-4"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer group ${
                active
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform group-hover:scale-110 ${
                  active ? 'text-emerald-600 scale-105' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[11px] sm:text-xs leading-none mt-0.5 tracking-tight ${active ? 'font-black text-emerald-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
