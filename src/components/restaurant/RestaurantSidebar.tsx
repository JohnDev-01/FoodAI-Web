import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';
import {
  LayoutDashboard,
  Calendar,
  Menu,
  BarChart3,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.RESTAURANT_DASHBOARD, icon: LayoutDashboard },
  { name: 'Reservas', href: ROUTES.RESTAURANT_RESERVATIONS, icon: Calendar },
  { name: 'Menús', href: '/restaurant/menu', icon: Menu },
  { name: 'Analytics', href: ROUTES.RESTAURANT_ANALYTICS, icon: BarChart3 },
  { name: 'Configuración', href: '/restaurant/settings', icon: Settings },
];

export function RestaurantSidebar() {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            FoodAI
          </span>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}



