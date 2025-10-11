import React from 'react';
import { Outlet } from 'react-router-dom';
import { RestaurantHeader } from '../components/restaurant/RestaurantHeader';
import { RestaurantSidebar } from '../components/restaurant/RestaurantSidebar';

export function RestaurantLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:flex">
        <RestaurantSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <RestaurantHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


