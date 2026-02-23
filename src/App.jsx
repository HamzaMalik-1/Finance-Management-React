import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "./layouts/MainLayout";
import LoginSignup from "./pages/LoginSignup";
import Dashboard from "./pages/Dashboard";

// Onboarding Components
import OnboardingManager from "./layouts/OnboardingManager";
import ProfileStep from "./pages/onboarding/ProfileStep";
import ContactStep from "./pages/onboarding/ContactStep";
import AddressStep from "./pages/onboarding/AddressStep";
import SettingsStep from "./pages/onboarding/SettingsStep";
import DashboardLayout from "./layouts/DashboardLayout";
import AccountsMain from "./pages/accounts/AccountsMain";
import AccountDetails from "./pages/accounts/AccountDetails";
import CategoryPage from "./pages/category/CategoryPage";
import DebtPage from "./pages/debt/DebtPage";
import DebtDetailsPage from "./pages/debt/DebtDetailsPage";

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
        <Route
          path="/onboarding/*"
          element={
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
          }
        />

        {/* MAIN APPLICATION ROUTES */}
  
<Route 
  path="/main/*" 
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          {/* ✅ ONLY the matching component will render as {children} */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="account" element={<AccountsMain />} />
          <Route path="account-detail/:id" element={<AccountDetails />} />
          <Route path="categories" element={<CategoryPage />} />
          

          {/* Dept Page */}
          <Route path="debts" element={<DebtPage/>}/>
          <Route path="debts/:id" element={<DebtDetailsPage />} />
          {/* ✅ Redirect root /main to dashboard */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
          
          {/* ✅ Catch-all for other dashboard routes */}
          <Route path="*" element={<div className="p-10 text-center">Page Under Construction</div>} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  } 
/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
