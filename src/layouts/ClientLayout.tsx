import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/client/Navbar';
import { Footer } from '../components/client/Footer';

export function ClientLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}



