import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const MainLayout = ({ children }) => {
  const { i18n, t } = useTranslation();
  const { theme } = useTheme();

  // Determine if current language is RTL (like Urdu or Arabic)
  const isRTL = i18n.language === "ur" || i18n.language === "ar";

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className={`min-h-screen transition-colors duration-300 bg-app-bg text-app-text 
        ${isRTL ? 'font-urdu' : 'font-sans'}`}
    >


      {/* 2. PAGE CONTENT */}
      <main className="relative  px-4 md:px-8 max-w-7xl mx-auto">
        {/* Added a container with max-width for better desktop viewing */}
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* 3. MOBILE NAVIGATION (Optional - for Finance Dashboards) */}
      {/* You could add a bottom navigation bar here for mobile if needed */}
    </div>
  );
};

export default MainLayout;