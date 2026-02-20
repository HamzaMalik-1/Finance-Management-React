import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data representing your transactions schema
const cashFlowData = [
  { name: 'Week 1', income: 4000, expense: 2400 },
  { name: 'Week 2', income: 3000, expense: 1398 },
  { name: 'Week 3', income: 2000, expense: 9800 },
  { name: 'Week 4', income: 2780, expense: 3908 },
];

const Dashboard = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* 1. TOP WIDGETS: SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <motion.div variants={itemVariants} className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-medium mb-1">{t('dashboard.total_balance')}</p>
            <h3 className="text-3xl font-bold">Rs. 145,000</h3>
            <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-full">
              <TrendingUp size={14} /> +12.5% {t('dashboard.since_last_month')}
            </div>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
        </motion.div>

        {/* Monthly Income Widget */}
        <motion.div variants={itemVariants} className="bg-card-bg p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp /></div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.monthly_income')}</p>
              <h4 className="text-xl font-bold">Rs. 85,000</h4>
            </div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[75%]" />
          </div>
        </motion.div>

        {/* Monthly Expense Widget */}
        <motion.div variants={itemVariants} className="bg-card-bg p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><TrendingDown /></div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.monthly_expense')}</p>
              <h4 className="text-xl font-bold">Rs. 42,000</h4>
            </div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[45%]" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. CASH FLOW CHART (Income vs Expense) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card-bg p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg">{t('dashboard.cash_flow')}</h4>
            <div className="flex gap-4 text-xs font-bold uppercase">
              <span className="flex items-center gap-1 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"/> {t('common.income')}</span>
              <span className="flex items-center gap-1 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"/> {t('common.expense')}</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. QUICK ACTIONS & RECENT TRANSACTIONS */}
        <motion.div variants={itemVariants} className="bg-card-bg p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <h4 className="font-bold text-lg mb-6">{t('dashboard.quick_actions')}</h4>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold transition-transform active:scale-95">
              <span>{t('actions.add_transaction')}</span>
              <Plus size={20} />
            </button>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-500 uppercase mb-4">{t('dashboard.recent_activity')}</p>
              {/* This mimics your Transactions schema */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">🍔</div>
                    <div>
                      <p className="text-sm font-bold">Lunch - KFC</p>
                      <p className="text-[10px] text-zinc-500 uppercase">HBL Account</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-500">- Rs. 1,200</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;