import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useCreateDebtMutation } from '../../store/api/debtApi';
import { useGetContactsQuery } from '../../store/api/contactApi'; // Adjust path
import { useGetAccountsQuery } from '../../store/api/accountApi'; // Adjust path

const debtSchema = z.object({
  amount: z.string().min(1, "debt.amount_required"),
  type: z.enum(['lent', 'borrowed']),
  accountId: z.union([z.string(), z.number()]).refine(val => !!val, "debt.account_required"),
  contactId: z.any().optional(),
  contactName: z.string().optional(),
  note: z.string().optional(),
});

const AddDebtModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  
  // API Hooks
  const [createDebt, { isLoading: isCreating }] = useCreateDebtMutation();
  const { data: contactsData } = useGetContactsQuery(user?.id);
  const { data: accountsData } = useGetAccountsQuery(user?.id);

  const [isNewContact, setIsNewContact] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: { type: 'lent', amount: '', contactId: '', contactName: '', note: '' }
  });

  const watchType = watch('type');
  const watchContactId = watch('contactId');
  const watchAccountId = watch('accountId');

  // Reset form on close/open
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
        // If not new contact, ensure contactName is null to use contactId
        contactName: isNewContact ? data.contactName : null,
        contactId: isNewContact ? null : data.contactId,
      };
      await createDebt(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to save debt:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[95vh] custom-scrollbar"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t('debt.new_record')}
              </h2>
              <p className="text-sm text-zinc-500">{t('debt.subtitle')}</p>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Transaction Type Selector */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              {['lent', 'borrowed'].map((type) => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => setValue('type', type)}
                  className={`flex-1 py-3 rounded-xl capitalize font-bold transition-all ${
                    watchType === type 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-zinc-500'
                  }`}
                > 
                  {type === 'lent' ? t('debt.i_lent') : t('debt.i_borrowed')} 
                </button>
              ))}
            </div>

            {/* 2. Amount Input (Speech Enabled) */}
            <AnimatedSpeechInput 
              {...register('amount')}
              placeholder="common.amount"
              type="number"
              value={watch('amount')}
              error={errors.amount ? t(errors.amount.message) : null}
            />

            {/* 3. Account Selector */}
            <AnimatedSearchSelect 
              label={t('debt.source_account')}
              options={accountsData?.data || []}
              value={watchAccountId}
              onSelect={(id) => setValue('accountId', id)}
              error={errors.accountId ? t(errors.accountId.message) : null}
              showIcons={true}
            />

            {/* 4. Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {t('debt.person')}
                </label>
                <button 
                  type="button"
                  onClick={() => setIsNewContact(!isNewContact)}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <UserPlus size={14} />
                  {isNewContact ? t('debt.select_existing') : t('debt.add_new_person')}
                </button>
              </div>

              {isNewContact ? (
                <AnimatedSpeechInput 
                  {...register('contactName')}
                  placeholder="debt.person_name_placeholder"
                  value={watch('contactName')}
                  error={errors.contactName ? t(errors.contactName.message) : null}
                />
              ) : (
                <AnimatedSearchSelect 
                  label=""
                  options={contactsData?.data || []}
                  value={watchContactId}
                  onSelect={(id) => setValue('contactId', id)}
                  error={errors.contactId ? t(errors.contactId.message) : null}
                  showIcons={false}
                />
              )}
            </div>

            {/* 5. Note Input */}
            <AnimatedSpeechInput 
              {...register('note')}
              placeholder="common.note_optional"
              value={watch('note')}
            />

            {/* 6. Info Box */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3 border border-indigo-100 dark:border-indigo-800">
              <Info size={20} className="text-indigo-500 shrink-0" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {watchType === 'lent' 
                  ? t('debt.lent_info_tip') 
                  : t('debt.borrowed_info_tip')}
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isCreating}
              className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${
                isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              {isCreating ? t('common.processing') : t('debt.save_record')}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDebtModal;