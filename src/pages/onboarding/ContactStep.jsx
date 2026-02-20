import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useAddContactMutation } from "../../store/api/userApi";
import { useGetCountriesQuery } from "../../store/api/constantApi";
import AnimatedSpeechInput from "../../components/AnimatedSpeechInput";
import { motion } from "framer-motion";

const ContactStep = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  // ✅ Get the country selected by the user in the previous Address step
  const { selectedCountry } = useSelector((state) => state.constant);
  
  // ✅ Fetch country details to get the phoneCode (+92, +1, etc.)
  const { data: countries } = useGetCountriesQuery();
  const countryData = countries?.data?.find(c => c.id === selectedCountry);

  const [addContact, { isLoading }] = useAddContactMutation();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { phoneNumber: "" }
  });

  // ✅ Automatically prepend the phone code when the component loads
  useEffect(() => {
    if (countryData?.phoneCode && !watch("phoneNumber")) {
      setValue("phoneNumber", `${countryData.phoneCode} `);
    }
  }, [countryData, setValue]);

  const onSubmit = async (data) => {
    try {
      await addContact({ 
        userId: user.id, 
        phoneNumber: data.phoneNumber.trim() 
      }).unwrap();
    } catch (err) {
      console.error("Phone update failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-app-text">
          {t('onboarding.phone_title')}
        </h2>
        <p className="text-sm text-zinc-500">
          {countryData ? `${t('onboarding.detected_country')}: ${countryData.name}` : t('onboarding.enter_phone')}
        </p>
      </div>

      <div className="relative">
        <Controller
  name="phoneNumber"
  control={control}
  rules={{ 
    required: t('val.required'),
    pattern: {
      value: /^\+\d{1,4}\s?\d{7,12}$/, // ✅ Ensures it starts with + and follows with digits
      message: t('val.invalid_phone')
    }
  }}
  render={({ field }) => (
    <AnimatedSpeechInput 
      placeholder="onboarding.phone_placeholder" 
      {...field}
      type="tel"
      value={field.value} 
      onChange={(e) => {
        const val = e.target.value;
        // ✅ Allow only '+', numbers, and spaces. Remove everything else.
        const cleaned = val.replace(/[^\d+ ]/g, ""); 
        field.onChange(cleaned);
      }}
      error={errors.phoneNumber?.message}
      speakString={field.value || t('onboarding.phone_placeholder')}
    />
  )}
/>
      </div>

      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
      >
        {isLoading ? "..." : t('common.continue')}
      </motion.button>
    </form>
  );
};

export default ContactStep;