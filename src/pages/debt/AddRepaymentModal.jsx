import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ReceiptText, AlertCircle, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast'; // Assuming you use toast for feedback

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useAddRepaymentMutation } from '../../store/api/debtApi';
import { useGetAccountsQuery } from '../../store/api/accountApi';

// Dynamic Schema to handle Overpayment Validation
const createRepaymentSchema = (maxAmount) => z.object({
  amount: z.string()
    .min(1, "debt.amount_required")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
    .refine((val) => parseFloat(val) <= maxAmount, {
      message: `Amount cannot exceed the remaining balance of $${maxAmount}`,
    }),
  accountId: z.union([z.string(), z.number()]).refine(val => !!val, "debt.account_required"),
  note: z.string().optional(),
});

const AddRepaymentModal = ({ isOpen, onClose, debt }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  
  const [addRepayment, { isLoading }] = useAddRepaymentMutation();
  const { data: accountsData } = useGetAccountsQuery(user?.id);

  // Parse current remaining balance
  const remaining = parseFloat(debt?.remainingAmount || 0);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(createRepaymentSchema(remaining)),
    defaultValues: { amount: '', accountId: '', note: '' }
  });

  const watchAmount = watch('amount');
  const watchAccountId = watch('accountId');

  // Sync form reset on open/close
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  // UI Helper: Quick settle button
  const handlePayFull = () => {
    setValue('amount', remaining.toString(), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      await addRepayment({
        id: debt.id, // Passing ID separately for the URL param
        ...data,
        userId: user.id
      }).unwrap();
      
      toast.success(t('debt.repayment_success') || "Payment Recorded!");
      onClose();
    } catch (err) {
      console.error("Repayment failed:", err);
      toast.error(err?.data?.message || "Failed to process payment");
    }
  };

  if (!isOpen || !debt) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <ReceiptText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Record Payment
                </h2>
                <p className="text-xs text-zinc-500 font-medium italic">Reducing debt balance</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Context Info & Quick Action */}
            <div className="px-1 flex justify-between items-end">
              <div>
                <p className="text-sm text-zinc-500 font-medium">
                  Paying to <span className="text-zinc-900 dark:text-zinc-200 font-bold">{debt.contactPerson?.name}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-black">
                  Outstanding: ${remaining.toLocaleString()}
                </p>
              </div>
              <button 
                type="button"
                onClick={handlePayFull}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <Sparkles size={12} /> Pay Full
              </button>
            </div>

            {/* Amount Input */}
            <AnimatedSpeechInput 
              {...register('amount')}
              placeholder="common.amount"
              type="number"
              value={watchAmount}
              error={errors.amount ? errors.amount.message : null}
            />

            {/* Visual Warning for maxed out payments */}
            {parseFloat(watchAmount) === remaining && (
               <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2"
               >
                 <Sparkles size={14} /> 
                 <span>This payment will fully settle the debt!</span>
               </motion.div>
            )}

            {/* Account Selector */}
            <AnimatedSearchSelect 
              label="Source Account"
              options={accountsData?.data || []}
              value={watchAccountId}
              onSelect={(id) => setValue('accountId', id, { shouldValidate: true })}
              error={errors.accountId ? t(errors.accountId.message) : null}
              showIcons={true}
            />

            {/* Note */}
            <AnimatedSpeechInput 
              {...register('note')}
              placeholder="common.note_optional"
              value={watch('note')}
            />

            {/* Submit */}
            <button 
              type="submit"
              disabled={isLoading || !!errors.amount}
              className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${
                isLoading || !!errors.amount 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              {isLoading ? t('common.processing') : "Confirm Payment"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddRepaymentModal;