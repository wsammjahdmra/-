import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Organization } from '../types/database';
import { api } from '../services/api';

interface AuthContextType {
  user: UserAccount | null;
  organization: Organization | null;
  role: UserRole;
  loading: boolean;
  switchRole: (role: UserRole, userId?: string) => Promise<void>;
  login: (credentials: { email?: string; phone?: string }) => Promise<void>;
  register: (payload: { fullName: string; phone: string; email: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canCreateAd: boolean;
  canModerate: boolean;
  canManageOrg: boolean;
  canAccessFinance: boolean;
  canAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  role: 'visitor',
  loading: true,
  switchRole: async () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  canCreateAd: false,
  canModerate: false,
  canManageOrg: false,
  canAccessFinance: false,
  canAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setOrganization(res.organization || null);
      }
    } catch (err) {
      console.warn('Could not load current user session, falling back to visitor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const switchRole = async (targetRole: UserRole, targetUserId?: string) => {
    setLoading(true);
    try {
      const res = await api.switchRole(targetRole, targetUserId);
      if (res.success && res.user) {
        setUser(res.user);
        // re-fetch org if relevant
        const meRes = await api.getMe();
        setOrganization(meRes.organization || null);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email?: string; phone?: string }) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        const meRes = await api.getMe();
        setOrganization(meRes.organization || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { fullName: string; phone: string; email: string; role?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser({
      id: 'usr_guest',
      fullName: 'زائر',
      phone: '',
      email: '',
      role: 'visitor',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    });
    setOrganization(null);
  };

  const role: UserRole = user?.role || 'visitor';

  const canCreateAd = ['individual_advertiser', 'org_manager', 'authorized_broker', 'system_admin'].includes(role);
  const canModerate = ['content_moderator', 'compliance_officer', 'system_admin'].includes(role);
  const canManageOrg = ['org_manager', 'system_admin'].includes(role);
  const canAccessFinance = ['financial_officer', 'system_admin'].includes(role);
  const canAdmin = role === 'system_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        loading,
        switchRole,
        login,
        register,
        logout,
        refreshUser,
        canCreateAd,
        canModerate,
        canManageOrg,
        canAccessFinance,
        canAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
