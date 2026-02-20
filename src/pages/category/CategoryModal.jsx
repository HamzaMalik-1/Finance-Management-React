import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../../store/api/categoryApi';
import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS, THEME_COLORS } from '../../constants/categories';

// Validation Schema
const schema = z.object({
  name: z.string().min(2, "category.name_min_error"),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, "category.icon_required"),
  color: z.string().min(1, "category.color_required"),
});

const AddCategoryModal = ({ isOpen, onClose, userId, editData = null }) => {
  const { t } = useTranslation();
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: '', 
      type: 'expense', 
      icon: 'Utensils', 
      color: '#6366f1' 
    }
  });

  // Sync form state when entering Edit mode or Resetting for New entry
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          name: editData.name,
          type: editData.type,
          icon: editData.icon || 'Utensils',
          color: editData.color || '#6366f1'
        });
      } else {
        reset({ name: '', type: 'expense', icon: 'Utensils', color: '#6366f1' });
      }
    }
  }, [editData, isOpen, reset]);

  const watchType = watch('type');
  const watchColor = watch('color');
  const watchIcon = watch('icon');
  const isLoading = isCreating || isUpdating;

  const onSubmit = async (data) => {
    try {
      if (editData) {
        await updateCategory({ id: editData.id, ...data }).unwrap();
      } else {
        await createCategory({ ...data, userId }).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Operation failed:", err);
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
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh] custom-scrollbar"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {editData ? t('category.edit_title') : t('category.new_title')}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Type Toggle */}
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                 {t('category.type')}
               </label>
               <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                {['income', 'expense'].map((type) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setValue('type', type)}
                    className={`flex-1 py-2.5 rounded-xl capitalize font-bold transition-all duration-300 ${
                      watchType === type 
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  > {t(`common.${type}`)} </button>
                ))}
              </div>
            </div>

            {/* 2. Name Input */}
            <AnimatedSpeechInput 
              {...register('name')}
              placeholder="category.name_placeholder"
              value={watch('name')}
              error={errors.name ? t(errors.name.message) : null}
            />

            {/* 3. Icon Selection with Visual Display */}
            <AnimatedSearchSelect 
              label={t('category.select_icon')}
              options={CATEGORY_ICONS}
              value={watchIcon}
              onSelect={(id) => setValue('icon', id)}
              error={errors.icon ? t(errors.icon.message) : null}
              showIcons={true} // ✅ Enables the icon display logic in your component
            />

            {/* 4. Color Picker Grid */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                {t('category.select_color')}
              </label>
              <div className="grid grid-cols-4 gap-3 p-1">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className="h-10 rounded-xl transition-all relative flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color }}
                  >
                    {watchColor === color && (
                      <motion.div layoutId="colorCheck">
                        <Check size={20} className="text-white drop-shadow-md" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
              {errors.color && <p className="text-xs text-red-500 ml-1">{t(errors.color.message)}</p>}
            </div>

            {/* 5. Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  {t('common.processing')}
                </div>
              ) : (
                editData ? t('common.update') : t('category.create_btn')
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCategoryModal;