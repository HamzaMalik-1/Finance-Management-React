import React from 'react';
import { useSelector } from 'react-redux';
import { useUpdateSettingsMutation, useGetSettingsQuery } from '../../../store/api/userApi';
import { useGetCurrenciesQuery } from '../../../store/api/constantApi';
import { toast } from 'react-hot-toast';
import { Globe, Palette, Languages, ChevronDown } from 'lucide-react';

const PreferencesTab = () => {
  const { user } = useSelector(state => state.auth);
  const { data: settingsResponse } = useGetSettingsQuery(user.id);
  const { data: currenciesResponse } = useGetCurrenciesQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();

  const currentSettings = settingsResponse?.data || {};
  const currencies = currenciesResponse?.data || [];

  const handleUpdate = async (field, value) => {
    try {
      await updateSettings({ userId: user.id, [field]: value }).unwrap();
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to sync preferences");
    }
  };

  // Reusable Dropdown Component for consistent UI
  const SettingDropdown = ({ label, icon: Icon, value, options, onChange, name }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 ml-1">
        <Icon size={14} className="text-indigo-500" />
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {label}
        </label>
      </div>
      <div className="relative group">
        <select
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 px-5 py-4 rounded-2xl font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-white dark:bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Currency Dropdown */}
        <SettingDropdown
          label="Reporting Currency"
          icon={Globe}
          name="baseCurrencyId"
          value={currentSettings.baseCurrencyId}
          onChange={handleUpdate}
          options={currencies.map(c => ({ id: c.id, label: `${c.code} - ${c.name} (${c.symbol})` }))}
        />

        {/* Theme Dropdown */}
        <SettingDropdown
          label="Interface Theme"
          icon={Palette}
          name="themePreference"
          value={currentSettings.themePreference}
          onChange={handleUpdate}
          options={[
            { id: 'light', label: 'Light Mode' },
            { id: 'dark', label: 'Dark Mode' },
            { id: 'system', label: 'System Default' }
          ]}
        />

        {/* Language Dropdown (Placeholder based on your schema) */}
        <SettingDropdown
          label="System Language"
          icon={Languages}
          name="languageId"
          value={currentSettings.languageId}
          onChange={handleUpdate}
          options={[
            { id: 1, label: 'English (US)' },
            { id: 2, label: 'Urdu (PK)' },
            { id: 3, label: 'Spanish (ES)' }
          ]}
        />
      </div>

      {/* Information Box */}
      <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl">
        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
          <b>Note:</b> Changing your reporting currency will update all dashboard stats to reflect the new exchange rate. Theme changes apply instantly across all active sessions.
        </p>
      </div>
    </div>
  );
};

export default PreferencesTab;