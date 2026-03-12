import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, User, Wallet, 
  ArrowUpRight, ArrowDownLeft, Plus, History,
  TrendingDown, CheckCircle2, Percent
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetDebtDetailsQuery } from '../../store/api/debtApi';
import moment from 'moment';
import AddRepaymentModal from './AddRepaymentModal';

const DebtDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';
  
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  const { data: response, isLoading } = useGetDebtDetailsQuery(id);
  const debt = response?.data;

  // ✅ Priority: Backend dynamic symbol > i18n fallback
  const symbol = debt?.currencySymbol || t('common.currency_symbol');

  console.log(debt)
  if (isLoading) return (
    <div className="p-20 text-center animate-pulse text-zinc-400 font-black uppercase tracking-widest">
      {t('debts.details.syncing')}
    </div>
  );
  
  if (!debt) return (
    <div className="p-20 text-center text-zinc-500 font-bold">
      {t('debts.details.not_found')}
    </div>
  );

  const isLent = debt.type === 'lent';
  const principal = parseFloat(debt.amount || 0);
  const remaining = parseFloat(debt.remainingAmount || 0);
  const interestRate = parseFloat(debt.interestRate || 0);
  
  const paidAmount = principal - remaining;
  const progress = principal > 0 ? (paidAmount / principal) * 100 : 0;

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto px-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* 1. Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            {isRTL ? <Plus className="rotate-45" size={24} strokeWidth={3} /> : <ChevronLeft size={24} strokeWidth={3} />}
          </button>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h2 className="text-2xl font-black text-app tracking-tight uppercase leading-none">
              {t('debts.details.title')}
            </h2>
            <p className="text-zinc-500 text-sm font-medium italic mt-1">
              {t('debts.details.history_with', { name: debt.contactPerson?.name })}
            </p>
          </div>
        </div>
        
        {debt.status !== 'settled' && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRepayModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20"
          >
            <Plus size={16} strokeWidth={3} /> {t('debts.details.record_payment')}
          </motion.button>
        )}
      </div>

      {/* 2. Main Balance Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 opacity-5 ${isRTL ? 'left-0' : 'right-0'} p-8`}>
            <History size={120} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isLent ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {isLent ? t('debts.details.receivable') : t('debts.details.payable')}
            </span>
            <h3 className="text-5xl font-black text-white mt-4 tracking-tighter tabular-nums italic">
              {symbol}{remaining.toLocaleString()}
            </h3>
            <p className="text-zinc-500 font-bold mt-1 uppercase text-[10px] tracking-widest">
              {t('debts.details.outstanding')}
            </p>
          </div>
          
          <div className="flex flex-col justify-end space-y-4">
             <div className="flex justify-between items-end">
                <div className={isRTL ? 'text-right' : 'text-left'}>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('debts.details.principal')}</p>
                   <p className="text-xl font-black text-white tabular-nums">{symbol}{principal.toLocaleString()}</p>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('debts.details.settled_amount')}</p>
                   <p className="text-xl font-black text-emerald-500 tabular-nums">{symbol}{paidAmount.toLocaleString()}</p>
                </div>
             </div>
             <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
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
          <InfoBlock icon={<Calendar size={20}/>} label={t('debts.details.commenced')} value={moment(debt.createdAt).format('MMM DD, YYYY')} />
          <InfoBlock icon={<Wallet size={20}/>} label={t('debts.source_account')} value={debt.account?.name || 'Cash'} />
          <InfoBlock icon={<Percent size={20}/>} label={t('debts.details.interest')} value={`${interestRate}% ${t('debts.details.annual')}`} />
      </div>

      {/* 4. The Settlement Timeline */}
     <div className="pt-6 space-y-8">
  {/* Header: Simplified for native RTL support */}
  <div className="flex items-center gap-3 px-2">
    <History size={20} className="text-zinc-500 shrink-0" />
    <h3 className="text-lg font-black text-app uppercase tracking-tight">
      {t('debts.details.settlement_path')}
    </h3>
  </div>

  {/* Timeline Container: Fixed positioning for the vertical line */}
  <div 
    className={`relative space-y-10 border-zinc-800 ${
      isRTL 
        ? 'mr-6 pr-10 border-r-2 text-right' 
        : 'ml-6 pl-10 border-l-2 text-left'
    }`}
  >
    <TimelineNode 
      date={debt.createdAt} 
      title={t('debts.details.origination')} 
      note={debt.description || t('common.note')}
      amount={principal}
      isInitial
      symbol={symbol}
      isRTL={isRTL}
    />

    {debt.repayments?.map((tx) => (
      <TimelineNode 
        key={tx.id}
        date={tx.createdAt} 
        title={t('debts.details.partial_settlement')} 
        note={tx.description || `${t('debts.details.record_payment')} - ${tx.sourceAccount?.name || ''}`}
        amount={tx.amount}
        symbol={symbol}
        isRTL={isRTL}
      />
    ))}

    {/* Completion Node: Corrected absolute positioning */}
    {debt.status === 'settled' && (
      <div className="relative">
        <div 
          className={`absolute top-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-zinc-950 shadow-lg flex items-center justify-center text-white z-10 ${
            isRTL ? '-right-[54px]' : '-left-[54px]'
          }`}
        >
          <CheckCircle2 size={16} strokeWidth={3} />
        </div>
        <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/20">
          <h4 className="font-black text-emerald-500 uppercase text-sm tracking-widest">
            {t('debts.details.fully_settled')}
          </h4>
          <p className="text-xs text-emerald-500/60 font-medium">
            {t('debts.details.settled_desc')}
          </p>
        </div>
      </div>
    )}
  </div>
</div>
      <AddRepaymentModal isOpen={isRepayModalOpen} onClose={() => setIsRepayModalOpen(false)} debt={debt} />
    </div>
  );
};

const InfoBlock = ({ icon, label, value }) => (
  <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-xl">
    <div className="text-indigo-400 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold text-sm">{value}</p>
    </div>
  </div>
);

const TimelineNode = ({ date, title, note, amount, symbol, isRTL, isInitial = false }) => (
  <div className="relative group">
    <div className={`absolute top-1.5 w-6 h-6 rounded-full border-4 border-zinc-950 shadow-md transition-transform group-hover:scale-125 ${isRTL ? '-right-[51px]' : '-left-[51px]'} ${
      isInitial ? 'bg-white' : 'bg-indigo-500'
    }`} />
    
    <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-800 shadow-xl flex justify-between items-center transition-all hover:border-zinc-700">
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">
          {moment(date).format('MMM DD, YYYY · hh:mm A')}
        </p>
        <h4 className="font-extrabold text-white text-lg tracking-tight">{title}</h4>
        <p className="text-xs text-zinc-500 font-medium mt-1 italic">{note}</p>
      </div>
      <div className={isRTL ? 'text-left' : 'text-right'}>
        <div className={`flex items-center gap-1 font-black text-xl tabular-nums ${isInitial ? 'text-white' : 'text-indigo-400'}`}>
            {!isInitial && <TrendingDown size={18} />}
            {symbol}{parseFloat(amount).toLocaleString()}
        </div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
            {isInitial ? 'Principal' : 'Payment'}
        </p>
      </div>
    </div>
  </div>
);

export default DebtDetailsPage;