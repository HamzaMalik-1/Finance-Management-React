import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';
import { useUpdateContactMutation } from '../../store/api/contactApi';

const contactSchema = z.object({
  name: z.string().min(2, "common.name_required"),
  phoneNumber: z.string().optional(),
});

const EditContactModal = ({ isOpen, onClose, contact }) => {
  const { t } = useTranslation();
  const [updateContact, { isLoading }] = useUpdateContactMutation();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (contact && isOpen) {
      reset({ name: contact.name, phoneNumber: contact.phoneNumber || '' });
    }
  }, [contact, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await updateContact({ id: contact.id, ...data }).unwrap();
      onClose();
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Edit Contact</h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatedSpeechInput 
              {...register('name')}
              placeholder="Full Name"
              value={watch('name')}
              error={errors.name?.message}
            />
            <AnimatedSpeechInput 
              {...register('phoneNumber')}
              placeholder="Phone Number (Optional)"
              value={watch('phoneNumber')}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg"
            >
              {isLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};