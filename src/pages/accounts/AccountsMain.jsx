import React, { useState, useEffect, useRef } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { Plus, Wallet, CreditCard, Landmark, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetAccountsQuery, useDeleteAccountMutation } from '../../store/api/accountApi';
import CreateAccountModal from './CreateAccountModal';
import ConfirmDialog from '../../components/ConfirmDialog'; // Adjust path accordingly
import { useNavigate } from 'react-router-dom';

const SkeletonCard = () => (
  <div className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between p-6">
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
      <div className="w-4 h-6 rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
    <div className="space-y-3">
      <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="w-40 h-8 rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  </div>
);

const AccountsMain = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: accountsResponse, isLoading } = useGetAccountsQuery(user?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const navigation =useNavigate()
  // ✅ Flattened data extraction from your API
  const accountsData = Array.isArray(accountsResponse?.data) ? accountsResponse.data : [];

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-app-text">The Vault</h2>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg"
        >
          <Plus size={18} /> Add Account
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : accountsData.length > 0 ? (
          accountsData.map((acc) => (
            <AccountCard key={acc.id} account={acc} onEdit={() => handleEdit(acc)} navigation={navigation} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] text-zinc-400">
             No accounts found. Create your first account to start tracking!
          </div>
        )}
      </div>

      <CreateAccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editingAccount} 
      />
    </div>
  );
};

const AccountCard = ({ account, onEdit ,navigation}) => {
  const [deleteAccount] = useDeleteAccountMutation();
  const [showActions, setShowActions] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const actionRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionRef.current && !actionRef.current.contains(e.target)) setShowActions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };


  // Dynamic Icon Selection based on slug
  const getIcon = () => {
    const slug = account.accountType?.slug;
    if (slug === 'credit-card') return <CreditCard size={22} />;
    if (slug === 'bank-account' || slug === 'investment') return <Landmark size={22} />;
    return <Wallet size={22} />;
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className="bg-card-bg p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between h-52 relative overflow-hidden group transition-shadow"
        onClick={()=>navigation(`/main/account-detail/${account?.id}`)}
      >
        {/* Top Section: Icon and Actions */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col gap-3">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
              {getIcon()}
            </div>
            {/* Account Type Badge */}
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-100 rounded-md w-fit">
              {account.accountType?.name}
            </span>
          </div>
          
          <div className="relative" ref={actionRef}>
            <button 
              onClick={() => setShowActions(!showActions)} 
              className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              <MoreVertical size={20}/>
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => { onEdit(account); setShowActions(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={16}/> Edit
                  </button>
                  <button 
                    onClick={() => { setIsConfirmOpen(true); setShowActions(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16}/> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Section: Name and Balance */}
        <div className="z-10">
          <p className="text-zinc-400 text-xs font-bold truncate pr-10">{account.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-indigo-500 font-bold text-lg">
              {account.currency?.symbol || '£'}
            </span>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-700 tracking-tight">
              {parseFloat(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.07] transition-opacity pointer-events-none rotate-12">
          {account.accountType?.slug === 'credit-card' ? <CreditCard size={160} /> : <Landmark size={160} />}
        </div>
      </motion.div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="accounts.delete_title"
        message="accounts.delete_warning"
      />
    </>
  );
};

export default AccountsMain;