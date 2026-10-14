import React, { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { UserAccount } from '../types/database';
import { api } from '../services/api';

export const AdminUsersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserAccount) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.updateUserStatus(user.id, nextStatus);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-blue-600 block mb-1">إدارة الهوية والوصول</span>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            حسابات المستخدمين والأدوار ({users.length})
          </h1>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الإدارة</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد أو رقم الجوال..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-emerald-500"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>قائمة المستخدمين والحسابات المسجلة</span>
          <span className="text-slate-400 font-normal">تطبيق مبدأ أقل صلاحية</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                  {u.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{u.fullName}</span>
                    <span className="font-mono bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {u.email} • {u.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {u.status === 'active' ? 'حساب نشط' : 'حساب مجمّد'}
                </span>

                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                    u.status === 'active'
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {u.status === 'active' ? 'تجميد الحساب' : 'إلغاء التجميد'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
