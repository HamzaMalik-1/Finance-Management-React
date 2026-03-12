import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ReceiptText, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useAddRepaymentMutation } from '../../store/api/debtApi';
import { useGetAccountsQuery } from '../../store/api/accountApi';

const AddRepaymentModal = ({ isOpen, onClose, debt }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';
  const { user } = useSelector((state) => state.auth);
  
  const [addRepayment, { isLoading }] = useAddRepaymentMutation();
  const { data: response } = useGetAccountsQuery(user?.id);

  // ✅ Extract data from the structured backend response
  const accounts = response?.data?.list || [];
  const symbol = response?.data?.globalCurrencySymbol || debt?.currencySymbol || t('common.currency_symbol');
  const remaining = parseFloat(debt?.remainingAmount || 0);

  // ✅ Memoize Schema to handle dynamic localization and max-amount validation
  const schema = useMemo(() => z.object({
    amount: z.string()
      .min(1, t("debts.amount_required"))
      .refine((val) => parseFloat(val) > 0, t('debts.repay.err_greater_zero'))
      .refine((val) => parseFloat(val) <= remaining, {
        message: t('debts.repay.err_exceed_balance', { symbol, max: remaining.toLocaleString() }),
      }),
    accountId: z.union([z.string(), z.number()]).refine(val => !!val, t("debts.account_required")),
    note: z.string().optional(),
  }), [remaining, t, symbol, i18n.language]);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', accountId: '', note: '' }
  });

  const watchAmount = watch('amount');
  const watchAccountId = watch('accountId');

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const handlePayFull = () => {
    setValue('amount', remaining.toString(), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      await addRepayment({
        id: debt.id,
        ...data,
        userId: user.id
      }).unwrap();
      
      toast.success(t('debts.repay.success'));
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || t('common.error_msg'));
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
          dir={isRTL ? "rtl" : "ltr"}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <ReceiptText size={24} />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase leading-none">
                  {t('debts.repay.title')}
                </h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                  {t('debts.repay.subtitle')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Context Info & Quick Action */}
            <div className="px-1 flex justify-between items-end">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-zinc-500 font-medium">
                  {t('debts.repay.paying_to')} <span className="text-zinc-900 dark:text-zinc-200 font-black italic">{debt.contactPerson?.name}</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-black tabular-nums">
                  {t('debts.repay.outstanding')}: {symbol}{remaining.toLocaleString()}
                </p>
              </div>
              <button 
                type="button"
                onClick={handlePayFull}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <Sparkles size={12} /> {t('debts.repay.pay_full')}
              </button>
            </div>

            {/* Amount Input */}
            <AnimatedSpeechInput 
              {...register('amount')}
              placeholder={t('common.amount')}
              type="number"
              value={watchAmount}
              error={errors.amount ? errors.amount.message : null}
            />

            {/* Visual Warning for maxed out payments */}
            {parseFloat(watchAmount) === remaining && (
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-tight flex items-center gap-2"
               >
                 <Sparkles size={14} /> 
                 <span>{t('debts.repay.settle_warning')}</span>
               </motion.div>
            )}

            {/* Account Selector - Now using the correct list */}
            <AnimatedSearchSelect 
              label={t('debts.source_account')}
              options={accounts}
              value={watchAccountId}
              onSelect={(id) => setValue('accountId', id, { shouldValidate: true })}
              error={errors.accountId ? errors.accountId.message : null}
              showIcons={true}
            />

            {/* Note */}
            <AnimatedSpeechInput 
              {...register('note')}
              placeholder={t('common.note_placeholder')}
              value={watch('note')}
            />

            {/* Submit */}
            <button 
              type="submit"
              disabled={isLoading || !!errors.amount}
              className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all ${
                isLoading || !!errors.amount 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-indigo-700 hover:shadow-indigo-500/40'
              }`}
            >
              {isLoading ? t('common.processing') : t('debts.repay.confirm_btn')}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddRepaymentModal;