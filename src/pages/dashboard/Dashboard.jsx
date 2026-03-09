import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { useGetDashboardSummaryQuery } from '../../store/api/dashboardApi';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: response, isLoading } = useGetDashboardSummaryQuery(user?.id);
  const stats = response?.data;

  // Extract totals from the cashFlow array returned by your controller
  const income = stats?.cashFlow?.find(c => c.type === 'income')?.total || 0;
  const expense = stats?.cashFlow?.find(c => c.type === 'expense')?.total || 0;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase">Intelligence</h2>
          <p className="text-zinc-500 font-medium">Global financial status for {user?.firstName}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl">
          <LayoutGrid size={20} className="text-zinc-400" />
        </div>
      </header>

      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Liquidity" 
          value={stats?.totalBalance} 
          icon={<Wallet size={24} />} 
          variant="primary" 
        />
        <StatCard 
          label="Monthly Revenue" 
          value={income} 
          icon={<TrendingUp size={24} />} 
          variant="success" 
        />
        <StatCard 
          label="Monthly Burn" 
          value={expense} 
          icon={<TrendingDown size={24} />} 
          variant="danger" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">Recent Stream</h3>
            <button className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
              Full Ledger <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-6">
            {stats?.recentTransactions?.map((trx) => (
              <div key={trx.id} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {trx.category?.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{trx.description || trx.category?.name}</p>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">
                        {trx.sourceAccount?.name} • {new Date(trx.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg tracking-tighter ${trx.type === 'income' ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {trx.type === 'income' ? '+' : '-'}${parseFloat(trx.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Top Spending Categories */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-8">Intensity Map</h3>
          <div className="space-y-8">
            {stats?.topExpenses?.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{item.categoryName}</span>
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">${parseFloat(item.total).toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.total / expense) * 100}%` }}
                    className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, icon, variant }) => {
  const styles = {
    primary: "bg-indigo-600 text-white shadow-indigo-200",
    success: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-500",
    danger: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-rose-500"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${styles[variant]} p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden`}
    >
      <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'primary' ? 'bg-white/20' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${variant === 'primary' ? 'text-indigo-100' : 'text-zinc-400'}`}>
        {label}
      </p>
      <p className={`text-3xl font-black mt-1 tracking-tighter ${variant === 'primary' ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
        ${parseFloat(value || 0).toLocaleString()}
      </p>
    </motion.div>
  );
};

const DashboardSkeleton = () => (
    <div className="space-y-8 p-6 animate-pulse">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem]" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 h-96 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem]" />
            <div className="h-96 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem]" />
        </div>
    </div>
);

export default Dashboard;