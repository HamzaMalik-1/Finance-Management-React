import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAddContactMutation } from "../../store/api/userApi";
import { useForm } from "react-hook-form";
import AnimatedSpeechInput from "../../components/AnimatedSpeechInput";

const ContactStep = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [addContact, { isLoading }] = useAddContactMutation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { phoneNumber: "" }
  });

  const onSubmit = async (data) => {
    await addContact({ userId: user.id, phoneNumber: data.phoneNumber }).unwrap();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">{t('onboarding.phone_title')}</h2>
      <AnimatedSpeechInput 
        placeholder="Phone Number (e.g. +92...)" 
        {...register("phoneNumber")} 
        value={watch().phoneNumber} 
        error={errors.phoneNumber?.message} 
      />
      <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">
        {t('common.continue')}
      </button>
    </form>
  );
};

export default ContactStep