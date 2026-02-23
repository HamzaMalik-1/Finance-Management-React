import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, User, Wallet, 
  ArrowUpRight, ArrowDownLeft, Plus, History,
  TrendingDown, CheckCircle2, Percent
} from 'lucide-react';
import { useGetDebtDetailsQuery } from '../../store/api/debtApi';
import moment from 'moment';
import AddRepaymentModal from './AddRepaymentModal';

const DebtDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  // Fetching debt with nested transactions (repayments)
  const { data: response, isLoading } = useGetDebtDetailsQuery(id);
  const debt = response?.data;

  if (isLoading) return (
    <div className="p-20 text-center animate-pulse text-zinc-400 font-black uppercase tracking-widest">
      Synchronizing Timeline...
    </div>
  );
  
  if (!debt) return <div className="p-20 text-center text-zinc-500 font-bold">Record not found.</div>;

  const isLent = debt.type === 'lent';
  const principal = parseFloat(debt.amount || 0);
  const remaining = parseFloat(debt.remainingAmount || 0);
  const interestRate = parseFloat(debt.interestRate || 0);
  
  const paidAmount = principal - remaining;
  const interestAmount = (principal * interestRate) / 100;
  const totalWithInterest = principal + interestAmount;
  const progress = principal > 0 ? (paidAmount / principal) * 100 : 0;

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* 1. Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Financial Timeline</h2>
            <p className="text-zinc-500 text-sm font-medium italic">History with {debt.contactPerson?.name}</p>
          </div>
        </div>
        
        {debt.status !== 'settled' && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRepayModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200"
          >
            <Plus size={18} strokeWidth={3} /> Record Payment
          </motion.button>
        )}
      </div>

      {/* 2. Main Balance Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <History size={120} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isLent ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {isLent ? 'Receivable Asset' : 'Payable Liability'}
            </span>
            <h3 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 mt-4 tracking-tighter">
              ${remaining.toLocaleString()}
            </h3>
            <p className="text-zinc-400 font-bold mt-1 uppercase text-xs tracking-widest">Current Outstanding Balance</p>
          </div>
          
          <div className="flex flex-col justify-end space-y-4">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Initial Principal</p>
                   <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">${principal.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Settled Amount</p>
                   <p className="text-xl font-bold text-emerald-500">${paidAmount.toLocaleString()}</p>
                </div>
             </div>
             {/* Progress Bar */}
             <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className={`h-full rounded-full ${isLent ? 'bg-emerald-500' : 'bg-indigo-600'}`}
               />
             </div>
          </div>
        </div>
      </div>

      {/* 3. Detail Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <InfoBlock icon={<Calendar />} label="Commenced" value={moment(debt.createdAt).format('MMM DD, YYYY')} />
         <InfoBlock icon={<Wallet />} label="Account" value={debt.account?.name || 'Cash'} />
         <InfoBlock icon={<Percent />} label="Interest" value={`${interestRate}% Annual`} />
      </div>

      {/* 4. The Settlement Timeline */}
      <div className="pt-6 space-y-8">
        <div className="flex items-center gap-2 px-2">
          <History size={20} className="text-zinc-400" />
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Settlement Path</h3>
        </div>

        <div className="relative ml-6 pl-10 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-10">
          {/* Node: Initial Debt */}
          <TimelineNode 
            date={debt.createdAt} 
            title="Debt Origination" 
            note={debt.description || "Initial balance recorded"}
            amount={principal}
            isInitial
          />

          {/* Nodes: Repayments */}
          {debt.repayments?.map((tx, idx) => (
            <TimelineNode 
              key={tx.id}
              date={tx.createdAt} 
              title="Partial Settlement" 
              note={tx.description || `Payment via ${tx.sourceAccount?.name || 'Ledger'}`}
              amount={tx.amount}
            />
          ))}

          {/* Node: Completion */}
          {debt.status === 'settled' && (
            <div className="relative">
               <div className="absolute -left-[54px] top-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-950 shadow-lg flex items-center justify-center text-white">
                  <CheckCircle2 size={16} strokeWidth={3} />
               </div>
               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                  <h4 className="font-black text-emerald-700 dark:text-emerald-400 uppercase text-sm tracking-widest">Debt Fully Settled</h4>
                  <p className="text-xs text-emerald-600/70 font-medium">This obligation has been cleared in full.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Repayment Modal */}
      <AddRepaymentModal 
        isOpen={isRepayModalOpen} 
        onClose={() => setIsRepayModalOpen(false)} 
        debt={debt} 
      />
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const InfoBlock = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
    <div className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">{label}</p>
      <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">{value}</p>
    </div>
  </div>
);

const TimelineNode = ({ date, title, note, amount, isInitial = false }) => (
  <div className="relative group">
    {/* Dot on the vertical line */}
    <div className={`absolute -left-[51px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 shadow-md transition-transform group-hover:scale-125 ${
      isInitial ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-indigo-500'
    }`} />
    
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex justify-between items-center transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
      <div>
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">
          {moment(date).format('MMM DD, YYYY · hh:mm A')}
        </p>
        <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">{title}</h4>
        <p className="text-xs text-zinc-500 font-medium mt-1 italic">{note}</p>
      </div>
      <div className="text-right">
        <div className={`flex items-center gap-1 justify-end font-black text-xl ${isInitial ? 'text-zinc-900 dark:text-zinc-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
           {!isInitial && <TrendingDown size={18} />}
           ${parseFloat(amount).toLocaleString()}
        </div>
        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">
            {isInitial ? 'Principal' : 'Payment'}
        </p>
      </div>
    </div>
  </div>
);

export default DebtDetailsPage;