import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Percent, AlertCircle, ChevronRight } from 'lucide-react';

const DebtCard = ({ debt }) => {
  const navigate = useNavigate();
  
  // Robust data extraction
  const status = debt.status || 'active';
  const isLent = debt.type === 'lent';
  const principal = parseFloat(debt.amount || 0);
  const remaining = parseFloat(debt.remainingAmount || 0);
  const interestRate = parseFloat(debt.interestRate || 0);
  
  // Logic: Even if the status says 'settled', we check the remaining amount 
  // to prevent displaying "$0" incorrectly if the backend hook failed.
  const isActuallySettled = status === 'settled' || remaining <= 0;
  
  // Calculate total obligation (Principal + Interest)
  const interestAmount = (principal * interestRate) / 100;
  const totalObligation = principal + interestAmount;
  
  // Progress calculation
  const amountPaid = principal - remaining;
  const progress = principal > 0 ? (amountPaid / principal) * 100 : 0;

  const contactName = debt.contactPerson?.name || "Private Contact";

  return (
    <motion.div 
      whileHover={{ x: 4 }}
      onClick={() => navigate(`/main/debts/${debt.id}`)}
      className="group flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer border-l-4 border-transparent hover:border-indigo-500"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Profile Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-colors ${
          isActuallySettled ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800' : 
          isLent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
        }`}>
          {contactName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
              {contactName}
            </h4>
            
            {/* Status Badges */}
            {isActuallySettled ? (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                <CheckCircle2 size={10} /> Settled
              </span>
            ) : status === 'partially_paid' ? (
              <span className="flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                <AlertCircle size={10} /> Partial
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                <Clock size={10} /> Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-0.5">
             <p className={`text-[10px] font-black uppercase tracking-widest ${isLent ? 'text-emerald-500' : 'text-rose-500'}`}>
               {isLent ? 'Receivable' : 'Payable'}
             </p>
             {interestRate > 0 && (
               <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 rounded">
                 <Percent size={10} /> {interestRate}% APR
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          {/* Display logic: If settled, show the total cleared. If active, show remaining. */}
          <h3 className={`text-xl font-black ${isActuallySettled ? 'text-zinc-400' : isLent ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${isActuallySettled ? principal.toLocaleString() : remaining.toLocaleString()}
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
            {isActuallySettled ? 'Total Cleared' : `of $${totalObligation.toLocaleString()}`}
          </p>
          
          {/* Progress Bar */}
          <div className="w-32 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden ml-auto">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${isActuallySettled ? 100 : progress}%` }}
              className={`h-full ${isActuallySettled ? 'bg-zinc-300' : isLent ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
          </div>
        </div>

        <ChevronRight size={20} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
      </div>
    </motion.div>
  );
};

export default DebtCard;