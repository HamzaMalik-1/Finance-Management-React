import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ArrowRight, Tag, MessageSquare, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';

// API Hooks
import { useCreateTransactionMutation } from '../../store/api/transactionApi.js';
import { useGetAccountsQuery } from '../../store/api/accountApi.js';
import { useGetCategoriesQuery } from '../../store/api/categoryApi.js';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.string().min(1, "Amount is required"),
  accountId: z.string().min(1, "Source account is required"),
  // Conditional validation: toAccountId is required only if type is 'transfer'
  toAccountId: z.string().optional(),
  categoryId: z.union([z.string(), z.number()]).optional(),
  description: z.string().max(200, "Description too long"),
  transactionDate: z.string().min(1, "Date is required"),
}).refine((data) => {
  if (data.type === 'transfer' && !data.toAccountId) return false;
  return true;
}, { message: "Destination account is required for transfers", path: ["toAccountId"] });

const CreateTransactionModal = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();
  
  const { data: accountsData } = useGetAccountsQuery(user?.id);
  const { data: categoriesData } = useGetCategoriesQuery(user?.id);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      transactionDate: new Date().toISOString().split('T')[0],
      amount: '',
    }
  });

  const watchType = watch('type');
  const watchAccountId = watch('accountId');
  const watchToAccountId = watch('toAccountId');
  const watchCategoryId = watch('categoryId');

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await createTransaction({ ...data, userId: user.id }).unwrap();
      toast.success("Transaction recorded!");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record transaction");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase">New Entry</h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-xl transition-colors"><X size={24}/></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* 1. Transaction Type Toggle */}
            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-1">
              {['expense', 'income', 'transfer'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    watchType === t 
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 2. Amount Input */}
            <AnimatedSpeechInput 
              {...register('amount')}
              placeholder="0.00"
              type="number"
              step="0.01"
              error={errors.amount?.message}
            />

            {/* 3. Source Account Selection */}
            <AnimatedSearchSelect 
              label={watchType === 'transfer' ? "From Account" : "Account"}
              options={accountsData?.data || []}
              value={watchAccountId}
              onSelect={(id) => setValue('accountId', id, { shouldValidate: true })}
              error={errors.accountId?.message}
            />

            {/* 4. Conditional Fields (Transfer vs Category) */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {watchType === 'transfer' ? (
                  <motion.div 
                    key="transfer"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  >
                    <AnimatedSearchSelect 
                      label="To Account"
                      options={accountsData?.data?.filter(a => a.id !== watchAccountId) || []}
                      value={watchToAccountId}
                      onSelect={(id) => setValue('toAccountId', id, { shouldValidate: true })}
                      error={errors.toAccountId?.message}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="category"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  >
                    <AnimatedSearchSelect 
                      label="Category"
                      options={categoriesData?.data?.filter(c => c.type === watchType) || []}
                      value={watchCategoryId}
                      onSelect={(id) => setValue('categoryId', id, { shouldValidate: true })}
                      error={errors.categoryId?.message}
                      showIcons={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. Date & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Date</label>
                <input 
                  type="date" 
                  {...register('transactionDate')}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Note</label>
                <input 
                  type="text" 
                  {...register('description')}
                  placeholder="Dinner, Gas, etc."
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Confirm Transaction"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTransactionModal;