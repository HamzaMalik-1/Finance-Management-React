import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, AlertCircle, Edit2, Trash2, Zap } from 'lucide-react';
import { useDeleteBudgetMutation } from '../../store/api/budgetApi';
import { toast } from 'react-hot-toast';
import useOutsideClick from '../../hooks/useOutsideClick';
import ConfirmDialog from '../../components/ConfirmDialog'; // Ensure path is correct

const BudgetCard = ({ budget, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Modal state
  const menuRef = useRef(null);
  const [deleteBudget, { isLoading: isDeleting }] = useDeleteBudgetMutation();

  useOutsideClick(menuRef, () => setShowMenu(false));

  const limit = parseFloat(budget.amountLimit);
  const spent = parseFloat(budget.actualSpent || 0);
  const remaining = limit - spent;
  const percentage = Math.min((spent / limit) * 100, 100);
  const threshold = parseFloat(budget.alertThreshold || 80);

  const isOverBudget = spent > limit;
  const isNearLimit = percentage >= threshold;

  const barColor = isOverBudget 
    ? 'bg-rose-500' 
    : isNearLimit 
      ? 'bg-amber-500' 
      : 'bg-emerald-500';

  // Triggered after user clicks "Delete" in the ConfirmDialog
  const handleConfirmDelete = async () => {
    try {
      await deleteBudget(budget.id).unwrap();
      toast.success("Budget deleted successfully");
    } catch (err) {
      toast.error("Failed to delete budget");
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 rounded-[2.5rem] shadow-sm relative overflow-visible"
      >
        {/* 1. Header & Menu */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-3xl shadow-inner">
              {budget.category?.icon || '💰'}
            </div>
            <div>
              <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                {budget.category?.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                  {budget.period}
                </span>
                {budget.isRolling && <Zap size={12} className="text-amber-500" />}
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <MoreVertical size={20}/>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => { onEdit(budget); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <Edit2 size={16} /> Edit Budget
                  </button>
                  <button 
                    onClick={() => { setIsDeleteDialogOpen(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Balance & 3. Progress Section (Omitted for brevity, kept exactly same) */}
        <div className="space-y-5">
          <div className="flex justify-between items-end">
            <div>
              <p className={`text-3xl font-black tracking-tighter ${isOverBudget ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                ${remaining.toLocaleString()}
              </p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Remaining to spend</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                Used <span className={isOverBudget ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}>${spent.toLocaleString()}</span> of ${limit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                className={`h-full rounded-full shadow-sm transition-colors duration-500 ${barColor}`}
              />
            </div>
            <div 
              className="absolute -top-1 bottom-0 w-0.5 bg-zinc-400/40 border-l border-white dark:border-zinc-900"
              style={{ left: `${threshold}%` }}
              title={`Alert at ${threshold}%`}
            />
          </div>

          <div className="flex items-center justify-between">
              {isOverBudget ? (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase">
                  <AlertCircle size={14} /> Exceeded by ${ (spent - limit).toLocaleString() }
                </div>
              ) : isNearLimit ? (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase">
                  <AlertCircle size={14} /> Near limit threshold
                </div>
              ) : (
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                  Budget health: <span className="text-emerald-500">Excellent</span>
                </div>
              )}
              
              <p className="text-[10px] font-bold text-zinc-400 italic">
                 Ends {new Date(budget.endDate).toLocaleDateString()}
              </p>
          </div>
        </div>
      </motion.div>

      {/* 4. Professional Confirm Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="budget.delete_title" // Translates to "Delete Budget?"
        message="budget.delete_warning" // Translates to "Are you sure? This action cannot be undone."
      />
    </>
  );
};

export default BudgetCard;