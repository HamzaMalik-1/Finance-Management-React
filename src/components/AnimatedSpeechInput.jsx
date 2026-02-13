import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { tts } from "../utils/text-to-speech.js";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config.js";

// ✅ Using forwardRef to support React Hook Form 'register'
const AnimatedSpeechInput = React.forwardRef(({ 
  placeholder, 
  speakString = null, 
  isSpeak = true,
  value, 
  error, // ✅ New error prop for Zod validation messages
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  // 1. Detect if the SPECIFIC TEXT entered is RTL (Urdu/Arabic script)
  const isRtlText = (text) => {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlRegex.test(text);
  };

  // 2. Decide the direction: prioritize the text typed, fallback to app language
  const inputDir = value && isRtlText(value) ? "rtl" : (i18n.language === "ur" ? "rtl" : "ltr");
  const isCurrentlyRtl = inputDir === "rtl";

  const textToSpeak = speakString || t(placeholder);

  const handleSpeak = (e) => {
    e.preventDefault();
    tts.speak(textToSpeak, i18n.language);
  };

  // Label animation offsets should follow the detected direction
  const labelX = isCurrentlyRtl ? 13 : -17; 

  return (
    <div className="relative w-full mb-7 group">
      {/* 1. THE FLOATING LABEL */}
      <motion.label
        initial={false}
        animate={{
          x: isFocused || value ? labelX : 0,
          y: isFocused || value ? -34 : 0, 
          scale: isFocused || value ? 0.85 : 1,
          color: error ? "#ef4444" : (isFocused ? "#6366f1" : "#71717a"),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          transformOrigin: isCurrentlyRtl ? "right" : "left",
          right: isCurrentlyRtl ? "1rem" : "auto",
          left: isCurrentlyRtl ? "auto" : "1rem",
        }}
        className="absolute top-3 pointer-events-none px-1.5 bg-card-bg z-20 text-sm md:text-base whitespace-nowrap transition-colors"
      >
        {t(placeholder)}
      </motion.label>

      {/* 2. THE INPUT FIELD */}
      <div className="relative flex flex-col w-full">
        <div className="relative flex items-center w-full">
          <input
            {...props}
            ref={ref} // ✅ Ref passed here for React Hook Form
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              if (props.onChange) props.onChange(e); 
            }}
            dir={inputDir}
            style={{ unicodeBidi: "plaintext" }}
            className={`w-full p-3 text-sm md:text-base text-zinc-900 dark:text-white  bg-transparent rounded-lg border transition-all placeholder-transparent
              focus:border-indigo-500 outline-none text-app-text
              ${error ? "border-red-500" : "border-zinc-700"}
              ${isCurrentlyRtl ? "pl-11 pr-4 text-right" : "pr-11 pl-4 text-left"}`}
          />

          {isSpeak && (
            <button
              type="button"
              onClick={handleSpeak}
              className={`absolute p-2 rounded-md text-zinc-500 hover:text-indigo-500 active:scale-95 transition-all ${
                isCurrentlyRtl ? "left-2 rotate-180" : "right-2"
              }`}
            >
              <Volume2 size={20} className="md:w-[22px] md:h-[22px]" />
            </button>
          )}
        </div>

        {/* 3. ERROR MESSAGE DISPLAY */}
        {error && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs text-red-500 mt-1 absolute -bottom-5 ${isCurrentlyRtl ? 'right-1' : 'left-1'}`}
          >
            {error}
          </motion.span>
        )}
      </div>
    </div>
  );
});

export default AnimatedSpeechInput;