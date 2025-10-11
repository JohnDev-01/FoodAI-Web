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
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw]">
            <div className="flex h-full w-full flex-col border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to={ROUTES.HOME}
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    FoodAI
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                    Navegación
                  </p>
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>

                {user?.role === 'restaurant' && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                      Restaurante
                    </p>
                    <Link
                      to={ROUTES.RESTAURANT_DASHBOARD}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:via-indigo-500 hover:to-purple-500 border-0">
                        Ir al Dashboard
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                    Acciones
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Cambiar tema
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        toggleTheme();
                      }}
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
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
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

                <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  {user ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role === 'restaurant'
                            ? 'Cuenta de restaurante'
                            : user.role === 'admin'
                              ? 'Administrador'
                              : 'Cliente'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={ROUTES.ACCOUNT}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button variant="outline" className="w-full">
                            <User className="h-4 w-4 mr-2" />
                            Mi cuenta
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link to={ROUTES.REGISTER} onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full">Registrarse</Button>
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

