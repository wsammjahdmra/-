import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  X,
  Clock,
} from 'lucide-react';
import { Organization, OrgMembership, Listing } from '../types/database';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrgDashboardPage: React.FC<{ onSelectListing: (id: string) => void }> = ({ onSelectListing }) => {
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrgMembership[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Member Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteScope, setInviteScope] = useState('شمال وشرق الرياض - الشقق والفلل');
  const [inviting, setInviting] = useState(false);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrg();
      if (res.success) {
        setOrg(res.organization);
        setMembers(res.members);
        setListings(res.listings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, [user]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !invitePhone) return;

    setInviting(true);
    try {
      const res = await api.inviteMember({
        userName: inviteName,
        userPhone: invitePhone,
        roleInOrg: 'broker',
        scopeLimitations: inviteScope,
      });

      if (res.success) {
        alert(res.message);
        setInviteModalOpen(false);
        setInviteName('');
        setInvitePhone('');
        fetchOrgData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleToggleMemberStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'accepted' ? 'revoked' : 'accepted';
    try {
      const res = await api.updateMember(memberId, { invitationStatus: newStatus as any });
      if (res.success) {
        fetchOrgData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-100 rounded-3xl h-64 animate-pulse" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">لا يوجد ملف منشأة عقارية مرتبط بحسابك الحالي</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          يرجى التبديل إلى دور "مدير المنشأة العقارية" من القائمة العلوية لتجربة إدارة المكتب والوسطاء.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header Profile */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-2xl border border-indigo-100 flex-shrink-0">
            {org.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-heading">{org.name}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> منشأة موثقة
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-4">
              <span>السجل التجاري: <strong className="text-slate-800 font-mono">{org.commercialRecord}</strong></span>
              <span>رخصة فال للمنشآت: <strong className="text-slate-800 font-mono">{org.falOrgLicense}</strong></span>
              <span>المدينة: <strong className="text-slate-800">{org.city}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>دعوة وسيط عقاري للمكتب</span>
        </button>
      </div>

      {/* Grid: Members & Office Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-sm font-heading">
                  فريق الوسطاء المفوضين ({members.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.userName}</span>
                    {m.invitationStatus === 'accepted' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        نشط ومفوض
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> بانتظار القبول
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">{m.userPhone}</div>
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                    <strong>النطاق المصرح:</strong> {m.scopeLimitations}
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleToggleMemberStatus(m.id, m.invitationStatus)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                        m.invitationStatus === 'accepted'
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {m.invitationStatus === 'accepted' ? 'تجميد التفويض' : 'تفعيل العضوية'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Office Listings Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-sm font-heading">
                  إعلانات وعروض المنشأة المعتمدة ({listings.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  onClick={() => onSelectListing(l.id)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={l.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200'}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{l.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        الوسيط: <strong>{l.ownerName}</strong>
                      </div>
                      <div className="text-xs font-black text-emerald-800 mt-1">
                        {new Intl.NumberFormat('ar-SA').format(l.price)} ر.س
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">دعوة وسيط عقاري معتمد</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الوسيط الرباعي *</label>
                <input
                  type="text"
                  placeholder="مثال: تركي بن حمد القحطاني"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم جوال الوسيط الموثق *</label>
                <input
                  type="text"
                  placeholder="+9665xxxxxxxx"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نطاق وصلاحيات العمل المصرحة</label>
                <input
                  type="text"
                  placeholder="مثال: أحياء شمال الرياض - تسويق الفلل والشقق"
                  value={inviteScope}
                  onChange={(e) => setInviteScope(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  {inviting ? 'جاري إرسال الدعوة...' : 'إرسال الدعوة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
