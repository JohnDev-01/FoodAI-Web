import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants';
import { Button } from '../ui/Button';
import { ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { actualTheme, setTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Inicio', href: ROUTES.HOME },
    { name: 'Restaurantes', href: ROUTES.RESTAURANTS },
    { name: 'Reservas', href: ROUTES.RESERVATIONS },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (isMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }

    return undefined;
  }, [isMenuOpen]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                FoodAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {actualTheme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Cart */}
            <Link to={ROUTES.CART} className="relative">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <ShoppingCart className="h-4 w-4" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>

            {/* Dashboard CTA */}
            {user?.role === 'restaurant' && (
              <Link to={ROUTES.RESTAURANT_DASHBOARD} className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:via-indigo-500 hover:to-purple-500 border-0"
                >
                  Ir al Dashboard
                </Button>
              </Link>
            )}

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to={ROUTES.ACCOUNT}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-9 w-9 p-0"
              >
                {isMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)]">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-r-3xl border-r border-blue-100 bg-white shadow-2xl shadow-blue-500/20 dark:border-blue-900/40 dark:bg-gray-900">
              <div className="relative overflow-hidden px-6 pb-6 pt-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-90" />
                <div className="relative flex items-center justify-between text-white">
                  <Link
                    to={ROUTES.HOME}
                    className="flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <span className="text-lg font-bold">F</span>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-white/70">FoodAI</p>
                      <p className="text-base font-semibold">Experiencias inteligentes</p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full border border-white/30 bg-white/10 p-0 text-white hover:bg-white/20"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                    Navegación
                  </p>
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-shadow ${
                          location.pathname === item.href
                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-200'
                            : 'bg-gray-50 text-gray-600 hover:shadow dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.name}
                        <span className="text-xs text-gray-400 dark:text-gray-500">›</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {user?.role === 'restaurant' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                      Restaurante
                    </p>
                    <Link
                      to={ROUTES.RESTAURANT_DASHBOARD}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
                        Ir al Dashboard
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                    Acciones
                  </p>
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Cambiar tema</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-full border border-gray-200 p-0 dark:border-gray-700"
                      onClick={toggleTheme}
                    >
                      {actualTheme === 'light' ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Link
                    to={ROUTES.CART}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
                  >
                    <span>Carrito</span>
                    <span className="inline-flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {getTotalItems() > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {getTotalItems()}
                        </span>
                      )}
                    </span>
                  </Link>
                </div>

                <div className="space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                  {user ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.role === 'restaurant'
                              ? 'Cuenta de restaurante'
                              : user.role === 'admin'
                                ? 'Administrador'
                                : 'Cliente FoodAI'}
                          </p>
                        </div>
                        <Link to={ROUTES.ACCOUNT} onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="rounded-full px-4">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full rounded-2xl">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link to={ROUTES.REGISTER} onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full rounded-2xl">
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
