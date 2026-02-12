import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enRes from './locales/en.json';
import urRes from './locales/ur.json';
import arRes from './locales/ar.json';


const resources = {
  en: { translation: enRes },
  ur: { translation: urRes },
  ar: { translation: arRes },

};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lng') || 'en', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const isRTL = i18n.language === "ur" || i18n.language === "ar";

export default i18n;