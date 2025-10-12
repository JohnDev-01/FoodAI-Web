import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  getPendingReservationsCount,
  subscribeToReservationUpdates,
  unsubscribeFromReservationUpdates,
} from '../../services/reservationService';
import { ROUTES } from '../../constants';

// Mock data - en producción esto vendría de la API
const mockStats = {
  totalRestaurants: 45,
  totalUsers: 1250,
  totalRevenue: 125000,
  activeOrders: 89,
  systemHealth: 99.9,
  averageResponseTime: 120,
  uptime: 99.8,
};

const recentActivity = [
  {
    id: 1,
    type: 'restaurant_registered',
    message: 'Nuevo restaurante "Sushi Master" se registró',
    time: '2 min ago',
    status: 'pending',
  },
  {
    id: 2,
    type: 'payment_received',
    message: 'Pago de suscripción recibido de "Pizza Palace"',
    time: '15 min ago',
    status: 'completed',
  },
  {
    id: 3,
    type: 'system_alert',
    message: 'Alto tráfico detectado en el servidor principal',
    time: '1 hour ago',
    status: 'warning',
  },
  {
    id: 4,
    type: 'user_registered',
    message: '25 nuevos usuarios registrados hoy',
    time: '2 hours ago',
    status: 'completed',
  },
];

const topRestaurants = [
  {
    id: '1',
    name: 'Restaurante Italiano Bella Vista',
    revenue: 12500,
    orders: 156,
    rating: 4.8,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sushi Master',
    revenue: 9800,
    orders: 134,
    rating: 4.9,
    status: 'active',
  },
  {
    id: '3',
    name: 'Tacos El Mexicano',
    revenue: 8700,
    orders: 98,
    rating: 4.7,
    status: 'active',
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingReservations, setPendingReservations] = useState<number>(0);
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const loadPending = async () => {
      try {
        const count = await getPendingReservationsCount();
        if (mounted) {
          setPendingReservations(count);
        }
      } catch (error) {
        console.error('Error obteniendo reservas pendientes:', error);
      }
    };

    loadPending();

    const channel = subscribeToReservationUpdates(() => {
      if (!mounted) return;
      setIsRealtimeSyncing(true);
      loadPending().finally(() => {
        if (mounted) {
          setTimeout(() => setIsRealtimeSyncing(false), 400);
        }
      });
    });

    return () => {
      mounted = false;
      unsubscribeFromReservationUpdates(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general de la plataforma FoodAI
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            {pendingReservations} reservas pendientes
          </div>
          {isRealtimeSyncing && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
              Sincronizando en vivo...
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalRestaurants}</div>
            <p className="text-xs text-muted-foreground">
              +3 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
            +18% este mes
          </p>
        </CardContent>
      </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                {pendingReservations}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Reservas esperando aprobación
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-300">
                  {pendingReservations > 0
                    ? 'Revisa la sección de reservas para aprobarlas'
                    : 'Todo al día'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Todo funcionando correctamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStats.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Promedio de respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Actividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockStats.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Top Restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas actividades en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurantes Destacados</CardTitle>
            <CardDescription>
              Los restaurantes con mejor rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-gray-500">
                        {restaurant.orders} pedidos • ⭐ {restaurant.rating}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${restaurant.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reservations CTA */}
      {pendingReservations > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <AlertCircle className="h-5 w-5" />
              <span>Reservas pendientes por aprobar</span>
            </CardTitle>
            <CardDescription>
              Tienes {pendingReservations} reservas esperando revisión y aprobación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(ROUTES.ADMIN_RESERVATIONS)}
            >
              Ver reservas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
