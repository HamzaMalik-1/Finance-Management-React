import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useGetCountriesQuery, useGetCitiesQuery } from '../../store/api/constantApi';
import { useAddAddressMutation } from '../../store/api/userApi';
import AnimatedSearchSelect from '../../components/AnimatedSearchSelect';
import AnimatedSpeechInput from '../../components/AnimatedSpeechInput';

const AddressStep = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  const { data: countries, isLoading: loadingCountries } = useGetCountriesQuery();
  const { data: cities, isLoading: loadingCities } = useGetCitiesQuery(selectedCountry, {
    skip: !selectedCountry // Only fetch when country is selected
  });
  
  const [addAddress, { isLoading: isSubmitting }] = useAddAddressMutation();
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await addAddress({ 
        userId: user.id, 
        countryId: data.countryId, 
        cityId: data.cityId, 
        address: data.addressLine 
      }).unwrap();
    } catch (err) {
      console.error("Failed to add address:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">{t('onboarding.address_title')}</h2>

      {/* COUNTRY SELECT */}
      <Controller
        name="countryId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AnimatedSearchSelect 
            label={t('onboarding.country')}
            options={countries?.data || []}
            isLoading={loadingCountries}
            value={field.value}
            onSelect={(id) => { 
              field.onChange(id); 
              setSelectedCountry(id);
              setValue('cityId', null); // Reset city when country changes
            }}
            error={errors.countryId && t('val.required')}
          />
        )}
      />

      {/* CITY SELECT */}
      <Controller
        name="cityId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AnimatedSearchSelect 
            label={t('onboarding.city')}
            options={cities?.data || []}
            isLoading={loadingCities}
            disabled={!selectedCountry} // Disable if no country
            value={field.value}
            onSelect={field.onChange}
            error={errors.cityId && t('val.required')}
          />
        )}
      />

      {/* ADDRESS LINE */}
      <Controller
        name="addressLine"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AnimatedSpeechInput 
            placeholder="Address (Street, House No.)"
            {...field}
            // Use text-app-text to support your custom theme.css variables
            className="text-app-text" 
            value={watch('addressLine')}
            error={errors.addressLine?.message}
          />
        )}
      />

      <button 
        type="submit" 
        disabled={isSubmitting || !selectedCountry}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting ? "..." : t('common.continue')}
      </button>
    </form>
  );
};

export default AddressStep;