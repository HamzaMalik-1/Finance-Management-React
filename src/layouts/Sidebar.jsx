import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  Users,
  Layers,
  Bell,
  Settings,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useRtl } from '../hooks/useRtl'; // ✅ Using your RTL hook

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isRTL } = useRtl(); // ✅ Reactive RTL detection
  const [isExpanded, setIsExpanded] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const permissions = user?.permissions || [];

  const navItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: <LayoutDashboard size={22} />, module: "Dashboard", path: "/main/dashboard" },
    { id: "accounts", label: t("nav.accounts"), icon: <Wallet size={22} />, module: "Accounts", path: "/main/account" },
    { id: "transactions", label: t("nav.transactions"), icon: <Receipt size={22} />, module: "Transactions", path: "/main/transactions" },
    { id: "budgets", label: t("nav.budgets"), icon: <PieChart size={22} />, module: "Budgets", path: "/main/budgets" },
    { id: "debts", label: t("nav.debts"), icon: <Users size={22} />, module: "Borrow & Lend", path: "/main/debts" },
    { id: "categories", label: t("nav.categories"), icon: <Layers size={22} />, module: "Categories", path: "/main/categories" },
    { id: "notifications", label: t("nav.notifications"), icon: <Bell size={22} />, module: "Notifications", path: "/main/notifications" },
    { id: "settings", label: t("nav.settings"), icon: <Settings size={22} />, module: "Settings", path: "/main/settings" },
  ];

  const filteredNav = navItems.filter((item) => {
    const perm = permissions.find((p) => p.module_name === item.module);
    return perm ? perm.is_read : true; 
  });

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 280 : 80,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      }}
      // ✅ Set dir explicitly to ensure logical flex behavior
      dir={isRTL ? "rtl" : "ltr"}
      className={`h-screen sticky top-0 bg-card-bg border-zinc-200 dark:border-zinc-800 flex flex-col z-50
        ${isRTL ? "border-l" : "border-r"}`}
    >
      {/* Header & Toggle */}
      <div className="p-4 flex items-center justify-between min-h-[80px]">
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }} // ✅ Logical animation offset
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
              className="font-black text-xl text-indigo-600 tracking-tighter"
            >
              FINANCE.IO
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link to={item.path} key={item.id}>
              <motion.div
                whileHover={{ x: isExpanded ? (isRTL ? -4 : 4) : 0 }}
                // ✅ 'flex-row' combined with 'dir="rtl"' puts icon first (on the right)
                className={`flex flex-row items-center gap-4 p-3 rounded-xl cursor-pointer group transition-all duration-200
                  ${isActive ? "bg-indigo-600 text-white shadow-lg" : "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-500"}`}
              >
                <div className={`${isActive ? "text-white" : "group-hover:text-indigo-500"} flex-shrink-0 transition-colors`}>
                  {item.icon}
                </div>

                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    // ✅ Logical text alignment
                    className={`font-medium whitespace-nowrap overflow-hidden text-start ${isActive ? "text-white" : "text-app-text"}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
            {user?.display_name?.[0] || "U"}
          </div>
          {isExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden text-start">
              <p className="text-sm font-bold truncate text-app-text">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest">
                {user?.is_premium ? t("user.premium") : t("user.standard")}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;