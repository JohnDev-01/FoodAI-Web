import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { ClientLayout } from './layouts/ClientLayout';
import { RestaurantLayout } from './layouts/RestaurantLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Cliente - Vista Principal
import { Home } from './pages/Home';
import { RestaurantList } from './pages/client/RestaurantList';
import { RestaurantDetail } from './pages/client/RestaurantDetail';
import { Reservations } from './pages/client/Reservations';
import { About } from './pages/About';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AuthCallback } from './pages/auth/AuthCallback';
import { ClientOnboarding } from './pages/client/Onboarding';

// Dashboard Restaurante
import { RestaurantDashboard } from './pages/restaurant/Dashboard';
import { RestaurantOnboarding } from './pages/restaurant/Onboarding';
import { RestaurantReservations } from './pages/restaurant/Reservations';
import { RestaurantAnalytics } from './pages/restaurant/Analytics';
import { RestaurantSettings } from './pages/restaurant/Settings';

// Admin
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminReservations } from './pages/admin/Reservations';

// Protected Routes
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { RestaurantRoute } from './components/auth/RestaurantRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    },
                  }}
                />
                <Routes>
                  {/* Rutas públicas - Cliente */}
                  <Route path="/" element={<ClientLayout />}>
                    <Route index element={<Home />} />
                    <Route path="restaurants" element={<RestaurantList />} />
                    <Route path="restaurants/:id" element={<RestaurantDetail />} />
                    <Route
                      path="reservations"
                      element={
                        <ProtectedRoute requireProfile={false}>
                          <Reservations />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="about" element={<About />} />
                    {/* Add more client routes as needed */}
                  </Route>

                  {/* Rutas de autenticación */}
                  <Route path="/auth">
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="callback" element={<AuthCallback />} />
                  </Route>

                  {/* Flujo de onboarding cliente */}
                  <Route
                    path="/client/onboarding"
                    element={
                      <ProtectedRoute requireProfile={false}>
                        <ClientOnboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* Flujo de onboarding restaurante */}
                  <Route
                    path="/restaurant/onboarding"
                    element={
                      <ProtectedRoute requireProfile={false}>
                        <RestaurantOnboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rutas protegidas - Dashboard Restaurante */}
                  <Route path="/restaurant" element={
                    <ProtectedRoute>
                      <RestaurantRoute>
                        <RestaurantLayout />
                      </RestaurantRoute>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
                    <Route path="dashboard" element={<RestaurantDashboard />} />
                    <Route path="reservations" element={<RestaurantReservations />} />
                    <Route path="analytics" element={<RestaurantAnalytics />} />
                    <Route path="settings" element={<RestaurantSettings />} />
                    {/* Add more restaurant routes as needed */}
                  </Route>

                  {/* Rutas protegidas - Admin */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="reservations" element={<AdminReservations />} />
                    {/* Add more admin routes as needed */}
                  </Route>

                  {/* Ruta 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
