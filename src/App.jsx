import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';

// Direct imports - simpler, no loading states needed
import HomePage from './pages/HomePage';
import DoctorsListing from './pages/DoctorsListing';
import DoctorProfile from './pages/DoctorProfile';
import ChatPage from './pages/ChatPage';
import DefaultChatPage from './pages/DefaultChatPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DoctorOnboarding from './pages/DoctorOnboarding';

import DoctorDashboard from './pages/dashboard/DoctorDashbard';
import LoginPage from './pages/dashboard/LoginPage';
import SignupPage from './pages/dashboard/SignupPage';
import DoctorsAppointment from './pages/dashboard/DoctorsAppointment';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DoctorSchedulePage from './pages/dashboard/DoctorSchedulePage';
import DoctorsProfilePage from './pages/dashboard/DoctorsProfilePage';
import PrescriptionsPage from './pages/dashboard/PrescriptionsPage';

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <Routes>
             <Route path = "/doctor-login" element ={<LoginPage />} />
              <Route path = "/doctor-signup" element ={<SignupPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctors" element={<DoctorsListing />} />

                      <Route element={<DoctorProtectedRoute><DashboardLayout /></DoctorProtectedRoute>}>

              <Route path="/dashboard" element={<DoctorDashboard />} />
             
                 <Route path = "/doctor-appointment" element ={<DoctorsAppointment />} />
                    <Route path = "/doctor-schedule" element ={<DoctorSchedulePage />} />
                        <Route path="/doctors-profile" element={<DoctorsProfilePage />} />
                        <Route path="/prescriptions" element={<PrescriptionsPage />} />

        </Route>


              <Route 
                path="/doctor-profile/:id?" 
                element={
                  <ProtectedRoute>
                    <DoctorProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor-onboarding" 
                element={
                  <ProtectedRoute>
                    <DoctorOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route path="/chat" element={<DefaultChatPage />} />
              <Route path="/private" element={<DefaultChatPage />} />
              <Route path="/private/:thread_id" element={<ChatPage />} />
              <Route path="/chat/:thread_id" element={<ChatPage />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Router>
      </SidebarProvider>
      
    </ThemeProvider>
  );
}

export default App
