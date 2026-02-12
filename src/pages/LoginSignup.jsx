import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import AnimatedSpeechInput from "../components/AnimatedSpeechInput";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { t, i18n } = useTranslation();

  const toggleMode = () => setIsLogin(!isLogin);
  const isRTL = i18n.language === "ur";

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className="min-h-screen bg-app-bg text-app-text flex items-center justify-center p-4 md:p-10 transition-colors duration-300"
    >
      {/* 1. CONTROLS */}
      <div className="absolute top-5 inset-inline-end-5 flex items-center gap-3 z-[100]">
        <LanguageSwitcher />
        <ThemeToggle /> 
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md md:max-w-4xl h-auto md:h-[80vh] bg-card-bg rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
        
        {/* 2. THE ANIMATED OVERLAY (Desktop Only: md+) */}
        <motion.div
          initial={false}
          animate={{ 
            x: isLogin ? (isRTL ? "-100%" : "100%") : "0%",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="hidden md:flex absolute top-0 inset-inline-start-0 w-1/2 h-full bg-indigo-600 z-30 flex-col items-center justify-center p-10 text-white text-center shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-text" : "signup-text"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-4xl font-bold mb-4">
                {isLogin ? t("auth.welcome_back") : t("auth.join_us")}
              </h2>
              <p className="text-indigo-100 mb-8 max-w-[280px]">
                {isLogin ? t("auth.login_subtitle") : t("auth.signup_subtitle")}
              </p>
              <button onClick={toggleMode} className="px-10 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all active:scale-95">
                {isLogin ? t("auth.no_account") : t("auth.have_account")}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 3. FORM SECTIONS */}
        <div className="w-full md:w-full h-full flex relative min-h-[500px]">
          
          {/* Login Form Container */}
          <motion.div 
            animate={{ 
              // This logic ensures the form is visible on desktop, but only one shows on mobile
              opacity: isLogin ? 1 : 0,
              pointerEvents: isLogin ? "auto" : "none",
              x: isLogin ? "0%" : (isRTL ? "20%" : "-20%")
            }}
            className="absolute inset-0 w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 md:left-0 md:rtl:right-0"
          >
            <LoginForm t={t} toggleMode={toggleMode} />
          </motion.div>

          {/* Signup Form Container */}
          <motion.div 
            animate={{ 
              opacity: !isLogin ? 1 : 0,
              pointerEvents: !isLogin ? "auto" : "none",
              x: !isLogin ? "0%" : (isRTL ? "-20%" : "20%")
            }}
            className="absolute inset-0 w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 md:right-0 md:rtl:left-0"
          >
            <SignupForm t={t} toggleMode={toggleMode} />
          </motion.div>
          
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ t, toggleMode }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-2xl md:text-3xl font-bold">{t("auth.sign_in")}</h3>
      <p className="text-zinc-500 text-sm">{t("auth.welcome_msg")}</p>
    </div>
    <div className="space-y-2">
      <AnimatedSpeechInput placeholder="auth.email" type="email" />
      <AnimatedSpeechInput placeholder="auth.password" type="password" />
    </div>
    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
      {t("auth.login_btn")}
    </button>
    {/* Mobile Toggle Link */}
    <p className="md:hidden text-center text-sm text-zinc-500">
      {t("auth.no_account")} <span onClick={toggleMode} className="text-indigo-600 font-bold cursor-pointer">{t("auth.sign_up")}</span>
    </p>
  </div>
);

const SignupForm = ({ t, toggleMode }) => (
  <div className="space-y-6 ">
    <div className="space-y-2">
      <h3 className="text-2xl md:text-3xl font-bold">{t("auth.sign_up")}</h3>
      <p className="text-zinc-500 text-sm">{t("auth.signup_msg")}</p>
    </div>
    <div className="space-y-1">
      <AnimatedSpeechInput placeholder="auth.email" type="email" />
      <AnimatedSpeechInput placeholder="auth.username" type="text" />
      <AnimatedSpeechInput placeholder="auth.password" type="password" />
    </div>
    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
      {t("auth.create_account_btn")}
    </button>
    {/* Mobile Toggle Link */}
    <p className="md:hidden text-center text-sm text-zinc-500">
      {t("auth.have_account")} <span onClick={toggleMode} className="text-indigo-600 font-bold cursor-pointer">{t("auth.sign_in")}</span>
    </p>
  </div>
);

export default LoginSignup;