import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  Package,
  MapPin,
  Phone,
  Mail,
  Building2,
  Clock3,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import type { Restaurant } from '../../types';

// Mock data - en producción esto vendría de la API
const mockStats = {
  totalOrders: 156,
  totalRevenue: 12500,
  totalCustomers: 89,
  averageOrderValue: 80.13,
  pendingOrders: 8,
  todayReservations: 12,
  lowStockItems: 3,
  rating: 4.8,
};

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Juan Pérez',
    items: 3,
    total: 45.5,
    status: 'preparing',
    time: 'Hace 2 min',
  },
  {
    id: 'ORD-002',
    customer: 'María García',
    items: 2,
    total: 32.0,
    status: 'ready',
    time: 'Hace 5 min',
  },
  {
    id: 'ORD-003',
    customer: 'Carlos López',
    items: 4,
    total: 67.25,
    status: 'pending',
    time: 'Hace 8 min',
  },
];

const upcomingReservations = [
  {
    id: 'RES-001',
    customer: 'Ana Martínez',
    partySize: 4,
    time: '7:30 PM',
    date: 'Hoy',
  },
  {
    id: 'RES-002',
    customer: 'Roberto Silva',
    partySize: 2,
    time: '8:15 PM',
    date: 'Hoy',
  },
];

export function RestaurantDashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const data = await getRestaurantByOwnerId(user.id);
        setRestaurant(data);
      } catch (error) {
        console.error('Error cargando restaurante', error);
        toast.error('No pudimos cargar la información del restaurante.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchRestaurant();
  }, [user?.id]);

  const formatTime = useMemo(
    () => (value?: string | null) => {
      if (!value) return '—';
      return value.slice(0, 5);
    },
    []
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard del Restaurante</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0">
          Bienvenido de vuelta. Aquí tienes un resumen de tu restaurante.
        </p>
      </div>

      {/* Profile Overview */}
      {profileLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : restaurant ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {restaurant.logoUrl ? (
                  <img
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                  <CardDescription>Perfil público del restaurante en FoodAI</CardDescription>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  restaurant.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : restaurant.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {restaurant.status === 'active'
                  ? 'Activo'
                  : restaurant.status === 'pending'
                    ? 'Pendiente'
                    : 'Suspendido'}
              </span>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {restaurant.description || 'Aún no has agregado una descripción para tu restaurante.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={<Mail className="h-4 w-4" />} label="Correo" value={restaurant.email} />
                <DetailItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Teléfono"
                  value={restaurant.phone || 'No especificado'}
                />
                <DetailItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Dirección"
                  value={
                    restaurant.address
                      ? `${restaurant.address}${restaurant.city ? `, ${restaurant.city}` : ''}`
                      : restaurant.city || 'No especificado'
                  }
                />
                <DetailItem
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Horarios"
                  value={`${formatTime(restaurant.openTime)} - ${formatTime(restaurant.closeTime)}`}
                />
                <DetailItem
                  icon={<Star className="h-4 w-4" />}
                  label="Calificación promedio"
                  value={restaurant.rating ? `${restaurant.rating.toFixed(1)} / 5` : 'Sin calificaciones'}
                />
                <DetailItem
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Tipo de cocina"
                  value={restaurant.cuisineType || restaurant.cuisine || 'No especificado'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsable del restaurante</CardTitle>
              <CardDescription>Información asociada a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                  {user?.firstName?.[0] ?? user?.name?.[0] ?? 'F'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Esta cuenta administra el restaurante registrado en la plataforma. Comparte acceso solo con personal
                  autorizado.
                </p>
                <Link to={ROUTES.RESTAURANT_ONBOARDING}>
                  <Button variant="outline" className="w-full">
                    Actualizar información
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Completa la configuración</CardTitle>
            <CardDescription>
              Aún no tenemos los datos de tu restaurante. Completa el onboarding para empezar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={ROUTES.RESTAURANT_ONBOARDING}>
              <Button>Ir al onboarding</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.averageOrderValue}</div>
            <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mockStats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Reservas Hoy</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mockStats.todayReservations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {mockStats.lowStockItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Calificación</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {mockStats.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Los últimos pedidos de tu restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-500">
                      {order.items} items • ${order.total}
                    </p>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status === 'pending'
                        ? 'Pendiente'
                        : order.status === 'preparing'
                          ? 'Preparando'
                          : 'Listo'}
                    </span>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>Reservas programadas para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{reservation.customer}</p>
                    <p className="text-sm text-gray-500">
                      {reservation.partySize} personas • {reservation.time}
                    </p>
                    <p className="text-xs text-gray-400">{reservation.date}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-900/60">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
