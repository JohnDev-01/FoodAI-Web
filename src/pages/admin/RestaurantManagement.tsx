import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ChefHat,
  Loader2,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import type { Restaurant, RestaurantStatus } from '../../types';
import { 
  getAllRestaurants, 
  updateRestaurant, 
  deleteRestaurant, 
  searchRestaurants,
  isRestaurantOpen 
} from '../../services/restaurantService';
import { useDebounce } from '../../hooks/useDebounce';

interface RestaurantWithActions extends Restaurant {
  isOpen?: boolean;
}

export function AdminRestaurantManagement() {
  const [restaurants, setRestaurants] = useState<RestaurantWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | 'all'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      let data: Restaurant[];

      if (debouncedSearchTerm || statusFilter !== 'all') {
        const result = await searchRestaurants({
          search: debouncedSearchTerm || undefined,
          status: statusFilter,
          pageSize: 100, // Load more for admin view
        });
        data = result.items;
      } else {
        data = await getAllRestaurants();
      }

      // Add computed properties
      const restaurantsWithActions = data.map(restaurant => ({
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant),
      }));

      setRestaurants(restaurantsWithActions);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast.error('Error al cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleStatusChange = async (restaurantId: string, newStatus: RestaurantStatus) => {
    try {
      setUpdating(restaurantId);
      const updatedRestaurant = await updateRestaurant(restaurantId, { status: newStatus });
      
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...updatedRestaurant, isOpen: isRestaurantOpen(updatedRestaurant) }
            : restaurant
        )
      );
      
      toast.success(`Restaurante ${newStatus === 'active' ? 'activado' : 'suspendido'} exitosamente`);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      toast.error('Error al actualizar el estado del restaurante');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      setDeleting(true);
      await deleteRestaurant(selectedRestaurant.id);
      
      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== selectedRestaurant.id));
      setShowDeleteModal(false);
      setSelectedRestaurant(null);
      toast.success('Restaurante eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Error al eliminar el restaurante');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: RestaurantStatus) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' },
      suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {status === 'active' ? <CheckCircle className="h-3 w-3" /> : 
         status === 'pending' ? <Clock className="h-3 w-3" /> : 
         <XCircle className="h-3 w-3" />}
        {config.label}
      </span>
    );
  };

  const formatAddress = (restaurant: Restaurant) => {
    const parts = [restaurant.address, restaurant.city, restaurant.country].filter(Boolean);
    return parts.join(', ');
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm opacity-80">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestión de Restaurantes</h1>
              <p className="text-blue-100/80">
                Administra todos los restaurantes registrados en la plataforma
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Restaurante
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar restaurantes por nombre, email o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RestaurantStatus | 'all')}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="pending">Pendientes</option>
                  <option value="suspended">Suspendidos</option>
                </select>
                <Button
                  variant="outline"
                  onClick={loadRestaurants}
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{restaurants.length}</p>
                </div>
                <ChefHat className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {restaurants.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {restaurants.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspendidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {restaurants.filter(r => r.status === 'suspended').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Table */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle>Lista de Restaurantes</CardTitle>
            <CardDescription>
              {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} encontrado{restaurants.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron restaurantes</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Restaurante</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contacto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ubicación</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Horario</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {restaurant.logoUrl ? (
                              <img
                                src={restaurant.logoUrl}
                                alt={restaurant.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <ChefHat className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{restaurant.name}</p>
                              {restaurant.cuisineType && (
                                <p className="text-sm text-gray-500">{restaurant.cuisineType}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{restaurant.email}</span>
                            </div>
                            {restaurant.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{restaurant.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate max-w-32">
                              {formatAddress(restaurant) || 'No especificada'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(restaurant.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {restaurant.openTime && restaurant.closeTime ? (
                              <>
                                <p className="text-sm text-gray-600">
                                  {restaurant.openTime.slice(0, 5)} - {restaurant.closeTime.slice(0, 5)}
                                </p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">No especificado</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {/* View details */}}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {/* Edit restaurant */}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRestaurant(restaurant)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedRestaurant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="text-red-600">Confirmar eliminación</CardTitle>
                <CardDescription>
                  ¿Estás seguro de que quieres eliminar el restaurante "{selectedRestaurant.name}"? 
                  Esta acción no se puede deshacer.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRestaurant(null);
                  }}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
