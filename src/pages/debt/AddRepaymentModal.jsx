import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ReceiptText, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useAddRepaymentMutation } from '../../store/api/debtApi';
import { useGetAccountsQuery } from '../../store/api/accountApi';

const repaymentSchema = z.object({
  amount: z.string().min(1, "debt.amount_required"),
  accountId: z.union([z.string(), z.number()]).refine(val => !!val, "debt.account_required"),
  note: z.string().optional(),
});

const AddRepaymentModal = ({ isOpen, onClose, debt }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  
  const [addRepayment, { isLoading }] = useAddRepaymentMutation();
  const { data: accountsData } = useGetAccountsQuery(user?.id);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { amount: '', accountId: '', note: '' }
  });

  const watchAmount = watch('amount');
  const watchAccountId = watch('accountId');

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await addRepayment({
        debtId: debt.id,
        ...data,
        userId: user.id
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Repayment failed:", err);
    }
  };

  if (!isOpen || !debt) return null;

  const remaining = parseFloat(debt.remainingAmount);
  const isOverpaying = parseFloat(watchAmount) > remaining;

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
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ReceiptText size={24} />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Record Payment
              </h2>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Context Info */}
            <div className="px-1">
              <p className="text-sm text-zinc-500 font-medium">
                Paying to <span className="text-zinc-900 font-bold">{debt.contactPerson?.name}</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-black">
                Max Outstanding: ${remaining.toLocaleString()}
              </p>
            </div>

            {/* Amount Input */}
            <AnimatedSpeechInput 
              {...register('amount')}
              placeholder="common.amount"
              type="number"
              value={watchAmount}
              error={errors.amount ? t(errors.amount.message) : null}
            />

            {/* Overpayment Warning */}
            {isOverpaying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>Note: This amount exceeds the remaining debt.</span>
              </motion.div>
            )}

            {/* Account Selector */}
            <AnimatedSearchSelect 
              label="Source Account"
              options={accountsData?.data || []}
              value={watchAccountId}
              onSelect={(id) => setValue('accountId', id)}
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
              disabled={isLoading}
              className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:-translate-y-1'
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