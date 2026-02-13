import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AnimatedSearchSelect = ({ label, options = [], onSelect, value, error, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const containerRef = useRef(null); // ✅ Ref for click-outside detection

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  // ✅ CLICK OUTSIDE LOGIC: Closes the dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ SPEECH LOGIC: Narrates text for accessibility
  const handleSpeak = (e, text) => {
    e.stopPropagation(); // ✅ Prevents the dropdown from toggling when clicking the icon
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full mb-6" ref={containerRef}>
      {/* 1. LABEL */}
      <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 block">
        {label}
      </label>
      
      {/* 2. SELECT BOX (Trigger) */}
      {/* TRIGGER BUTTON */}
<div 
  onClick={() => setIsOpen(!isOpen)}
  className={`w-full p-3 flex items-center justify-between bg-transparent rounded-lg border cursor-pointer transition-all ${
    error ? "border-red-500" : "border-zinc-700 focus-within:border-indigo-500"
  } ${isOpen ? "ring-2 ring-indigo-500/20" : ""}`}
>
  {/* Left Side: Selected Text */}
  <span className={`truncate mr-2 ${selectedOption ? "text-app-text font-medium" : "text-zinc-500"}`}>
    {selectedOption ? selectedOption.name : t('common.select_option')}
  </span>

  {/* Right Side: Action Icons */}
  <div className="flex items-center gap-2 flex-shrink-0">
    {/* ✅ SPEAKER ICON AT THE END */}
   

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

      {/* 3. DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[100] w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Search size={16} className="text-zinc-400" />
              <input 
                autoFocus
                className="w-full bg-transparent outline-none text-sm p-1 text-app-text"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.div>
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
                      handleSpeak({ stopPropagation: () => {} }, opt.name); // ✅ Speak on selection
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-app-text"
                  >
                    {opt.name}
                    {value === opt.id && <Check size={14} className="text-indigo-500" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-zinc-500">No results found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. ERROR MESSAGE */}
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