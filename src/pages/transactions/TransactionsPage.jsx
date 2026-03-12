import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetTransactionsQuery } from "../../store/api/transactionApi";
import CreateTransactionModal from "./CreateTransactionModal";

const TransactionsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ RTK Query Fetch
  const { data: response, isLoading } = useGetTransactionsQuery({
    userId: user?.id,
  });
  const transactions = response?.data?.list || [];

  if (isLoading) return <TransactionsSkeleton />;

  console.log(transactions);
  return (
    <div className="space-y-8 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-3xl font-black text-app tracking-tight  uppercase">
            {t("transactions.title")}
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            {transactions.length}{" "}
            {t("transactions.table.header_transaction").toLowerCase()}s recorded
          </p>
        </div>

        <div className="flex gap-3">
          {/* <button className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-all border border-transparent dark:border-zinc-700">
            <Filter size={20} />
          </button> */}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
          >
            <Plus size={18} /> {t("transactions.new_entry")}
          </button>
        </div>
      </header>

      {/* --- DATA TABLE --- */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-hidden">
          <table
            className={`w-full border-collapse ${isRTL ? "text-right" : "text-left"}`}
          >
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="px-8 py-5">
                  {t("transactions.table.header_transaction")}
                </th>
                <th className="px-8 py-5">
                  {t("transactions.table.header_account")}
                </th>
                <th className="px-8 py-5">
                  {t("transactions.table.header_status")}
                </th>
                <th
                  className={`px-8 py-5 ${isRTL ? "text-left" : "text-right"}`}
                >
                  {t("transactions.table.header_amount")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              <AnimatePresence>
                {transactions.map((trx, index) => (
                  <motion.tr
                    key={trx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                  >
                    {/* Column 1: Transaction Meta */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                            trx.type === "income"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {trx.type === "income" ? (
                            <ArrowDownLeft size={20} />
                          ) : (
                            <ArrowUpRight size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
                            {trx.description ||
                              t("transactions.table.no_description")}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 mt-1">
                            {new Date(trx.transactionDate).toLocaleDateString(
                              i18n.language,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Account Tag */}
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {trx.Account?.name || "Vault Primary"}
                      </span>
                    </td>

                    {/* Column 3: Status Badge */}
                    <td className="px-8 py-5">
                      <div
                        className={`text-[10px] font-black uppercase flex items-center gap-2 ${
                          trx.status === "completed"
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${trx.status === "completed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
                        />
                        {t(`transactions.table.status_${trx.status}`)}
                      </div>
                    </td>

                    {/* Column 4: Amount */}
                    <td
                      className={`px-8 py-5 font-black text-lg tabular-nums ${isRTL ? "text-left" : "text-right"} ${
                        trx.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {/* 1. Show +/- Sign */}
                      {trx.type === "income" ? "+" : "-"}

                      {/* 2. ✅ Dynamic Currency Symbol from Backend */}
                      <span className="mr-1">
                        {trx.sourceAccount?.currency?.symbol ||
                          t("common.currency_symbol")}
                      </span>

                      {/* 3. Formatted Amount */}
                      {parseFloat(trx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// --- SKELETON LOADER ---
const TransactionsSkeleton = () => (
  <div className="space-y-8 animate-pulse px-1">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg" />
      </div>
      <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
    </div>
    <div className="h-[60vh] bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem]" />
  </div>
);

export default TransactionsPage;
