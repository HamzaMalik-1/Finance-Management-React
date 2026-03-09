import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Bell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';

// API Hook Imports
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../store/api/budgetApi.js';
import { useGetCategoriesQuery } from '../../store/api/categoryApi.js';
import { useGetCurrenciesQuery } from '../../store/api/constantApi.js'; 

const budgetSchema = z.object({
  categoryId: z.union([z.string(), z.number()]).refine(val => !!val, "Category is required"),
  amountLimit: z.string().min(1, "Limit amount is required"),
  currencyId: z.union([z.string(), z.number()]).refine(val => !!val, "Currency is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  alertThreshold: z.number().min(1).max(100),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
});

const CreateBudgetModal = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = !!initialData;
  const { user } = useSelector((state) => state.auth);
  
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation();
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation();
  
  const { data: categoriesData } = useGetCategoriesQuery(user?.id);
  const { data: currenciesData } = useGetCurrenciesQuery();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      alertThreshold: 80,
      startDate: new Date().toISOString().split('T')[0],
      currencyId: user?.baseCurrencyId || ''
    }
  });

  // Load data into form when editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          categoryId: initialData.categoryId,
          amountLimit: initialData.amountLimit.toString(),
          currencyId: initialData.currencyId,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          alertThreshold: parseFloat(initialData.alertThreshold),
          period: initialData.period,
        });
      } else {
        reset({
          period: 'monthly',
          alertThreshold: 80,
          startDate: new Date().toISOString().split('T')[0],
          currencyId: user?.baseCurrencyId || ''
        });
      }
    }
  }, [isOpen, initialData, reset, user]);

  const watchThreshold = watch('alertThreshold');
  const watchCategoryId = watch('categoryId');
  const watchCurrencyId = watch('currencyId');

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateBudget({ id: initialData.id, ...data }).unwrap();
        toast.success("Budget updated successfully!");
      } else {
        await createBudget({ ...data, userId: user.id, isActive: true }).unwrap();
        toast.success("Budget guardrail established!");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to process budget");
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
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh] custom-scrollbar"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {isEditMode ? "Edit Budget" : "Set Budget Limit"}
                </h2>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">
                    {isEditMode ? "Adjust your spending boundaries" : "Establish spending boundaries"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <AnimatedSearchSelect 
                label="Category"
                options={categoriesData?.data?.filter(c => c.type === 'expense') || []}
                value={watchCategoryId}
                onSelect={(id) => setValue('categoryId', id, { shouldValidate: true })}
                error={errors.categoryId?.message}
                showIcons={true}
              />
              <AnimatedSearchSelect 
                label="Currency"
                options={currenciesData?.data || []}
                value={watchCurrencyId}
                onSelect={(id) => setValue('currencyId', id, { shouldValidate: true })}
                error={errors.currencyId?.message}
              />
            </div>

            <AnimatedSpeechInput 
              {...register('amountLimit')}
              placeholder="Limit Amount"
              type="number"
              error={errors.amountLimit?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Start Date</label>
                <input type="date" {...register('startDate')} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">End Date</label>
                <input type="date" {...register('endDate')} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200" />
              </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Alert Threshold</span>
                </div>
                <span className="text-sm font-black text-indigo-600">{watchThreshold}%</span>
              </div>
              <input type="range" min="1" max="100" step="5" {...register('alertThreshold', { valueAsNumber: true })} className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <button 
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center"
            >
              {(isCreating || isUpdating) ? "Processing..." : isEditMode ? "Save Changes" : "Confirm Budget"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateBudgetModal;