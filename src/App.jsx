import './App.css'
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout'
import LoginSignup from './pages/LoginSignup'
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* The Login/Signup page is your default root path */}
        <Route path="/" element={<LoginSignup />} />
        
        {/* You will add your Dashboard and other pages here later */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MainLayout>
  )
}

export default App