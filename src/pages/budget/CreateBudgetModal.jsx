import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useRtl } from "../../hooks/useRtl";

import AnimatedSpeechInput from "../../components/AnimatedSpeechInput";
import AnimatedSearchSelect from "../../components/AnimatedSearchSelect";

// API Hook Imports
import {
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
} from "../../store/api/budgetApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoryApi.js";
import { useGetCurrenciesQuery } from "../../store/api/constantApi.js";

const CreateBudgetModal = ({ isOpen, onClose, initialData = null }) => {
  const { t } = useTranslation();
  const { isRTL } = useRtl();
  const isEditMode = !!initialData;
  const { user } = useSelector((state) => state.auth);
console.log("initialData",initialData)
  // Helper to format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  // 1. Validation Schema
  const budgetSchema = z
    .object({
      categoryId: z
        .union([z.string(), z.number()])
        .refine((val) => !!val, t("common.required")),
      amountLimit: z.string().min(1, t("common.required")),
      currencyId: z
        .union([z.string(), z.number()])
        .refine((val) => !!val, t("common.required")),
      startDate: z.string().min(1, t("common.required")),
      endDate: z.string().min(1, t("common.required")),
      alertThreshold: z.number().min(1).max(100),
      period: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: t("budgets.modal.error_date_range"), // Ensure this key exists in your translations
      path: ["endDate"],
    });

  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation();
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation();

  const { data: categoriesData } = useGetCategoriesQuery(user?.id);
  const { data: currenciesData } = useGetCurrenciesQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: "monthly",
      alertThreshold: 80,
    },
  });

  // Watchers for reactive UI
  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchThreshold = watch("alertThreshold");
  const watchCategoryId = watch("categoryId");
  const watchCurrencyId = watch("currencyId");

  // 2. Load data and Reset logic
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // ✅ CASE: EDIT MODE - Map database values to form
        reset({
          categoryId: initialData.categoryId,
          amountLimit: initialData.amountLimit?.toString() || "",
          currencyId: initialData.currencyId,
          // Extract just the date part (YYYY-MM-DD) if DB sends full ISO strings
          startDate: initialData.startDate?.split("T")[0],
          endDate: initialData.endDate?.split("T")[0],
          alertThreshold: parseFloat(initialData.alertThreshold) || 80,
          period: initialData.period || "monthly",
        });
      } else {
        // ✅ CASE: CREATE MODE - Default reset
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        reset({
          categoryId: "",
          amountLimit: "",
          period: "monthly",
          alertThreshold: 80,
          startDate: formatDateForInput(today),
          endDate: formatDateForInput(tomorrow),
          currencyId: user?.baseCurrencyId || "",
        });
      }
    }
  }, [isOpen, initialData, reset, user]);

  // 3. Reactive Date Logic: Sync End Date with Start Date
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);

      if (end <= start) {
        const newEnd = new Date(start);
        newEnd.setDate(newEnd.getDate() + 1);
        setValue("endDate", formatDateForInput(newEnd), { shouldValidate: true });
      }
    }
  }, [watchStartDate, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateBudget({ id: initialData.id, ...data }).unwrap();
        toast.success(t("budgets.modal.success_edit"));
      } else {
        await createBudget({
          ...data,
          userId: user.id,
          isActive: true,
        }).unwrap();
        toast.success(t("budgets.modal.success_add"));
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || t("common.error"));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200] overflow-hidden"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-x-hidden custom-scrollbar relative"
        >
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 dark:bg-indigo-500/20 text-white dark:text-indigo-400 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <Target size={24} />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                  {isEditMode
                    ? t("budgets.modal.title_edit")
                    : t("budgets.modal.title_add")}
                </h2>
                <p className="text-xs text-zinc-500 font-bold tracking-wide">
                  {isEditMode
                    ? t("budgets.modal.subtitle_edit")
                    : t("budgets.modal.subtitle_add")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <AnimatedSearchSelect
                label={t("budgets.modal.label_category")}
                options={categoriesData?.data || []}
                value={watchCategoryId}
                onSelect={(id) =>
                  setValue("categoryId", id, { shouldValidate: true })
                }
                error={errors.categoryId?.message}
                showIcons={true}
              />
              <AnimatedSearchSelect
                label={t("budgets.modal.label_currency")}
                options={currenciesData?.data || []}
                value={watchCurrencyId}
                onSelect={(id) =>
                  setValue("currencyId", id, { shouldValidate: true })
                }
                error={errors.currencyId?.message}
              />
            </div>

            <AnimatedSpeechInput
              {...register("amountLimit")}
              placeholder={t("budgets.modal.label_limit")}
              type="number"
              error={errors.amountLimit?.message}
              min={0}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label
                  className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 block ${isRTL ? "mr-1" : "ml-1"}`}
                >
                  {t("budgets.modal.label_start")}
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  min={formatDateForInput(new Date())}
                  className={`w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 tabular-nums ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label
                  className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 block ${isRTL ? "mr-1" : "ml-1"}`}
                >
                  {t("budgets.modal.label_end")}
                </label>
                <input
                  type="date"
                  {...register("endDate")}
                  min={watchStartDate}
                  className={`w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 tabular-nums ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>
            </div>

            {/* Threshold Section */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-amber-500" />
                  <span className="text-sm font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                    {t("budgets.modal.label_threshold")}
                  </span>
                </div>
                <span className="text-base font-black text-indigo-600 tabular-nums">
                  {watchThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="5"
                {...register("alertThreshold", { valueAsNumber: true })}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {isCreating || isUpdating
                ? t("budgets.modal.btn_processing")
                : isEditMode
                ? t("budgets.modal.btn_submit_edit")
                : t("budgets.modal.btn_submit_add")}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateBudgetModal;