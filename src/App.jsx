import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import LoginSignup from './pages/LoginSignup';
import Dashboard from './pages/Dashboard';

// Onboarding Components
import OnboardingManager from './layouts/OnboardingManager';
import ProfileStep from './pages/onboarding/ProfileStep';
import ContactStep from './pages/onboarding/ContactStep';
import AddressStep from './pages/onboarding/AddressStep';
import SettingsStep from './pages/onboarding/SettingsStep';

// 🔒 Simple Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<LoginSignup />} />

        {/* PROTECTED ONBOARDING ROUTES */}
        {/* The OnboardingManager handles the internal logic for which step to show */}
        <Route path="/onboarding/*" element={
          <ProtectedRoute>
            <OnboardingManager>
              <Routes>
                <Route path="profile" element={<ProfileStep />} />
                <Route path="contact" element={<ContactStep />} />
                <Route path="address" element={<AddressStep />} />
                <Route path="settings" element={<SettingsStep />} />
              </Routes>
            </OnboardingManager>
          </ProtectedRoute>
        } />

        {/* MAIN APPLICATION ROUTES */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

export default App;