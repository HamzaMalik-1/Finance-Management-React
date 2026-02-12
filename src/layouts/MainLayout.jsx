import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const MainLayout = ({ children }) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  // Determine if current language is RTL (like Urdu)
  const isRTL = i18n.language === "ur";

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className={`min-h-screen transition-colors duration-300 bg-app-bg text-app-text 
        ${isRTL ? 'font-urdu' : 'font-sans'}`}
    >
      {/* GLOBAL HEADER / NAVIGATION CONTROLS */}
      

      {/* PAGE CONTENT */}
      <main className="relative pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;