import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { setActiveAccount } from '../../store/slices/accountSlice';

const AccountDetails = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = i18n.language === 'ur';
  
  // Get the selected account ID from the slice
  const { activeAccountId } = useSelector((state) => state.account);
  
  // In a real app, you would fetch this using a hook like useGetAccountByIdQuery(activeAccountId)
  const account = { name: "HBL Savings", balance: "45,000", currencySymbol: "Rs." };

  return (
    <div className="space-y-6">
      {/* 1. TOP NAV & ACTIONS */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => dispatch(setActiveAccount(null))}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          <span className="font-bold">{t('common.back_to_vault')}</span>
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-card-bg border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* 2. ACCOUNT HEADER CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest mb-1">{account.name}</p>
          <h2 className="text-4xl font-black">{account.currencySymbol} {account.balance}</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] text-indigo-100 uppercase font-bold mb-1">{t('common.income')}</p>
            <p className="text-lg font-bold text-emerald-300">+Rs. 12,000</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] text-indigo-100 uppercase font-bold mb-1">{t('common.expense')}</p>
            <p className="text-lg font-bold text-red-300">-Rs. 4,500</p>
          </div>
        </div>
      </motion.div>

      {/* 3. TRANSACTION HISTORY (AUDIT LEDGER) */}
      <div className="bg-card-bg rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="font-bold text-lg">{t('common.history')}</h4>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full md:w-64">
            <Search size={16} className="text-zinc-400" />
            <input type="text" placeholder={t('common.search')} className="bg-transparent outline-none text-sm w-full" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">{t('common.date')}</th>
                <th className="px-6 py-4">{t('common.description')}</th>
                <th className="px-6 py-4">{t('common.amount')}</th>
                <th className="px-6 py-4">{t('common.balance_after')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-500">12 Feb, 2026</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">Grocery - Al-Fatah</p>
                    <p className="text-[10px] text-indigo-500 uppercase font-bold">Food & Dining</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-red-500">- Rs. 3,400</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-400">Rs. 41,600</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;