import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Filter, Download, Plus, ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';
import { useGetTransactionsQuery } from '../../store/api/transactionApi';
import CreateTransactionModal from './CreateTransactionModal';

const TransactionsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading } = useGetTransactionsQuery({ userId: user?.id });

  const transactions = response?.data?.list || [];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase">Ledger</h2>
        <div className="flex gap-3">
          <button className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-transform">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} /> New Entry
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {transactions.map((trx) => (
                <motion.tr 
                  key={trx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        trx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {trx.type === 'income' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">{trx.description || 'No description'}</p>
                        <p className="text-[10px] font-medium text-zinc-400">{new Date(trx.transactionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                      {trx.Account?.name || 'Primary'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${
                      trx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${trx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {trx.status}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${
                    trx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {trx.type === 'income' ? '+' : '-'}${parseFloat(trx.amount).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TransactionsPage;