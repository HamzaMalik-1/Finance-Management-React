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

useEffect(() => {
  // 1. Calculate direction based on current language
  const currentDir = i18n.language === "ur" || i18n.language === "ar" ? "rtl" : "ltr";
  
  // 2. Apply to the root HTML element
  document.documentElement.dir = currentDir;
  document.documentElement.lang = i18n.language;

  // 3. Optional: Force a body class for specific CSS overrides
  document.body.className = currentDir; 
  
  console.log("Direction updated to:", currentDir); // Debug check
}, [i18n.language]); // Trigger this whenever language changes
  const steps = [
    { id: "isUser", label: t("onboarding.profile"), icon: "👤" },
    { id: "isAddress", label: t("onboarding.address"), icon: "🏠" },
    { id: "isContact", label: t("onboarding.contact"), icon: "📞" },
    { id: "isSettings", label: t("onboarding.settings"), icon: "⚙️" },
  ];

  return (
    /* ✅ FIXED: Use 'bg-app-bg' and 'text-app-text' from your theme.css variables */
    <div
      className={`${theme} min-h-screen bg-app-bg text-app-text p-4 md:p-8 transition-colors duration-300 relative`}
    >
      {/* CORNER ALIGNMENT */}
      <div className="fixed top-5 ltr:right-2 rtl:left-5 flex items-center gap-3 z-[100]">
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
                <div>
                  <span className="text-xl">{step.icon}</span>
                  {"  "}
                  <span
                    className={`text-sm font-bold ${status?.[step.id] ? "text-indigo-600" : "text-zinc-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {status?.[step.id] ? (
                  <CheckCircle2 className="text-indigo-500" size={20} />
                ) : (
                  <Circle className="text-zinc-300" size={20} />
                )}
              </div>
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
