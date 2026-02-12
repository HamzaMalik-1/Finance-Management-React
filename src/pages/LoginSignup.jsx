import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useSignupMutation } from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";

import AnimatedSpeechInput from "../components/AnimatedSpeechInput";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. RTK Query Hooks
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  // 2. Form State
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const isRTL = i18n.language === "ur";

  const toggleMode = () => {
    setIsLogin(!isLogin);
    console.log("ho rha hai")
    // Optional: Clear form when switching
    setFormData({ email: "", username: "", password: "" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Auth Submission Logic
 const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  
  try {
    if (isLogin) {
      const response = await login({ 
        email: formData.email, 
        password: formData.password 
      }).unwrap();
      
      // ✅ FIX: Pass the 'data' object from your JSON to the dispatcher
      // This contains id, email, username, and token
      dispatch(setCredentials(response.data)); 
      
      navigate("/dashboard");
    } else {
      await signup(formData).unwrap();
      setIsLogin(true);
    }
  } catch (err) {
    console.error("Authentication failed:", err);
  }
};
console.log("Is setCredentials a function?", typeof setCredentials === 'function');
console.log("Is dispatch available?", typeof useDispatch === 'function');
console.log("formData",formData)
  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className="min-h-screen bg-app-bg text-app-text flex items-center justify-center p-4 transition-colors duration-300"
    >
      <div className="absolute top-5 inset-inline-end-5 flex items-center gap-3 z-[100]">
        <LanguageSwitcher />
        <ThemeToggle /> 
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md md:max-w-4xl min-h-[550px] md:h-[70vh] bg-card-bg rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800">
        
        {/* ANIMATED OVERLAY */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? (isRTL ? "-100%" : "100%") : "0%" }}
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
              <h2 className="text-4xl font-bold mb-4">{isLogin ? t("auth.welcome_back") : t("auth.join_us")}</h2>
              <p className="text-indigo-100 mb-8 max-w-[280px]">{isLogin ? t("auth.login_subtitle") : t("auth.signup_subtitle")}</p>
              <button onClick={toggleMode} className="px-10 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all active:scale-95">
                {isLogin ? t("auth.no_account") : t("auth.have_account")}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* FORMS */}
        <div className="flex w-full h-full relative">
          {/* Login Side */}
          <div className={`w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 ${!isLogin && 'hidden md:flex'}`}>
             <AnimatePresence mode="wait">
               {isLogin && (
                 <motion.div 
                key="login-container"
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, y: 10 }}
                   className="w-full"
                 >
                   <LoginForm 
                    t={t} 
                    toggleMode={toggleMode} 
                    formData={formData} 
                    onChange={handleInputChange} 
                    onSubmit={handleSubmit}
                    isLoading={isLoginLoading}
                    isLogin={isLogin}
                   />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Signup Side */}
          <div className={`w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 ${isLogin && 'hidden md:flex'}`}>
             <AnimatePresence mode="wait">
               {!isLogin && (
                 <motion.div 
                   key="signup-container"
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, y: 10 }}
                   className="w-full"
                 >
                   <SignupForm 
                    t={t} 
                    toggleMode={toggleMode} 
                    formData={formData} 
                    onChange={handleInputChange} 
                    onSubmit={handleSubmit}
                    isLoading={isSignupLoading}
                   />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ t, toggleMode, formData, onChange, onSubmit, isLoading,isLogin }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
      <input type="text" name="username" tabIndex="-1" autoComplete="off" />
      <input type="email" name="email" tabIndex="-1" autoComplete="off" />
      <input type="password" name="password" tabIndex="-1" autoComplete="new-password" />
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl md:text-3xl font-bold">{t("auth.sign_in")}</h3>
      <p className="text-zinc-500 text-sm">{t("auth.welcome_msg")}</p>
    </div>
    <div className="space-y-2">
      <AnimatedSpeechInput 
        placeholder="auth.email" 
        type="email" 
        name="email"
        value={formData.email}
        onChange={onChange}
        autoComplete={isLogin ? "off" : "new-password"}
        required
      />
      <AnimatedSpeechInput 
        placeholder="auth.password" 
        type="password" 
        name="password"
        value={formData.password}
        onChange={onChange}
        required
      autoComplete={isLogin ? "off" : "new-password"}
      />
    </div>
    <button 
      type="submit"
      disabled={isLoading}
      className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
    >
      {isLoading ? "..." : t("auth.login_btn")}
    </button>
    <p className="md:hidden text-center text-sm text-zinc-500">
      {t("auth.no_account")} <span onClick={toggleMode} className="text-indigo-600 font-bold cursor-pointer">{t("auth.sign_up")}</span>
    </p>
  </form>
);

const SignupForm = ({ t, toggleMode, formData, onChange, onSubmit, isLoading }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
      <input type="text" name="username" tabIndex="-1" autoComplete="off" />
      <input type="email" name="email" tabIndex="-1" autoComplete="off" />
      <input type="password" name="password" tabIndex="-1" autoComplete="new-password" />
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl md:text-3xl font-bold">{t("auth.sign_up")}</h3>
      <p className="text-zinc-500 text-sm">{t("auth.signup_msg")}</p>
    </div>
    <div className="space-y-1">
      <AnimatedSpeechInput 
        placeholder="auth.username" 
        type="text" 
        name="username"
        value={formData.username}
        onChange={onChange}
        required
     
      />
      <AnimatedSpeechInput 
        placeholder="auth.email" 
        type="email" 
        name="email"
        value={formData.email}
        onChange={onChange}
        required
 
      />
      <AnimatedSpeechInput 
        placeholder="auth.password" 
        type="password" 
        name="password"
        value={formData.password}
        onChange={onChange}
        required
        autoComplete="off"
      />
    </div>
    <button 
      type="submit"
      disabled={isLoading}
      className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
    >
      {isLoading ? "..." : t("auth.create_account_btn")}
    </button>
    <p className="md:hidden text-center text-sm text-zinc-500">
      {t("auth.have_account")} <span onClick={toggleMode} className="text-indigo-600 font-bold cursor-pointer">{t("auth.sign_in")}</span>
    </p>
  </form>
);

export default LoginSignup;