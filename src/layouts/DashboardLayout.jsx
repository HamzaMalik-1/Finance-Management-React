import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, User, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice"; // ✅ Ensure this path is correct
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isRTL = i18n.language === "ur";
  
  // ✅ Dropdown State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-app-bg text-app-text flex transition-colors duration-300"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-card-bg/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg hidden md:block italic uppercase tracking-tight">
              {isRTL
                ? `${t("common.welcome_back")}، ${user?.display_name || t("common.user_fallback")}`
                : `${t("common.welcome_back")}, ${user?.display_name || t("common.user_fallback")}`}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/main/notifications"
              className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all relative"
            >
              <Bell size={20} />
              {/* Optional: Unread indicator */}
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-card-bg" />
            </Link>

            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
            
            <LanguageSwitcher />
            <ThemeToggle />

            {/* ✅ USER AVATAR & DROPDOWN */}
            <div className="relative ms-2">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 group p-1 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20 transition-transform group-active:scale-90">
                  {user?.display_name?.[0] || "U"}
                </div>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to close on click outside */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-14 ${isRTL ? 'left-0' : 'right-0'} w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-20`}
                    >
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("onboarding.profile")}</p>
                        <p className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">{user?.display_name}</p>
                      </div>

                      <Link 
                        to="/main/settings" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                      >
                        <SettingsIcon size={18} /> {t("nav.settings")}
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-app-bg">
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