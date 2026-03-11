import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Wallet,
  CreditCard,
  Landmark,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  useGetAccountsQuery,
  useDeleteAccountMutation,
} from "../../store/api/accountApi";
import CreateAccountModal from "./CreateAccountModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { useRtl } from "../../hooks/useRtl";

// ... SkeletonCard stays same ...

const AccountsMain = () => {
  const { t } = useTranslation();
  const { isRTL } = useRtl();
  const { user } = useSelector((state) => state.auth);
  const { data: accountsResponse, isLoading } = useGetAccountsQuery(user?.id);
  const [deleteAccount] = useDeleteAccountMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate();
  const accountsData = Array.isArray(accountsResponse?.data)
    ? accountsResponse.data
    : [];

  const handleEdit = (e, account) => {
    e.stopPropagation();
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (e, account) => {
    e.stopPropagation();
    setSelectedAccount(account);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id).unwrap();
      setIsConfirmOpen(false);
      setSelectedAccount(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-app-text">
          {t("accounts.title")}
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus size={18} /> {t("accounts.add_btn")}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : accountsData.length > 0 ? (
          accountsData.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onEdit={(e) => handleEdit(e, acc)}
              onDelete={(e) => openDeleteDialog(e, acc)}
              navigate={navigate}
              isRTL={isRTL}
            />
          ))
        ) : (
          <div className="col-span-full py-20 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-center">
            <h3 className="text-zinc-500">{t("accounts.no_accounts")}</h3>
          </div>
        )}
      </div>

      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={selectedAccount}
      />

      {/* ✅ FIX: ConfirmDialog is outside the mapping. 
          If navigation still triggers, your ConfirmDialog component might need 
          to use e.stopPropagation() inside its own button onClick handlers. */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t("accounts.delete_title")}
        message={t("accounts.delete_warning")}
      />
    </div>
  );
};

const AccountCard = ({ account, onEdit, onDelete, navigate, isRTL }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionRef.current && !actionRef.current.contains(e.target))
        setShowActions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = () => {
    const slug = account.accountType?.slug;
    if (slug === "credit-card") return <CreditCard size={22} />;
    if (slug === "bank-account" || slug === "investment")
      return <Landmark size={22} />;
    return <Wallet size={22} />;
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative h-52 flex flex-col justify-end gap-5 p-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer overflow-hidden"
      // ✅ FIX: Use a check to see if we are clicking a button/menu
      onClick={(e) => {
        // If the click is on the menu or a button, don't navigate
        if (e.target.closest("button") || e.target.closest(".menu-container"))
          return;
        navigate(`/main/account-detail/${account?.id}`);
      }}
    >
      <div className="flex justify-between items-start z-10 absolute top-7 left-7 right-7">
        <div className="flex gap-3 items-center">
          <span className="p-3 bg-indigo-600 dark:bg-indigo-500/20 text-white dark:text-indigo-400 rounded-2xl w-fit">
            {getIcon()}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg">
            {account.accountType?.name}
          </span>
        </div>

        <div className="relative menu-container" ref={actionRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-2 text-zinc-400 hover:text-indigo-600 rounded-xl transition-all"
          >
            <MoreVertical size={22} />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden`}
              >
                <button
                  onClick={(e) => {
                    setShowActions(false);
                    onEdit(e);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-500 
                   hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={(e) => {
                    setShowActions(false);
                    onDelete(e);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 
                   hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Trash2 size={16} /> {t("common.delete")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="z-10 pointer-events-none">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold truncate mb-1">
          {account.name}
        </p>
        <div
          className={`flex items-baseline gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            {account.currency?.symbol || "£"}
          </span>
          <h3 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter">
            {parseFloat(account.balance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountsMain;
