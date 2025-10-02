import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}



