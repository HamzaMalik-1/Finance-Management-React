import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isRTL = i18n.language === 'ur';

  return (
    <div 
      className="min-h-screen bg-app-bg text-app-text flex transition-colors duration-300"
      dir={isRTL ? 'rtl' : 'ltr'} // ✅ Corrects the entire layout flow
    >
      {/* GLOBAL SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP NAV BAR */}
        <header className="h-20 bg-card-bg/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg hidden md:block">
              {/* ✅ Localized welcome message with comma fix for Urdu */}
              {isRTL 
                ? `${t('common.welcome_back')}، ${user?.first_name || t('common.user_fallback')}`
                : `${t('common.welcome_back')}, ${user?.first_name || t('common.user_fallback')}`
              }
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* User Avatar - Fixed with ms-2 (Margin Start) */}
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ms-2">
              {user?.first_name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;