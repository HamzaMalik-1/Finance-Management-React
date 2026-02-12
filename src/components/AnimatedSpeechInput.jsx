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
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  const textToSpeak = speakString || t(placeholder);

  const handleSpeak = (e) => {
    e.preventDefault();
    tts.speak(textToSpeak, i18n.language);
  };

  // Logic to move to the upper-right corner dynamically
  // For English: we shift right based on a percentage of the container minus a small padding
  // For Urdu: we adjust based on the RTL starting position
  const isUrdu = i18n.language === "ur";
  const xValueLabel = isUrdu ? 10 : "-12%"; 

  return (
    <div className="relative w-full mb-6 group">
      {/* 1. THE FLOATING LABEL */}
      <motion.label
        initial={false}
        animate={{
          x: isFocused || value ? xValueLabel : 0,
          y: isFocused || value ? -33 : 0, 
          scale: isFocused || value ? 0.85 : 1,
          color: isFocused ? "#6366f1" : "#71717a",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          // Ensure scaling happens from the correct side to prevent overlap
          transformOrigin: isUrdu ? "right" : "left",
          right: isUrdu ? "12px" : "auto",
          left: isUrdu ? "auto" : "12px",
        }}
        className="absolute top-3 pointer-events-none px-2 bg-card-bg z-20 text-sm whitespace-nowrap"
      >
        {t(placeholder)}
      </motion.label>

      {/* 2. THE INPUT FIELD */}
      <div className="relative flex items-center">
        <input
          {...props}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setValue(e.target.value);
            if (props.onChange) props.onChange(e); 
          }}
          dir={isUrdu ? "rtl" : "ltr"}
          className="w-full p-3 bg-transparent rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none text-app-text transition-all placeholder-transparent"
        />

        {isSpeak && (
          <button
            type="button"
            onClick={handleSpeak}
            className={`absolute p-1.5 rounded-md text-zinc-500 hover:text-indigo-500 transition-colors ${
              isUrdu ? "left-3 rotate-180" : "right-3"
            }`}
          >
            <Volume2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedSpeechInput;