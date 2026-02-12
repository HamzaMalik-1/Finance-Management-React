import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import AnimatedSpeechInput from "../components/AnimatedSpeechInput";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { t, i18n } = useTranslation();

  const toggleMode = () => setIsLogin(!isLogin);

  // Determine if the current language is RTL (like Urdu)
  const isRTL = i18n.language === "ur";

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className="min-h-screen bg-app-bg text-app-text flex  justify-center p-5 transition-colors duration-300"
    >
      {/* 1. GLOBAL UI ACTIONS: Use logical 'inset-inline-end' for the top-right corner */}
      <div className="absolute top-5 inset-inline-end-5 flex items-center gap-3 z-[100]">
        <LanguageSwitcher />
        <ThemeToggle /> 
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-4xl max-h-[84vh] bg-card-bg rounded-2xl overflow-hidden shadow-2xl flex border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        
        {/* 2. THE ANIMATED OVERLAY (The Indigo Box) */}
        <motion.div
          initial={false}
          animate={{ 
            // In RTL, 100% moves it to the left side relative to start
            x: isLogin ? (isRTL ? "-100%" : "100%") : "0%",
            borderTopLeftRadius: isLogin ? (isRTL ? "16px" : "0px") : (isRTL ? "0px" : "16px"),
            borderBottomLeftRadius: isLogin ? (isRTL ? "16px" : "0px") : (isRTL ? "0px" : "16px"),
            borderTopRightRadius: isLogin ? (isRTL ? "0px" : "16px") : (isRTL ? "16px" : "0px"),
            borderBottomRightRadius: isLogin ? (isRTL ? "0px" : "16px") : (isRTL ? "16px" : "0px"),
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute top-0 inset-inline-start-0 w-1/2 h-full bg-indigo-600 z-30 flex flex-col items-center justify-center p-10 text-white text-center shadow-2xl"
        >
          <motion.div
            key={isLogin ? "login-text" : "signup-text"}
            initial={{ opacity: 0, x: isLogin ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              {isLogin ? t("auth.welcome_back") : t("auth.join_us")}
            </h2>
            <p className="text-indigo-100 mb-8 max-w-[280px]">
              {isLogin ? t("auth.login_subtitle") : t("auth.signup_subtitle")}
            </p>
            <button
              onClick={toggleMode}
              className="px-10 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {isLogin ? t("auth.no_account") : t("auth.have_account")}
            </button>
          </motion.div>
        </motion.div>

        {/* 3. FORM SECTIONS: Logical padding and alignment */}
        <motion.div 
          animate={{ 
            opacity: isLogin ? 1 : 0,
            x: isLogin ? 0 : (isRTL ? 50 : -50),
            zIndex: isLogin ? 20 : 10 
          }}
          className="w-1/2 h-full flex flex-col justify-center p-12 text-start"
        >
          <LoginForm t={t} isRTL={isRTL} />
        </motion.div>

        <motion.div 
          animate={{ 
            opacity: !isLogin ? 1 : 0,
            x: !isLogin ? 0 : (isRTL ? -50 : 50),
            zIndex: !isLogin ? 20 : 10 
          }}
          className="w-1/2 h-full flex flex-col justify-center p-12 text-start"
        >
          <SignupForm t={t} isRTL={isRTL} />
        </motion.div>

      </div>
    </div>
  );
};

const LoginForm = ({ t }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-3xl font-bold tracking-tight">{t("auth.sign_in")}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t("auth.welcome_msg")}</p>
    </div>
    <div className="space-y-2">
      <AnimatedSpeechInput placeholder="auth.email" type="email" />
      <AnimatedSpeechInput placeholder="auth.password" type="password" />
    </div>
    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
      {t("auth.login_btn")}
    </button>
  </div>
);

const SignupForm = ({ t }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-3xl font-bold tracking-tight">{t("auth.sign_up")}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t("auth.signup_msg")}</p>
    </div>
    <div className="space-y-1">
      <div className="flex gap-2">
         <AnimatedSpeechInput placeholder="auth.first_name" isSpeak={false} />
         <AnimatedSpeechInput placeholder="auth.last_name" isSpeak={false} />
      </div>
      <AnimatedSpeechInput placeholder="auth.email" type="email" />
      <AnimatedSpeechInput placeholder="auth.username" type="text" />
      <AnimatedSpeechInput placeholder="auth.password" type="password" />
    </div>
    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
      {t("auth.create_account_btn")}
    </button>
  </div>
);

export default LoginSignup;