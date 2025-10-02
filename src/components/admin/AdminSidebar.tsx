import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  CreditCard, 
  Brain,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { name: 'Restaurantes', href: ROUTES.ADMIN_RESTAURANTS, icon: Building2 },
  { name: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { name: 'Suscripciones', href: ROUTES.ADMIN_SUBSCRIPTIONS, icon: CreditCard },
  { name: 'ML Management', href: ROUTES.ADMIN_ML, icon: Brain },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
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
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
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



