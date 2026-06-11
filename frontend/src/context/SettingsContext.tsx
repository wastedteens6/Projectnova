import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Settings {
  siteName: string;
  siteEmail: string;
  currency: string;
  taxRate: string;
  maintenanceMode: boolean;
  mfaRequired: boolean;
  logo: string;
  favicon: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const defaultSettings: Settings = {
  siteName: 'ProjectNova',
  siteEmail: 'support@projectnova.com',
  currency: 'INR',
  taxRate: '18',
  maintenanceMode: false,
  mfaRequired: true,
  logo: '',
  favicon: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await axios.get('${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/settings');
      if (response.data.success) {
        const dbSettings = response.data.settings;
        setSettings({
          siteName: dbSettings.siteName || defaultSettings.siteName,
          siteEmail: dbSettings.siteEmail || defaultSettings.siteEmail,
          currency: dbSettings.currency || defaultSettings.currency,
          taxRate: dbSettings.taxRate || defaultSettings.taxRate,
          maintenanceMode: dbSettings.maintenanceMode === 'true',
          mfaRequired: dbSettings.mfaRequired !== 'false',
          logo: dbSettings.logo || '',
          favicon: dbSettings.favicon || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/settings',
        { settings: newSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        await refreshSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
