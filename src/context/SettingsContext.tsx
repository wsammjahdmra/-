import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemSettings } from '../types/database';
import { api } from '../services/api';

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SystemSettings = {
  platformName: 'منصة عقار',
  platformSubtitle: 'بوابتك الرقمية الشاملة للعقارات والمشاريع المعتمدة في المملكة',
  logoText: 'عقار',
  primaryColor: '#059669',
  secondaryColor: '#0284c7',
  vatRate: 0.15,
  currency: 'SAR',
  supportPhone: '920001234',
  supportEmail: 'care@aqqar-sa.com',
  regaLicenseNote: 'مرخصة ومعتمدة من الهيئة العامة للعقار برقم ترخيص: 1200004589',
  allowVisitorReports: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  updateSettings: async () => {},
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.warn('Failed to fetch settings from API, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await api.updateSettings(newSettings);
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
