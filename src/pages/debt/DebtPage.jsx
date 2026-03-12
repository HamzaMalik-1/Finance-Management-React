import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HandCoins, ArrowUpRight, ArrowDownLeft, Search, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetDebtsQuery, useGetDebtSummaryQuery } from '../../store/api/debtApi';
import DebtCard from './DebtCard';
import AddDebtModal from './AddDebtModal';

const DebtPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';
  const { user } = useSelector((state) => state.auth);
  
  const { data: debts, isLoading } = useGetDebtsQuery(user?.id);
  const { data: response } = useGetDebtSummaryQuery(user?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // ✅ New Filter State
  const [statusFilter, setStatusFilter] = useState("all"); 

  const summaryList = response?.data?.list || [];
  const symbol = response?.data?.currencySymbol || t('common.currency_symbol');

  const totalBorrowed = summaryList.find(s => s.type === 'borrowed')?.totalAmount || 0;
  const totalLent = summaryList.find(s => s.type === 'lent')?.totalAmount || 0;

  // ✅ Updated Filter Logic
  const filteredDebts = debts?.data?.filter(debt => {
    const matchesSearch = 
      debt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.amount.toString().includes(searchTerm) ||
      (debt.contactPerson?.name || "Unknown").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : debt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">
            {t('debts.title')}
          </h2>
          <p className="text-zinc-500 font-medium">
            {t('debts.subtitle')}
          </p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest"
        >
          <Plus size={18} strokeWidth={3} /> {t('debts.new_record')}
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: isRTL ? 20 : -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl"
        >
          <div>
            <p className="text-emerald-500 font-black uppercase text-[10px] tracking-[0.2em] mb-1">
              {t('debts.lent_label')}
            </p>
            <h3 className="text-3xl font-black text-white tabular-nums italic">
              {symbol}{Number(totalLent).toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-zinc-800">
            <ArrowUpRight size={28} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: isRTL ? -20 : 20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl"
        >
          <div>
            <p className="text-rose-500 font-black uppercase text-[10px] tracking-[0.2em] mb-1">
              {t('debts.borrowed_label')}
            </p>
            <h3 className="text-3xl font-black text-white tabular-nums italic">
              {symbol}{Number(totalBorrowed).toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner border border-zinc-800">
            <ArrowDownLeft size={28} />
          </div>
        </motion.div>
      </div>

      {/* Main List Area */}
      <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden min-h-[450px]">
        {/* Toolbar: Search + Status Filter */}
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between bg-zinc-900/50 gap-4">
          
          {/* ✅ Segmented Status Filter */}
          <div className="flex bg-black p-1 rounded-xl border border-zinc-800 w-full md:w-auto">
            {['all', 'active', 'settled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-zinc-800 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {status === 'active' && <Clock size={12} />}
                {status === 'settled' && <CheckCircle2 size={12} />}
                {status}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
            <input 
              type="text" 
              placeholder={t('debts.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-3 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-white placeholder:text-zinc-600 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
            />
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-zinc-800">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">{t('debts.syncing')}</p>
            </div>
          ) : filteredDebts?.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                 <HandCoins size={40} className="text-zinc-700" />
              </div>
              <p className="text-zinc-500 font-bold italic text-sm">{t('debts.empty_state')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-zinc-800">
              <AnimatePresence mode="popLayout">
                {filteredDebts?.map((debt) => (
                  <DebtCard key={debt.id} debt={debt} symbol={symbol} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AddDebtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DebtPage;