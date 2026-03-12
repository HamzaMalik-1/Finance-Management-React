import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  LayoutGrid,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../../hooks/useRtl';
import { useGetDashboardSummaryQuery } from '../../store/api/dashboardApi';

// Recharts Imports
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

/** ✅ Expert Fix: Dynamic Icon Renderer with Custom Color Support **/
const CategoryIcon = ({ name, color, size = 20 }) => {
  const IconComponent = Icons[name] || HelpCircle;
  // If color exists, use it; otherwise default to white for the dark theme
  return <IconComponent size={size} color={color || '#ffffff'} />;
};

/** ✅ Premium Vault Tooltip **/
const VaultTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">
          {payload[0].payload.date}
        </p>
        <p className="text-white font-black text-lg tabular-nums">
          ${parseFloat(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { isRTL } = useRtl();
  const { user } = useSelector((state) => state.auth);
  
  const { data: response, isLoading } = useGetDashboardSummaryQuery(user?.id);
  const stats = response?.data;

  const income = stats?.cashFlow?.income || 0;
  const expense = stats?.cashFlow?.expense || 0;
  const chartData = stats?.cashFlowHistory || [];

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <header className="flex justify-between items-center px-1">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h2 className="text-3xl font-black text-app tracking-tight italic uppercase">
            {t('dashboard.title')}
          </h2>
          <p className="text-zinc-500 font-medium">
            {t('dashboard.subtitle', { name: user?.firstName })}
          </p>
        </div>
      </header>

      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={t('dashboard.liquidity')} 
          value={stats?.totalBalance} 
          icon={<Wallet size={24} />} 
          variant="primary" 
          isRTL={isRTL}
          currencySymbol={t('common.currency_symbol')}
        />
        <StatCard 
          label={t('dashboard.revenue')} 
          value={income} 
          icon={<TrendingUp size={24} />} 
          variant="black" 
          isRTL={isRTL}
          currencySymbol={t('common.currency_symbol')}
        />
        <StatCard 
          label={t('dashboard.burn')} 
          value={expense} 
          icon={<TrendingDown size={24} />} 
          variant="black" 
          isRTL={isRTL}
          currencySymbol={t('common.currency_symbol')}
        />
      </div>

      {/* 2. Intelligence Chart Section */}
      <div className="bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">
            {t('dashboard.intelligence_chart')}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {t('dashboard.live_stream')}
            </span>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="vaultGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#71717a', fontSize: 10, fontWeight: 900}} 
                dy={10}
              />
              <YAxis hide={true} domain={['auto', 'auto']} />
              <Tooltip content={<VaultTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#vaultGradient)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Recent Activity Feed */}
        <div className="lg:col-span-2 bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">
              {t('dashboard.stream')}
            </h3>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {stats?.recentTransactions?.map((trx) => (
              <div key={trx.id} className="flex justify-between items-center py-5 group cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl group-hover:scale-110 transition-all shadow-inner overflow-hidden">
                    {/* ✅ Passing icon name AND color from the transaction's category */}
                    <CategoryIcon 
                       name={trx.category?.icon} 
                       color={trx.category?.color} 
                    />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="font-bold text-white text-base">
                      {trx.description || trx.category?.name}
                    </p>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter mt-0.5 tabular-nums">
                        {trx.sourceAccount?.name} • {new Date(trx.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={isRTL ? "text-left" : "text-right"}>
                  <p className={`font-black text-xl tracking-tighter tabular-nums ${trx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {trx.type === 'income' ? '+' : '-'}{t('common.currency_symbol')}{parseFloat(trx.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Top Spending Categories (Intensity Map) */}
        <div className="bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-8">
             {t('dashboard.intensity')}
          </h3>
          <div className="space-y-8">
            {stats?.topExpenses?.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    {/* ✅ Passing icon name AND color from the intensity map item */}
                    <CategoryIcon 
                      name={item.icon} 
                      color={item.color} 
                      size={18} 
                    />
                    <span className="font-bold text-sm text-zinc-300">{item.categoryName}</span>
                  </div>
                  <span className="text-xs font-black text-white tabular-nums">
                    {t('common.currency_symbol')}{parseFloat(item.total).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.total / (expense || 1)) * 100}%` }}
                    className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    transition={{ duration: 1.5, ease: "easeOut" }}
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

const StatCard = ({ label, value, icon, variant, isRTL, currencySymbol }) => {
  const styles = {
    primary: "bg-indigo-600 text-white shadow-indigo-500/20",
    black: "bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-white shadow-2xl"
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`${styles[variant]} p-8 rounded-[2.5rem] relative overflow-hidden transition-all shadow-2xl`}
    >
      <div className={`mb-5 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${variant === 'primary' ? 'bg-white/20' : 'bg-zinc-900 border border-zinc-800'}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${variant === 'primary' ? 'text-indigo-100' : 'text-zinc-500'}`}>
        {label}
      </p>
      <div className={`flex items-baseline gap-1 mt-1 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
        <span className={`text-lg font-bold ${variant === 'primary' ? 'text-white/80' : 'text-zinc-400'}`}>
            {currencySymbol}
        </span>
        <h3 className={`text-4xl font-black tracking-tighter tabular-nums text-white`}>
            {parseFloat(value || 0).toLocaleString()}
        </h3>
      </div>
    </motion.div>
  );
};

const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse px-1">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-44 bg-zinc-900 rounded-[2.5rem]" />)}
        </div>
        <div className="h-[350px] bg-zinc-900 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[500px] bg-zinc-900 rounded-[2.5rem]" />
            <div className="h-[500px] bg-zinc-900 rounded-[2.5rem]" />
        </div>
    </div>
);

export default Dashboard;