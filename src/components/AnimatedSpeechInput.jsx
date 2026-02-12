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
  value, // ✅ Now properly receiving value from parent props
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const textToSpeak = speakString || t(placeholder);

  const handleSpeak = (e) => {
    e.preventDefault();
    tts.speak(textToSpeak, i18n.language);
  };

  const isUrdu = i18n.language === "ur";

  // Label animation offsets
  const labelX = isUrdu ? 13 : -17; 

  return (
    <div className="relative w-full mb-6 group">
      {/* 1. THE FLOATING LABEL */}
      <motion.label
        initial={false}
        animate={{
          // ✅ Label stays up if focused OR if there is a value in the parent state
          x: isFocused || value ? labelX : 0,
          y: isFocused || value ? -34 : 0, 
          scale: isFocused || value ? 0.85 : 1,
          color: isFocused ? "#6366f1" : "#71717a",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          transformOrigin: isUrdu ? "right" : "left",
          right: isUrdu ? "1rem" : "auto",
          left: isUrdu ? "auto" : "1rem",
        }}
        className="absolute top-3 pointer-events-none px-1.5 bg-card-bg z-20 text-sm md:text-base whitespace-nowrap transition-colors"
      >
        {t(placeholder)}
      </motion.label>

      {/* 2. THE INPUT FIELD */}
      <div className="relative flex items-center w-full">
        <input
          {...props}
          value={value} // ✅ Controlled by the parent's formData
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            // ✅ Directly trigger parent's handleInputChange
            if (props.onChange) props.onChange(e); 
          }}
          dir={isUrdu ? "rtl" : "ltr"}
          className={`w-full p-3 text-sm md:text-base bg-transparent rounded-lg border border-zinc-700 
            focus:border-indigo-500 outline-none text-app-text transition-all placeholder-transparent
            ${isUrdu ? "pl-11 pr-4" : "pr-11 pl-4"}`}
        />

        {isSpeak && (
          <button
            type="button"
            onClick={handleSpeak}
            aria-label="Speak text"
            className={`absolute p-2 rounded-md text-zinc-500 hover:text-indigo-500 active:scale-95 transition-all ${
              isUrdu ? "left-2 rotate-180" : "right-2"
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