import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import AnimatedSpeechInput from "../../components/AnimatedSpeechInput";
import AnimatedSearchSelect from "../../components/AnimatedSearchSelect";

// API Hooks
import { useCreateTransactionMutation } from "../../store/api/transactionApi.js";
import { useGetAccountsQuery } from "../../store/api/accountApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoryApi.js";

const CreateTransactionModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";
  const { user } = useSelector((state) => state.auth);

  // ✅ Expert Fix: Reactive Theme Detection for AnimatedSpeechInput
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDarkMode(document.documentElement.classList.contains("dark")),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const [createTransaction, { isLoading }] = useCreateTransactionMutation();
  const { data: accountsData } = useGetAccountsQuery(user?.id);
  const { data: categoriesData } = useGetCategoriesQuery(user?.id);

  // Validation Schema with Localized Messages
  const transactionSchema = z
    .object({
      type: z.enum(["income", "expense", "transfer"]),
      amount: z.string().min(1, t("validation.amount_required")),
      accountId: z.string().min(1, t("validation.source_required")),
      toAccountId: z.string().optional(),
      categoryId: z.union([z.string(), z.number()]).optional(),
      description: z.string().max(200, t("validation.desc_too_long")),
      transactionDate: z.string().min(1, t("validation.date_required")),
    })
    .refine(
      (data) => {
        if (data.type === "transfer" && !data.toAccountId) return false;
        return true;
      },
      { message: t("validation.dest_required"), path: ["toAccountId"] },
    );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      transactionDate: new Date().toISOString().split("T")[0],
      amount: "",
    },
  });

  const watchType = watch("type");
  const watchAccountId = watch("accountId");
  const watchToAccountId = watch("toAccountId");
  const watchCategoryId = watch("categoryId");

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await createTransaction({ ...data, userId: user.id }).unwrap();
      toast.success(t("transaction_modal.success"));
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[200]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white italic uppercase tracking-tight">
              {t("transaction_modal.title")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Type Toggle */}
            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-1">
              {["expense", "income", "transfer"].map((tType) => (
                <button
                  key={tType}
                  type="button"
                  onClick={() => setValue("type", tType)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    watchType === tType
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  {t(`transaction_modal.types.${tType}`)}
                </button>
              ))}
            </div>

            {/* 2. Amount Input */}
            <AnimatedSpeechInput
              {...register("amount")}
              placeholder={t("transaction_modal.fields.amount_placeholder")}
              type="number"
              step="0.01"
              error={errors.amount?.message}
              min="0"
            />

            {/* 3. Source Account */}
            <AnimatedSearchSelect
              label={
                watchType === "transfer"
                  ? t("transaction_modal.fields.from_account")
                  : t("transaction_modal.fields.account")
              }
              options={accountsData?.data || []}
              value={watchAccountId}
              onSelect={(id) =>
                setValue("accountId", id, { shouldValidate: true })
              }
              error={errors.accountId?.message}
            />

            {/* 4. Conditional: To Account OR Category */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {watchType === "transfer" ? (
                  <motion.div
                    key="transfer"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <AnimatedSearchSelect
                      label={t("transaction_modal.fields.to_account")}
                      options={
                        accountsData?.data?.filter(
                          (a) => a.id !== watchAccountId,
                        ) || []
                      }
                      value={watchToAccountId}
                      onSelect={(id) =>
                        setValue("toAccountId", id, { shouldValidate: true })
                      }
                      error={errors.toAccountId?.message}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <AnimatedSearchSelect
                      label={t("transaction_modal.fields.category")}
                      options={
                        categoriesData?.data?.filter(
                          (c) => c.type === watchType,
                        ) || []
                      }
                      value={watchCategoryId}
                      onSelect={(id) =>
                        setValue("categoryId", id, { shouldValidate: true })
                      }
                      error={errors.categoryId?.message}
                      showIcons={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. Date & Description */}
        <div className="grid grid-cols-2 gap-4 items-end"> {/* ✅ Added items-end to align baselines */}
  {/* 1. Date Field */}
 <div className="relative">
    <AnimatedSpeechInput 
      placeholder="transaction_modal.fields.date"
      type="date" 
      {...register('transactionDate')}
   
      error={errors.transactionDate?.message}
    />
  </div>

  {/* 2. Animated Note Field */}
  <div className="relative"> 
    {/* ✅ Removed mt-1 and the label div, let the component handle its own floating label */}
    <AnimatedSpeechInput 
      placeholder="transaction_modal.fields.note"
      type="text" 
      {...register('description')}
      speakString={t('transaction_modal.fields.note')}
      error={errors.description?.message}
      // ✅ Pass the color prop here too
    
    />
  </div>
</div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-indigo-700 hover:-translate-y-1"
              }`}
            >
              {isLoading
                ? t("transaction_modal.processing")
                : t("transaction_modal.confirm")}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTransactionModal;
