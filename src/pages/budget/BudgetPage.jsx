import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, PieChart, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useGetBudgetsQuery } from '../../store/api/budgetApi';
import BudgetCard from './BudgetCard';
import CreateBudgetModal from './CreateBudgetModal';

const BudgetPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: response, isLoading } = useGetBudgetsQuery(user?.id);
  
  // State for Modal and Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const budgets = response?.data || [];

  // Calculate high-level stats for the professional summary
  const totalLimit = budgets.reduce((acc, b) => acc + parseFloat(b.amountLimit), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.actualSpent || 0), 0);
  const healthPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase">
            Financial Guardrails
          </h2>
          <p className="text-zinc-500 font-medium">Set limits to stay within your means</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> Set New Budget
        </button>
      </header>

      {/* 2. Professional Stats Overview */}
      {!isLoading && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2 text-zinc-500">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Health</span>
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {healthPercentage.toFixed(1)}% <span className="text-sm font-medium text-zinc-400">capacity used</span>
            </p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2 text-zinc-500">
              <TrendingUp size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Allocated</span>
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              ${totalLimit.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2 text-zinc-500">
              <AlertTriangle size={18} className={healthPercentage > 90 ? "text-rose-500" : "text-zinc-400"} />
              <span className="text-[10px] font-black uppercase tracking-widest">Remaining Ceiling</span>
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              ${(totalLimit - totalSpent).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* 3. Budget Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[2.5rem]" />
          ))
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
                <Target size={40} className="text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No Budget Guardrails</h3>
            <p className="text-zinc-400 font-medium max-w-xs mx-auto mt-2">
                You haven't set any spending limits yet. Start managing your wealth by setting your first category budget.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {budgets.map((budget) => (
              <BudgetCard 
                key={budget.id} 
                budget={budget} 
                onEdit={handleEdit} 
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* 4. Unified Modal (Handles Create & Edit) */}
      <CreateBudgetModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialData={selectedBudget}
      />
    </div>
  );
};

export default BudgetPage;