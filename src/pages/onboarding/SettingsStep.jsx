import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Landmark } from 'lucide-react';
import { useAddSettingsMutation } from '../../store/api/userApi';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useGetCurrenciesQuery } from '../../store/api/constantApi';
import { useRtl } from '../../hooks/useRtl'; // ✅ Import your RTL hook

const SettingsStep = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useRtl(); // ✅ Use the hook to detect RTL
  const user = useSelector((state) => state.auth.user);
  
  const { data: currencies, isLoading: loadingCurrencies } = useGetCurrenciesQuery();
  const [addSettings, { isLoading: isSubmitting }] = useAddSettingsMutation();

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      baseCurrencyId: 1,
      themePreference: 'system',
      languageId: i18n.language === 'ur' ? 2 : 1,
    }
  });

  const currentTheme = watch('themePreference');

  const onSubmit = async (data) => {
    try {
      await addSettings({ userId: user.id, ...data }).unwrap();
    } catch (err) {
      console.error("Settings failed:", err);
    }
  };

  const themeOptions = [
    { id: 'light', label: t('settings.light'), icon: <Sun size={20} /> },
    { id: 'dark', label: t('settings.dark'), icon: <Moon size={20} /> },
    { id: 'system', label: t('settings.system'), icon: <Monitor size={20} /> },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. HEADER: text-start handles alignment automatically */}
      <div className="space-y-2 text-center md:text-start">
        <h2 className="text-3xl font-bold text-app-text">{t('onboarding.settings_title')}</h2>
        <p className="text-zinc-500">{t('onboarding.settings_subtitle')}</p>
      </div>

      {/* 2. CURRENCY SELECT */}
      <div className="space-y-3">
        {/* flex-row follows 'dir', keeping icon before text automatically */}
        <div className="flex items-center gap-2 text-indigo-500 mb-2">
          <Landmark size={18} />
          <span className="font-semibold text-sm">{t('settings.primary_currency')}</span>
        </div>
        <Controller
          name="baseCurrencyId"
          control={control}
          render={({ field }) => (
            <AnimatedSearchSelect 
              label={t('settings.select_currency')}
              options={currencies?.data || []}
              isLoading={loadingCurrencies}
              value={field.value}
              onSelect={field.onChange}
            />
          )}
        />
      </div>

      {/* 3. THEME SELECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500 mb-2">
          <Sun size={18} />
          <span className="font-semibold text-sm">{t('settings.appearance')}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <motion.button
              key={option.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setValue('themePreference', option.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                currentTheme === option.id 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                : 'border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500'
              }`}
            >
              {option.icon}
              <span className="text-xs mt-2 font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 4. SUBMIT BUTTON */}
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "..." : t('onboarding.complete_setup')}
        </button>
      </div>
    </form>
  );
};

export default SettingsStep;