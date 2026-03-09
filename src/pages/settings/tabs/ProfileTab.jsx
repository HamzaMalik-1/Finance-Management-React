import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Camera, Mail, User, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../store/api/userApi';

const ProfileTab = () => {
  const { user: authUser } = useSelector(state => state.auth);
  
  // 🔍 Fetch full profile data from backend
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

  // 🔄 Sync form when database data arrives
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
      toast.success("Profile synchronized!");
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  if (isFetching) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Header / Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-black border-4 border-white dark:border-zinc-900 shadow-xl">
            {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
          </div>
          <button type="button" className="absolute -bottom-1 -right-1 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg hover:scale-110 transition-transform">
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase">Account Identity</h3>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            UID: <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{userData?.id}</span>
          </p>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">First Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input {...register('firstName')} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Last Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input {...register('lastName')} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Recovery Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input {...register('recoveryEmail')} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileTab;