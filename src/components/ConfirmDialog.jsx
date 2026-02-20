import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle size={28} />
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{t(title)}</h3>
              <p className="text-sm text-zinc-500 mt-2">{t(message)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold">
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20"
              >
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;