import { useTranslation } from 'react-i18next';

export const useRtl = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ur' || i18n.language === 'ar';
  return { isRTL, dir: isRTL ? 'rtl' : 'ltr' };
};