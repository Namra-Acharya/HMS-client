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

function App() {
  const { setIsOnline, isAuthenticated } = useHMSStore();

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

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/discharged" element={<DischargedPatients />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/nurses" element={<NurseManagement />} />
          <Route path="/opd" element={<OPDManagement />} />
          <Route path="/ipd" element={<IPDManagement />} />
          <Route path="/icu" element={<ICUManagement />} />
          <Route path="/billing" element={<BillingManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/archives" element={<MonthlyArchives />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
