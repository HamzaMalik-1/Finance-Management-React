import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, Volume2, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tts } from "../utils/text-to-speech.js"; // ✅ Using your standard TTS utility

const DynamicIcon = ({ name, size = 20, ...props }) => {
  const IconComponent = Icons[name] || HelpCircle;
  return <IconComponent size={size} {...props} />;
};

const AnimatedSearchSelect = ({ 
  label, 
  options = [], 
  onSelect, 
  value, 
  error, 
  isLoading,
  showIcons = false // Default to false if IDs don't match Lucide icon names
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  // ✅ RTL Detection
  const isRTL = i18n.language === 'ur' || i18n.language === 'ar';

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find(opt => String(opt.id) === String(value));

  const filteredOptions = safeOptions.filter(opt => 
    (opt.name || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    // ✅ Using your shared tts utility for consistency
    tts.speak(text, i18n.language);
  };

  return (
    <div className="relative w-full mb-9" ref={containerRef} dir={isRTL ? 'rtl' : 'ltr'}>
      <label className={`text-xs font-black text-zinc-500 uppercase mb-1 block tracking-widest ${isRTL ? 'mr-1' : 'ml-1'}`}>
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 flex items-center justify-between bg-white dark:bg-zinc-900/50 rounded-xl border cursor-pointer transition-all ${
          error ? "border-red-500" : "border-zinc-300 dark:border-zinc-800 focus-within:border-indigo-500"
        } ${isOpen ? "ring-2 ring-indigo-500/20" : ""}`}
      >
        {/* Logical Content Alignment */}
        <div className={`flex items-center gap-3 truncate ${isRTL ? 'ml-2' : 'mr-2'}`}>
          {showIcons && selectedOption && (
            <div className="text-indigo-500 flex-shrink-0">
              <DynamicIcon name={selectedOption.id} size={18} strokeWidth={2.5} />
            </div>
          )}
          
          <span className={`text-sm md:text-base truncate ${selectedOption ? "text-zinc-900 dark:text-zinc-100 font-bold" : "text-zinc-400"}`}>
            {selectedOption ? selectedOption.name : t('common.select_option')}
          </span>
        </div>

        {/* Action Buttons: Flipped order for RTL */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            type="button"
            onClick={(e) => handleSpeak(e, selectedOption ? selectedOption.name : label)}
            className="text-zinc-400 hover:text-indigo-500 transition-colors p-1"
          >
            <Volume2 size={18} />
          </button>
          <ChevronDown 
            size={18} 
            className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[110] w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Input Area */}
            <div className={`p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-800/50`}>
              <Search size={16} className="text-zinc-400" />
              <input 
                autoFocus
                className="w-full bg-transparent outline-none text-sm p-1 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center"><Spinner /></div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { 
                      onSelect(opt.id); 
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm transition-colors ${
                      String(value) === String(opt.id)
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-black" 
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {showIcons && (
                        <DynamicIcon name={opt.id} size={18} />
                      )}
                      <span>{opt.name}</span>
                    </div>
                    {String(value) === String(opt.id) && <Check size={16} />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  {t('common.no_results')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                      className={`text-xs text-red-500 mt-1 absolute -bottom-5 ${isRTL ? 'right-1' : 'left-1'}`}

        >
          {error}
        </motion.span>
      )}
    </div>
  );
};

const Spinner = () => (
  <motion.div 
    animate={{ rotate: 360 }} 
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"
  />
);

export default AnimatedSearchSelect;