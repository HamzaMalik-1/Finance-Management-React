import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, Volume2, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react'; // ✅ Import all icons for dynamic lookup
import { useTranslation } from 'react-i18next';

// Internal Dynamic Icon Helper
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
  showIcons = true // ✅ New prop to toggle icons globally if needed
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const containerRef = useRef(null);

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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full mb-6" ref={containerRef}>
      <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 block">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 flex items-center justify-between bg-transparent rounded-lg border cursor-pointer transition-all ${
          error ? "border-red-500" : "border-zinc-700 focus-within:border-indigo-500"
        } ${isOpen ? "ring-2 ring-indigo-500/20" : ""}`}
      >
        <div className="flex items-center gap-3 truncate mr-2">
          {/* ✅ CONDITIONAL ICON FOR SELECTED OPTION */}
          {showIcons && selectedOption && (
            <div className="text-indigo-500">
              <DynamicIcon name={selectedOption.id} size={18} strokeWidth={2.5} />
            </div>
          )}
          
          <span className={`${selectedOption ? "text-app-text font-medium" : "text-zinc-500"}`}>
            {selectedOption ? selectedOption.name : t('common.select_option')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ChevronDown 
            size={18} 
            className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
          <button 
            type="button"
            onClick={(e) => handleSpeak(e, selectedOption ? selectedOption.name : label)}
            className="text-zinc-500 hover:text-indigo-500 transition-colors p-1"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[110] w-full mt-1 bg-zinc-300 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden shadow-zinc-200/50"
          >
            <div className="p-3 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/30">
              <Search size={16} className="text-zinc-700 dark:text-zinc-400" />
              <input 
                autoFocus
                className="w-full bg-transparent outline-none text-sm p-1 text-zinc-700 dark:text-zinc-500 placeholder-zinc-500"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-zinc-400">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { 
                      onSelect(opt.id); 
                      setIsOpen(false);
                      setSearch("");
                      handleSpeak({ stopPropagation: () => {} }, opt.name); 
                    }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                      String(value) === String(opt.id)
                        ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold" 
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-left"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                       {/* ✅ CONDITIONAL ICON IN LIST */}
                      {showIcons && (
                        <div className={`${String(value) === String(opt.id) ? "text-indigo-600" : "text-zinc-400"}`}>
                          <DynamicIcon name={opt.id} size={18} strokeWidth={2} />
                        </div>
                      )}
                      <span className="truncate">{opt.name}</span>
                    </div>
                    {String(value) === String(opt.id) && <Check size={16} className="text-indigo-500" />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-zinc-400 italic">
                  {t('common.no_results')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.span 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-1 absolute -bottom-5 left-1"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedSearchSelect;