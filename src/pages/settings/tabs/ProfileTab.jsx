import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Camera, Mail, User, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // ✅ Added
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../store/api/userApi';

const ProfileTab = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';
  const { user: authUser } = useSelector(state => state.auth);
  
  const { data: profileResponse, isLoading: isFetching } = useGetProfileQuery(authUser?.id);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const userData = profileResponse?.data;

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      recoveryEmail: '',
    }
  });

  useEffect(() => {
    if (userData) {
      reset({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        displayName: userData.displayName || '',
        recoveryEmail: userData.recoveryEmail || '',
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data) => {
    try {
      await updateProfile({ userId: authUser.id, ...data }).unwrap();
      toast.success(t('profile.success_msg'));
    } catch (error) {
      toast.error(error?.data?.message || t('profile.error_msg'));
    }
  };

  if (isFetching) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header / Avatar */}
      <div className={`flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800 ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-black border-4 border-white dark:border-zinc-900 shadow-xl tabular-nums uppercase">
            {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
          </div>
          <button type="button" className={`absolute -bottom-1 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg hover:scale-110 transition-transform ${isRTL ? '-left-1' : '-right-1'}`}>
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center sm:text-inherit">
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100  uppercase">
            {t('profile.identity_title')}
          </h3>
        
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
            {t('profile.first_name')}
          </label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
            <input 
              {...register('firstName')} 
              className={`w-full py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
            {t('profile.last_name')}
          </label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
            <input 
              {...register('lastName')} 
              className={`w-full py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
            />
          </div>
        </div>

        {/* Recovery Email */}
        <div className="space-y-2 md:col-span-2">
          <label className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
            {t('profile.recovery_email')}
          </label>
          <div className="relative">
            <Mail className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
            <input 
              {...register('recoveryEmail')} 
              className={`w-full py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
            />
          </div>
        </div>
      </div>

      <div className={`flex pt-4 ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <button 
          type="submit" 
          disabled={!isDirty || isUpdating}
          className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
            isDirty && !isUpdating
            ? 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700' 
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isUpdating ? t('profile.saving_btn') : t('profile.save_btn')}
        </button>
      </div>
    </form>
  );
};

export default ProfileTab;