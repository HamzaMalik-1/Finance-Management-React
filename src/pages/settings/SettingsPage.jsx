import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, CreditCard, Bell, Shield, MapPin } from 'lucide-react';
import ProfileTab from './tabs/ProfileTab';
import PreferencesTab from './tabs/PreferencesTab';
import SecurityTab from './tabs/SecurityTab';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Account Profile', icon: User },
    { id: 'preferences', label: 'Financial Prefs', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase">Command Center</h2>
        <p className="text-zinc-500 font-medium">Manage your identity and financial environment</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap lg:w-full ${
                  isActive 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl scale-[1.02]' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm"
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'security' && <SecurityTab />}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;