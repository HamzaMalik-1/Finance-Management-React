import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // ✅ Added
import * as z from 'zod'; // ✅ Added
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAddAccountMutation, useUpdateAccountMutation } from '../../store/api/accountApi';
import { useGetAccountTypeQuery, useGetCurrenciesQuery } from '../../store/api/constantApi'; 
import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';

const CreateAccountModal = ({ isOpen, onClose, editData }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  // ✅ 1. Define Zod Schema
  const accountSchema = z.object({
    name: z.string().min(1, t('val.required')),
    openingBalance: z.union([
      z.string().min(1, t('val.required')), 
      z.number()
    ]).transform((val) => val.toString()),
    accountTypeId: z.union([z.string(), z.number()]).refine(val => val !== '', t('val.required')),
    currencyId: z.union([z.string(), z.number()]).refine(val => val !== '', t('val.required')),
  });

  const { data: accountTypesRes, isLoading: isTypesLoading } = useGetAccountTypeQuery();
  const { data: currenciesRes, isLoading: isCurrenciesLoading } = useGetCurrenciesQuery();
  
  const [addAccount, { isLoading: isCreating }] = useAddAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
  
  // ✅ 2. Initialize Form with Resolver
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      openingBalance: '',
      accountTypeId: '',
      currencyId: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          name: editData.name || '',
          openingBalance: editData.openingBalance?.toString() || '',
          accountTypeId: editData.accountTypeId || editData.accountType?.id || '',
          currencyId: editData.currencyId || editData.currency?.id || ''
        });
      } else {
        reset({ name: '', openingBalance: '', accountTypeId: '', currencyId: '' });
      }
    }
  }, [editData, isOpen, reset]);

  const accountTypes = Array.isArray(accountTypesRes?.data) ? accountTypesRes.data : accountTypesRes?.data?.data || [];
  const currencies = Array.isArray(currenciesRes?.data) ? currenciesRes.data : currenciesRes?.data?.data || [];

  useEffect(() => {
    const handleEvents = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleEvents);
      document.addEventListener('touchstart', handleEvents);
    }
    return () => {
      document.removeEventListener('mousedown', handleEvents);
      document.removeEventListener('touchstart', handleEvents);
    };
  }, [isOpen, onClose]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        openingBalance: parseFloat(data.openingBalance)
      };

      if (editData) {
        await updateAccount({ id: editData.id, ...payload }).unwrap();
      } else {
        await addAccount({ ...payload, userId: user.id }).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save account:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div 
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card-bg w-full max-w-md rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-app-text tracking-tight">
                {editData ? t('accounts.edit_vault') : t('accounts.initialize_new')}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {editData ? t('accounts.edit_desc') : t('accounts.setup_vault_desc')}
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Controller 
                name="name" 
                control={control} 
                render={({ field }) => (
                  <AnimatedSpeechInput 
                    label={t('accounts.label_name')} 
                    placeholder={t('accounts.placeholder_name')} 
                    {...field} 
                    error={errors.name?.message} // ✅ Pass error to avoid collision
                  />
                )}
              />

              <Controller 
                name="accountTypeId" 
                control={control} 
                render={({ field }) => (
                  <AnimatedSearchSelect 
                    label={t('accounts.label_type')}
                    options={accountTypes}
                    isLoading={isTypesLoading}
                    onSelect={(val) => field.onChange(val)}
                    value={field.value}
                    error={errors.accountTypeId?.message} // ✅ Pass error
                  />
                )}
              />

              <Controller 
                name="currencyId" 
                control={control} 
                render={({ field }) => (
                  <AnimatedSearchSelect 
                    label={t('accounts.label_currency')}
                    options={currencies}
                    isLoading={isCurrenciesLoading}
                    onSelect={(val) => field.onChange(val)}
                    value={field.value}
                    error={errors.currencyId?.message} // ✅ Pass error
                  />
                )}
              />

              <Controller 
                name="openingBalance" 
                control={control} 
                render={({ field }) => (
                  <AnimatedSpeechInput 
                    label={t('accounts.label_opening_balance')} 
                    type="number" 
                    placeholder={t('accounts.placeholder_amount')} 
                    {...field} 
                    disabled={!!editData}
                    error={errors.openingBalance?.message} // ✅ Pass error
                  />
                )}
              />

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isCreating || isUpdating}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-4"
              >
                {isCreating || isUpdating ? t('common.saving') : (editData ? t('common.update') : t('accounts.btn_create'))}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;