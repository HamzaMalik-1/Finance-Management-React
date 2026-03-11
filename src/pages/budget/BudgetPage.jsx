import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useGetBudgetsQuery } from '../../store/api/budgetApi';
import BudgetCard from './BudgetCard';
import CreateBudgetModal from './CreateBudgetModal';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../../hooks/useRtl';

const SkeletonCard = () => (
  <div className="h-52 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-7 flex flex-col justify-end gap-5 shadow-sm animate-pulse relative overflow-hidden">
    <div className="absolute top-7 left-7 right-7 flex justify-between items-start">
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-20 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-24 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="w-40 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  </div>
);

const BudgetPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useRtl();
  const { user } = useSelector((state) => state.auth);
  const { data: response, isLoading } = useGetBudgetsQuery(user?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const budgets = response?.data || [];

  const totalLimit = budgets.reduce((acc, b) => acc + parseFloat(b.amountLimit), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.actualSpent || 0), 0);
  const healthPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null); // ✅ Fixed: Was setSelectedAccount
  };

  return (
    <div className="space-y-8 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Page Header */}
      <header className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold text-app tracking-tight">
            {t('budgets.title')}
          </h2>
          <p className="text-zinc-500 text-sm font-medium">{t('budgets.subtitle')}</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> {t('budgets.add_btn')}
        </motion.button>
      </header>

      {/* 2. Stats Overview */}
      {!isLoading && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              label: t('budgets.stats.health'), 
              value: `${healthPercentage.toFixed(1)}%`, 
              sub: t('budgets.stats.used'), 
              icon: ShieldCheck,
              color: 'text-indigo-600 dark:text-indigo-400'
            },
            { 
              label: t('budgets.stats.allocated'), 
              value: totalLimit.toLocaleString(), 
              sub: t('common.currency_symbol'), 
              icon: TrendingUp,
              color: 'text-indigo-600 dark:text-indigo-400'
            },
            { 
              label: t('budgets.stats.remaining'), 
              value: (totalLimit - totalSpent).toLocaleString(), 
              sub: t('common.currency_symbol'), 
              icon: AlertTriangle,
              color: healthPercentage > 90 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <stat.icon size={18} className={stat.color} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</span>
              </div>
              <div className='flex content-center items-center gap-2'>

              <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
                {stat.value}
                
              </span>
              <span className="text-md font-medium text-zinc-400">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : budgets.length === 0 ? (
          <div className="col-span-full relative overflow-hidden flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.04),transparent)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
              <div className="mb-6 w-20 h-20 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-[2.2rem] flex items-center justify-center">
                <Target size={38} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">{t('budgets.empty_title')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">{t('budgets.empty_desc')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <CreateBudgetModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialData={selectedBudget}
      />
    </div>
  );
};

export default BudgetPage;