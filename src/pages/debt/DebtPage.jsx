import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, HandCoins, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { useGetDebtsQuery, useGetDebtSummaryQuery } from '../../store/api/debtApi';
import DebtCard from './components/DebtCard';
import AddDebtModal from './components/AddDebtModal';

const DebtPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: debts, isLoading } = useGetDebtsQuery(user?.id);
  const { data: summary } = useGetDebtSummaryQuery(user?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract totals from summary array [{type: 'borrowed', totalAmount: 500}, ...]
  const totalBorrowed = summary?.data?.find(s => s.type === 'borrowed')?.totalAmount || 0;
  const totalLent = summary?.data?.find(s => s.type === 'lent')?.totalAmount || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Debt Ledger</h2>
          <p className="text-zinc-500 font-medium">Track your personal IOUs and loans</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200"
        >
          <Plus size={20} strokeWidth={3} /> New Record
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between"
        >
          <div>
            <p className="text-emerald-700 font-black uppercase text-xs tracking-widest mb-1 text-emerald-600/70">I Lent (Receivable)</p>
            <h3 className="text-3xl font-black text-emerald-900">${parseFloat(totalLent).toLocaleString()}</h3>
          </div>
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
            <ArrowUpRight size={32} />
          </div>
        </motion.div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between"
        >
          <div>
            <p className="text-rose-700 font-black uppercase text-xs tracking-widest mb-1 text-rose-600/70">I Borrowed (Payable)</p>
            <h3 className="text-3xl font-black text-rose-900">${parseFloat(totalBorrowed).toLocaleString()}</h3>
          </div>
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
            <ArrowDownLeft size={32} />
          </div>
        </motion.div>
      </div>

      {/* Main List Area */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search by name or amount..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>
          <button className="ml-4 p-2.5 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {isLoading ? (
            <div className="p-20 text-center text-zinc-400 animate-pulse font-medium">Synchronizing Ledger...</div>
          ) : debts?.data?.length === 0 ? (
            <div className="p-20 text-center">
              <HandCoins size={48} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-zinc-400 font-medium">No active debts found</p>
            </div>
          ) : (
            debts?.data?.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <AddDebtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DebtPage;