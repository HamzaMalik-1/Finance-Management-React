import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ Added for localization
import ProfileTab from './tabs/ProfileTab';
import PreferencesTab from './tabs/PreferencesTab';
import SecurityTab from './tabs/SecurityTab';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';
  const [activeTab, setActiveTab] = useState('profile');

  // ✅ Localized Tabs
  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: User },
    { id: 'preferences', label: t('settings.tabs.preferences'), icon: Globe },
    // { id: 'security', label: t('settings.tabs.security'), icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-4xl font-black text-app tracking-tight  uppercase">
          {t('settings.title')}
        </h2>
        <p className="text-zinc-500 font-medium">
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap lg:w-full ${
                  isActive 
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xl scale-[1.02]' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                <span className="text-sm tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm min-h-[400px]"
            >
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'preferences' && <PreferencesTab />}
              {/* {activeTab === 'security' && <SecurityTab />} */}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;