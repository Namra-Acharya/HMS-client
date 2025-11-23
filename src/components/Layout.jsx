import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Notification from './Notification';
import useHMSStore from '../store/hmsStore';

function Layout() {
  const { isOnline } = useHMSStore();

  return (
    <div className="flex h-screen bg-medical-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {!isOnline && (
              <div className="mb-4 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-30 text-warning rounded-lg flex items-center gap-2 font-medium">
                <span className="text-lg">📴</span>
                <span>You are offline. Changes will be synced when you're back online.</span>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
      <Notification />
    </div>
  );
}

export default Layout;
