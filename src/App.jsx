import React, { useEffect, useState } from 'react';
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl">🏥</span>
          </div>
          <p className="text-white text-base sm:text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
