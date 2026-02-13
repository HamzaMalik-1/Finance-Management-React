import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCreateUserProfileMutation } from '../../store/api/userApi';
import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';

const ProfileStep = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [createProfile, { isLoading }] = useCreateUserProfileMutation();

  const schema = z.object({
    username: z.string().min(3, t('val.username_short')),
    firstName: z.string().min(2, t('val.name_short')),
    lastName: z.string().min(2, t('val.name_short')),
    displayName: z.string().min(2, t('val.name_short')),
    recoveryEmail: z.string().email(t('val.invalid_email')),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: user?.username || "", recoveryEmail: user?.email || "" }
  });

  const values = watch();

  const onSubmit = async (data) => {
    try {
      // We pass the id from our Auth state (Supabase ID)
      await createProfile({ id: user.id, ...data }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatedSpeechInput 
          placeholder="First Name" 
          {...register("firstName")} 
          value={values.firstName} 
          error={errors.firstName?.message} 
        />
        <AnimatedSpeechInput 
          placeholder="Last Name" 
          {...register("lastName")} 
          value={values.lastName} 
          error={errors.lastName?.message} 
        />
      </div>
      <AnimatedSpeechInput 
        placeholder="Display Name" 
        {...register("displayName")} 
        value={values.displayName} 
        error={errors.displayName?.message} 
      />
      <AnimatedSpeechInput 
        placeholder="Recovery Email" 
        {...register("recoveryEmail")} 
        value={values.recoveryEmail} 
        error={errors.recoveryEmail?.message} 
      />
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
      >
        {isLoading ? t('common.saving') : t('common.continue')}
      </button>
    </form>
  );
};

export default ProfileStep