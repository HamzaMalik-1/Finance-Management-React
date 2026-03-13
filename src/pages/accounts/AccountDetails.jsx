import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Search, TrendingUp, TrendingDown, Wallet, AlertCircle, Calendar, Tag } from 'lucide-react';
import { setActiveAccount } from '../../store/slices/accountSlice';
import { useGetAccountDetailsQuery } from '../../store/api/accountApi';
import moment from 'moment';

const AccountDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = i18n.language === 'ur';

  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading, isError, error } = useGetAccountDetailsQuery(id, {
    skip: !id,
  });

  const account = response?.data;
  const symbol = account?.currency?.symbol || "£";

  const filteredHistory = useMemo(() => {
    if (!account?.history) return [];
    return account.history.filter(tx => {
      const description = tx.description?.toLowerCase() || "";
      const categoryName = tx.category?.name?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return description.includes(query) || categoryName.includes(query);
    });
  }, [account?.history, searchQuery]);

  const handleDownload = () => {
    if (!filteredHistory.length) return;
    const headers = "Timestamp,Activity,Category,Impact Type,Amount\n";
    const rows = filteredHistory.map(tx => 
      `${moment(tx.createdAt).format('YYYY-MM-DD')},"${tx.description || 'N/A'}","${tx.category?.name || 'General'}",${tx.type},${tx.amount}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${account.name || 'Account'}_Statement.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    dispatch(setActiveAccount(null));
    navigate(-1);
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-zinc-500 italic uppercase tracking-widest">Syncing Ledger...</div>;
  
  if (isError || !account) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <AlertCircle size={40} className="text-rose-500 mb-4" />
      <h3 className="text-rose-500 font-black uppercase tracking-widest text-lg">Connection Lost</h3>
      <button onClick={handleBack} className="mt-6 px-8 py-3 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-zinc-700">Return to Vault</button>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition-all group">
          <div className="p-2 sm:p-2.5 bg-indigo-500/10 rounded-xl group-hover:scale-105 transition-transform">
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          </div>
          <span className="font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hidden xs:block">Back to Ledger</span>
        </button>

        <button onClick={handleDownload} className="p-3 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl text-zinc-100 hover:bg-zinc-900 shadow-2xl transition-all active:scale-95">
          <Download size={20} />
        </button>
      </div>

      {/* 2. Main Account Card */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-950 border border-zinc-800 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="relative z-10 text-center lg:text-left w-full lg:w-auto">
          <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 inline-block border border-indigo-500/20">
            {account.accountType?.name || 'Vault Entry'}
          </span>
          <p className="text-zinc-500 text-xs sm:text-sm font-black uppercase tracking-widest mb-1 opacity-60">{account.name}</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tabular-nums italic tracking-tighter leading-none break-words">
            {symbol}{parseFloat(account.balance || 0).toLocaleString()}
          </h2>
        </div>
        
        <div className="flex flex-row gap-3 sm:gap-6 w-full sm:w-auto relative z-10">
          <StatBox label="Revenue" amount={account.stats?.income} color="text-emerald-500" symbol={symbol} />
          <StatBox label="Burn" amount={account.stats?.expense} color="text-rose-500" symbol={symbol} />
        </div>
      </motion.div>

      {/* 3. Transaction History Section */}
      <div className="bg-zinc-950 rounded-[2rem] sm:rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden mt-6 sm:mt-10">
        <div className="p-6 sm:p-8 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/20">
          <h4 className="font-black text-white text-lg sm:text-xl uppercase tracking-tighter italic text-center md:text-left">Audit History</h4>
          <div className="flex items-center gap-3 bg-black/50 px-5 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl border border-zinc-800 w-full md:w-80 lg:w-96 focus-within:border-indigo-500 transition-all shadow-inner">
            <Search size={18} className="text-zinc-600 shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search activity..." className="bg-transparent outline-none text-sm text-white w-full font-medium placeholder:text-zinc-700" />
          </div>
        </div>

        {/* ✅ TABLE: Hidden on Mobile, Shown on MD+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-zinc-700 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Activity</th>
                <th className="px-10 py-6 text-right">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <AnimatePresence mode="popLayout">
                {filteredHistory.length > 0 ? filteredHistory.map((tx) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={tx.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-10 py-6 text-xs font-bold text-zinc-600 tabular-nums">{moment(tx.createdAt).format('DD MMM, YYYY')}</td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-white tracking-tight">{tx.description || 'System Entry'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {tx.category?.color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />}
                        <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest opacity-80">{tx.category?.name || 'General'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className={`flex items-center justify-end gap-1 text-base font-black tabular-nums italic ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{symbol}{parseFloat(tx.amount || 0).toLocaleString()}
                      </div>
                    </td>
                  </motion.tr>
                )) : <NoDataFound />}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ✅ MOBILE CARDS: Shown on small screens, Hidden on MD+ */}
        <div className="md:hidden divide-y divide-zinc-900">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length > 0 ? filteredHistory.map((tx) => (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={tx.id} className="p-6 space-y-4 hover:bg-zinc-900/40 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                      <Calendar size={12} /> {moment(tx.createdAt).format('DD MMM, YYYY')}
                    </div>
                    <p className="text-base font-black text-white leading-tight">{tx.description || 'System Entry'}</p>
                  </div>
                  <div className={`text-lg font-black tabular-nums italic ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{symbol}{parseFloat(tx.amount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-zinc-800 rounded-full">
                      {tx.category?.color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />}
                      <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{tx.category?.name || 'General'}</span>
                   </div>
                   <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">{tx.type}</span>
                </div>
              </motion.div>
            )) : <NoDataFound />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const NoDataFound = () => (
  <div className="p-20 text-center w-full">
    <p className="text-zinc-700 font-black italic uppercase tracking-widest text-[10px]">No matching records found.</p>
  </div>
);

const StatBox = ({ label, amount, color, symbol }) => (
  <div className="bg-black/40 border border-zinc-800 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] flex-1 sm:min-w-[160px] lg:min-w-[180px] shadow-inner backdrop-blur-sm">
    <p className="text-[8px] sm:text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1 sm:mb-3 opacity-60">{label}</p>
    <p className={`text-lg sm:text-2xl font-black italic tabular-nums leading-none ${color}`}>
      {symbol}{parseFloat(amount || 0).toLocaleString()}
    </p>
  </div>
);

export default AccountDetails;