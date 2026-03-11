import React, { useImperativeHandle, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { tts } from "../utils/text-to-speech.js";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config.js";

const AnimatedSpeechInput = React.forwardRef(({ 
  placeholder, 
  speakString = null, 
  isSpeak = true,
  value, 
  error, 
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  // ✅ 1. Use local state to track if the input has content
  const [hasValue, setHasValue] = useState(!!value);
  const { t } = useTranslation();
  const internalRef = useRef(null);

  // Sync the forwarded ref with our internal ref
  useImperativeHandle(ref, () => internalRef.current);

  const isRtlText = (text) => {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlRegex.test(text);
  };

  // ✅ 2. Logic to keep the label floating
  const isFloating = isFocused || hasValue || value;

  const inputDir = (value || "") && isRtlText(value) ? "rtl" : (i18n.language === "ur" ? "rtl" : "ltr");
  const isCurrentlyRtl = inputDir === "rtl";
  const textToSpeak = speakString || t(placeholder);

  const handleSpeak = (e) => {
    e.preventDefault();
    tts.speak(textToSpeak, i18n.language);
  };

  const labelX = isCurrentlyRtl ? 13 : -17; 

  return (
    <div className="relative w-full mb-8 group">
      {/* 1. THE FLOATING LABEL */}
      <motion.label
        initial={false}
        animate={{
          x: isFloating ? labelX : 0,
          y: isFloating ? -36 : 0, 
          scale: isFloating ? 0.85 : 1,
          color:  "#71717a", // Indigo focus color
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          transformOrigin: isCurrentlyRtl ? "right" : "left",
          right: isCurrentlyRtl ? "1rem" : "auto",
          left: isCurrentlyRtl ? "auto" : "1rem",
        }}
        className="absolute font-bold top-3 pointer-events-none px-1.5  z-20 text-base md:text-lg whitespace-nowrap transition-colors"
      >
        {t(placeholder)}
      </motion.label>

      {/* 2. THE INPUT FIELD */}
      <div className="relative flex flex-col w-full">
        <div className="relative flex items-center w-full">
          <input
            {...props}
            ref={internalRef}
            value={value}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              // ✅ 3. Re-verify value on blur to keep label up
              setHasValue(!!e.target.value);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={(e) => {
              // ✅ 4. Update local state so label reacts immediately
              setHasValue(!!e.target.value);
              if (props.onChange) props.onChange(e); 
            }}
            dir={inputDir}
            style={{ unicodeBidi: "plaintext" ,...props.style}}
            className={`w-full p-4 text-zinc-900 dark:text-zinc-100 text-sm md:text-base bg-transparent rounded-2xl border transition-all placeholder-transparent
              focus:border-indigo-500 outline-none
              ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"}
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
            className={`text-xs font-bold text-red-500 mt-1 absolute -bottom-5 ${isCurrentlyRtl ? 'right-1' : 'left-1'}`}
          >
            {error}
          </motion.span>
        )}
      </div>
    </div>
  );
});

export default AnimatedSpeechInput;