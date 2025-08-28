import React from 'react';
import Sidebar from '../components/Sidebar'; // adjust path if needed
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Sticky works when outer container scrolls */}
      <Sidebar />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 h-screen">
        <Outlet />
      </main>
    </div>
  );
};


export default DashboardLayout;
