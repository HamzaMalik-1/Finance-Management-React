import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import AnimatedSpeechInput from "../../components/AnimatedSpeechInput";
import AnimatedSearchSelect from "../../components/AnimatedSearchSelect";
import { useCreateDebtMutation } from "../../store/api/debtApi";
import { useGetContactsQuery } from "../../store/api/contactApi";
import { useGetAccountsQuery } from "../../store/api/accountApi";

const debtSchema = z.object({
  amount: z.string().min(1, "debts.amount_required"),
  type: z.enum(["lent", "borrowed"]),
  accountId: z
    .union([z.string(), z.number()])
    .refine((val) => !!val, "debts.account_required"),
  contactId: z.any().optional(),
  contactName: z.string().optional(),
  contactEmail: z
    .string()
    .email("val.invalid_email")
    .optional()
    .or(z.literal("")),
  note: z.string().optional(),
});

const AddDebtModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";
  const { user } = useSelector((state) => state.auth);

  const [createDebt, { isLoading: isCreating }] = useCreateDebtMutation();
  const { data: contactsData } = useGetContactsQuery(user?.id);
  const { data: accountsData } = useGetAccountsQuery(user?.id);

  const [isNewContact, setIsNewContact] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      type: "lent",
      amount: "",
      contactId: "",
      contactName: "",
      contactEmail: "",
      note: "",
    },
  });

  const watchType = watch("type");
  const watchContactId = watch("contactId");
  const watchAccountId = watch("accountId");

  useEffect(() => {
    if (isOpen) {
      reset();
      setIsNewContact(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        userId: user?.id,
        contactName: isNewContact ? data.contactName : null,
        contactEmail: isNewContact ? data.contactEmail : null,
        contactId: isNewContact ? null : data.contactId,
      };
      await createDebt(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to save debt:", err);
    }
  };

  if (!isOpen) return null;

  console.log(accountsData)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          dir={isRTL ? "rtl" : "ltr"}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[95vh] no-scrollbar"
        >
          {/* Header - Compacted */}
          <div className="flex justify-between items-center mb-4">
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase leading-tight">
                {t("debts.new_record")}
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                {t("debts.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Transaction Type Selector */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              {["lent", "borrowed"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("type", type)}
                  className={`flex-1 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all ${
                    watchType === type
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  {type === "lent" ? t("debts.i_lent") : t("debts.i_borrowed")}
                </button>
              ))}
            </div>

            {/* 2. Amount & Account Grid - Side by Side to save space */}
            <div className="grid grid-cols-2 gap-4">
              <div style={{ position: "relative", top: "18px" }}>
                {" "}
                {/* Fixed typo and adjusted value */}
                <AnimatedSpeechInput
                  {...register("amount")}
                  placeholder={t("common.amount") || "Amount"}
                  type="number"
                  value={watch("amount")}
                  error={errors.amount ? t(errors.amount.message) : null}
                />
              </div>
              <AnimatedSearchSelect
                label={t("debts.source_account")}
                options={accountsData?.data || []}
                value={watchAccountId}
                onSelect={(id) => setValue("accountId", id)}
                error={errors.accountId ? t(errors.accountId.message) : null}
                showIcons={false} // Hidden icons to save vertical space
              />
            </div>

            {/* 3. Contact Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  {t("debts.person")}
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewContact(!isNewContact)}
                  className="text-[9px] font-black uppercase tracking-tight text-indigo-600 flex items-center gap-1"
                >
                  <UserPlus size={12} />
                  {isNewContact
                    ? t("debts.select_existing")
                    : t("debts.add_new_person")}
                </button>
              </div>

              {isNewContact ? (
                <div className="grid grid-cols-2 gap-3 mt-7">
                  <AnimatedSpeechInput
                    {...register("contactName")}
                    placeholder={t("debts.person_name_placeholder")}
                    value={watch("contactName")}
                    error={
                      errors.contactName ? t(errors.contactName.message) : null
                    }
                  />
                  <AnimatedSpeechInput
                    {...register("contactEmail")}
                    placeholder={t("debts.person_email_placeholder")}
                    value={watch("contactEmail")}
                    error={
                      errors.contactEmail
                        ? t(errors.contactEmail.message)
                        : null
                    }
                  />
                </div>
              ) : (
                <AnimatedSearchSelect
                  label=""
                  options={contactsData?.data || []}
                  value={watchContactId}
                  onSelect={(id) => setValue("contactId", id)}
                  error={errors.contactId ? t(errors.contactId.message) : null}
                  showIcons={false}
                />
              )}
            </div>

            {/* 4. Note Input */}
            <AnimatedSpeechInput
              {...register("note")}
              placeholder={t("common.note_placeholder") || "Note..."}
              value={watch("note")}
            />

            {/* 5. Info Box - Compacted */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl flex gap-2 border border-indigo-100 dark:border-indigo-800/30">
              <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <p
                className={`text-[10px] text-indigo-700 dark:text-indigo-300 leading-snug font-medium ${isRTL ? "text-right" : "text-left"}`}
              >
                {watchType === "lent"
                  ? t("debts.lent_info_tip")
                  : t("debts.borrowed_info_tip")}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating}
              className={`w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.15em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all ${
                isCreating
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-indigo-700"
              }`}
            >
              {isCreating ? t("common.processing") : t("debts.save_record")}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDebtModal;
