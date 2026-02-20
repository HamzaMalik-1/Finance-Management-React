import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  
  // API Queries for master data
  const { data: accountTypesRes, isLoading: isTypesLoading } = useGetAccountTypeQuery();
  const { data: currenciesRes, isLoading: isCurrenciesLoading } = useGetCurrenciesQuery();
  
  // Mutations
  const [addAccount, { isLoading: isCreating }] = useAddAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
  
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      name: '',
      openingBalance: '',
      accountTypeId: '',
      currencyId: ''
    }
  });

  // ✅ POPULATE FORM ON EDIT / CLEAR ON CREATE
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Map the existing account object to form fields
        reset({
          name: editData.name || '',
          openingBalance: editData.openingBalance || '',
          // Extract IDs from nested objects if necessary
          accountTypeId: editData.accountTypeId || editData.accountType?.id || '',
          currencyId: editData.currencyId || editData.currency?.id || ''
        });
      } else {
        // Reset to empty for new account
        reset({ name: '', openingBalance: '', accountTypeId: '', currencyId: '' });
      }
    }
  }, [editData, isOpen, reset]);

  // Safe data extraction from API responses
  const accountTypes = Array.isArray(accountTypesRes?.data) 
    ? accountTypesRes.data 
    : accountTypesRes?.data?.data || [];

  const currencies = Array.isArray(currenciesRes?.data) 
    ? currenciesRes.data 
    : currenciesRes?.data?.data || [];

  // Click-outside logic
  useEffect(() => {
    const handleEvents = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
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
      if (editData) {
        // ✅ UPDATE MODE
        await updateAccount({ 
          id: editData.id, 
          ...data,
          openingBalance: parseFloat(data.openingBalance)
        }).unwrap();
      } else {
        // ✅ CREATE MODE
        await addAccount({ 
          ...data, 
          userId: user.id,
          openingBalance: parseFloat(data.openingBalance) 
        }).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save account:", err);
    }
  };

  console.log("editData",editData)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                rules={{ required: true }}
                render={({ field }) => (
                  <AnimatedSpeechInput label={t('accounts.label_name')} placeholder="e.g. HBL Savings" {...field} value={watch('name')} />
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
                    placeholder="0.00" 
                    {...field} 
                    value={watch('openingBalance')} 
                    disabled={!!editData} // Often opening balance is locked during edit
                  />
                )}
              />

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isCreating || isUpdating}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-4"
              >
                {isCreating || isUpdating 
                  ? t('common.saving') 
                  : (editData ? t('common.update') : t('accounts.btn_create'))
                }
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;