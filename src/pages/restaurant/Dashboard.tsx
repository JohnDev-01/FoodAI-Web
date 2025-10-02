import React from 'react';
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
  Package
} from 'lucide-react';

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
    total: 45.50,
    status: 'preparing',
    time: '2 min ago',
  },
  {
    id: 'ORD-002',
    customer: 'María García',
    items: 2,
    total: 32.00,
    status: 'ready',
    time: '5 min ago',
  },
  {
    id: 'ORD-003',
    customer: 'Carlos López',
    items: 4,
    total: 67.25,
    status: 'pending',
    time: '8 min ago',
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard del Restaurante
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido de vuelta. Aquí tienes un resumen de tu restaurante.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
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
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.averageOrderValue}</div>
            <p className="text-xs text-muted-foreground">
              +2% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Pedidos Pendientes
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockStats.pendingOrders}
                </p>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Reservas Hoy
                </p>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Stock Bajo
                </p>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Calificación
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {mockStats.rating}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Los últimos pedidos de tu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-500">
                      {order.items} items • ${order.total}
                    </p>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                       order.status === 'preparing' ? 'Preparando' : 'Listo'}
                    </span>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>
              Reservas programadas para hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{reservation.customer}</p>
                    <p className="text-sm text-gray-500">
                      {reservation.partySize} personas • {reservation.time}
                    </p>
                    <p className="text-xs text-gray-400">{reservation.date}</p>
                  </div>
                  <Button size="sm" variant="outline">
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



