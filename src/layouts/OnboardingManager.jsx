import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetRegistrationStatusQuery } from '../store/api/userApi';
import OnboardingLayout from './OnboardingLayout';

const OnboardingManager = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data, isLoading } = useGetRegistrationStatusQuery(user?.id, {
    skip: !user?.id,
  });

  useEffect(() => {
    if (!data?.success || isLoading) return;

    const { isUser, isContact, isAddress, isSettings } = data.data;
    // Navigation Logic based on missing data
    if (!isUser && location.pathname !== '/onboarding/profile') {
      navigate('/onboarding/profile');
    } else if (isUser && isAddress && !isContact && location.pathname !== '/onboarding/contact') {
      navigate('/onboarding/contact');
    } else if (isUser  && !isAddress && location.pathname !== '/onboarding/address') {
      navigate('/onboarding/address');
    } else if (isUser && isContact && isAddress && !isSettings && location.pathname !== '/onboarding/settings') {
      navigate('/onboarding/settings');
    } else if (isSettings && location.pathname.includes('/onboarding')) {
      navigate('/main/dashboard'); // All done!
    }
    // // Navigation Logic based on missing data
    // if (!isUser && location.pathname !== '/onboarding/profile') {
    //   navigate('/onboarding/profile');
    // } else if (isUser && !isContact && location.pathname !== '/onboarding/contact') {
    //   navigate('/onboarding/contact');
    // } else if (isUser && isContact && !isAddress && location.pathname !== '/onboarding/address') {
    //   navigate('/onboarding/address');
    // } else if (isUser && isContact && isAddress && !isSettings && location.pathname !== '/onboarding/settings') {
    //   navigate('/onboarding/settings');
    // } else if (isSettings && location.pathname.includes('/onboarding')) {
    //   navigate('/dashboard'); // All done!
    // }
  }, [data, isLoading, location.pathname]);

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return <OnboardingLayout status={data?.data}>{children}</OnboardingLayout>;
};

export default OnboardingManager;