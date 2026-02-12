import React, { useState } from "react";
import { motion } from "motion/react";
import { Volume2 } from "lucide-react";
import { tts } from "../utils/text-to-speech.js";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config.js";

const AnimatedSpeechInput = ({ 
  placeholder, 
  speakString = null, 
  isSpeak = true,
  value, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  // 1. Detect if the SPECIFIC TEXT entered is RTL (Urdu/Arabic/etc)
  const isRtlText = (text) => {
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
    <div className="relative w-full mb-6 group">
      {/* 1. THE FLOATING LABEL */}
      <motion.label
        initial={false}
        animate={{
          x: isFocused || value ? labelX : 0,
          y: isFocused || value ? -34 : 0, 
          scale: isFocused || value ? 0.85 : 1,
          color: isFocused ? "#6366f1" : "#71717a",
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
      <div className="relative flex items-center w-full">
        <input
          {...props}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            if (props.onChange) props.onChange(e); 
          }}
          // ✅ Dynamically sets direction based on content
          dir={inputDir}
          // ✅ Style fix: 'unicodeBidi' forces alignment even with special chars like @
          style={{ unicodeBidi: "plaintext" }}
          className={`w-full p-3 text-sm md:text-base bg-transparent rounded-lg border border-zinc-700 
            focus:border-indigo-500 outline-none text-app-text transition-all placeholder-transparent
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
    </div>
  );
};

export default AnimatedSpeechInput;