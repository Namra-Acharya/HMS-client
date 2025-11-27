import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useHMSStore from './store/hmsStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientManagement from './pages/PatientManagement';
import DischargedPatients from './pages/DischargedPatients';
import DoctorManagement from './pages/DoctorManagement';
import NurseManagement from './pages/NurseManagement';
import OPDManagement from './pages/OPDManagement';
import IPDManagement from './pages/IPDManagement';
import ICUManagement from './pages/ICUManagement';
import BillingManagement from './pages/BillingManagement';
import Reports from './pages/Reports';
import MonthlyArchives from './pages/MonthlyArchives';
import AboutUs from './pages/AboutUs';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useHMSStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { setIsOnline } = useHMSStore();

  useEffect(() => {
    // Redirect to home on any page refresh
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientManagement />
            </ProtectedRoute>
          } />
          <Route path="/discharged" element={
            <ProtectedRoute>
              <DischargedPatients />
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute>
              <DoctorManagement />
            </ProtectedRoute>
          } />
          <Route path="/nurses" element={
            <ProtectedRoute>
              <NurseManagement />
            </ProtectedRoute>
          } />
          <Route path="/opd" element={
            <ProtectedRoute>
              <OPDManagement />
            </ProtectedRoute>
          } />
          <Route path="/ipd" element={
            <ProtectedRoute>
              <IPDManagement />
            </ProtectedRoute>
          } />
          <Route path="/icu" element={
            <ProtectedRoute>
              <ICUManagement />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <BillingManagement />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/archives" element={
            <ProtectedRoute>
              <MonthlyArchives />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
