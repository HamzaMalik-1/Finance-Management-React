import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const OnboardingLayout = ({ children, status }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur"; // cite: Dated Events, Projects & Plans
  const { theme } = useTheme();

  // ✅ Synchronize document direction and lang for SEO/Accessibility
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  const steps = [
    { id: "isUser", label: t("onboarding.profile"), icon: "👤" },
    { id: "isAddress", label: t("onboarding.address"), icon: "🏠" },
    { id: "isContact", label: t("onboarding.contact"), icon: "📞" },
    { id: "isSettings", label: t("onboarding.settings"), icon: "⚙️" },
  ];

  return (
    /* ✅ FIXED: Use 'bg-app-bg' and 'text-app-text' from your theme.css variables */
    <div className={`${theme} min-h-screen bg-app-bg text-app-text p-4 md:p-8 transition-colors duration-300 relative`}>
      
      {/* CORNER ALIGNMENT */}
      <div className="fixed top-5 ltr:right-5 rtl:left-5 flex items-center gap-3 z-[100]">
        {isRTL ? (
          <>
            <ThemeToggle />
            <LanguageSwitcher />
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <ThemeToggle />
          </>
        )}
      </div>

      <div className="max-w-4xl mx-auto relative mt-10 md:mt-0">
        {/* PROGRESS BOXES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pt-10 md:pt-0">
          {steps.map((step) => (
            <div
              key={step.id}
              /* ✅ FIXED: Use 'bg-card-bg' for progress indicators */
              className={`p-4 rounded-xl border-1 transition-all ${
                status?.[step.id]
                  ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20"
                  : "bg-card-bg border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{step.icon}</span>
                {status?.[step.id] ? (
                  <CheckCircle2 className="text-indigo-500" size={20} />
                ) : (
                  <Circle className="text-zinc-300" size={20} />
                )}
              </div>
              <p className={`text-sm font-bold ${status?.[step.id] ? "text-indigo-600" : "text-zinc-500"}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* PAGE CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={window.location.pathname}
          /* ✅ FIXED: Use 'bg-card-bg' for the main content card */
          className="bg-card-bg rounded-3xl shadow-xl p-6 md:p-10 border border-zinc-200 dark:border-zinc-800"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingLayout;