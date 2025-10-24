import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Star, MapPin, Clock, Search, Filter, Loader2, ChefHat } from 'lucide-react';
import { ROUTES } from '../../constants';
import type { Restaurant, RestaurantSearchResult } from '../../types';
import { searchRestaurants, getCuisineTypes, getCities, isRestaurantOpen } from '../../services/restaurantService';
import { useDebounce } from '../../hooks/useDebounce';

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [cuisinesData, citiesData, restaurantsData] = await Promise.all([
          getCuisineTypes(),
          getCities(),
          searchRestaurants({
            search: debouncedSearchTerm,
            cuisineType: selectedCuisine || undefined,
            city: selectedCity || undefined,
            sortBy,
            sortOrder,
            page: 1,
            pageSize: 12,
          }),
        ]);

        setAvailableCuisines(cuisinesData);
        setAvailableCities(citiesData);
        setRestaurants(restaurantsData.items);
        setHasMore(restaurantsData.hasMore);
        setTotal(restaurantsData.total);
        setPage(1);
      } catch (err) {
        console.error('Error loading restaurants:', err);
        setError('No se pudieron cargar los restaurantes');
        toast.error('Error al cargar los restaurantes');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [debouncedSearchTerm, selectedCuisine, selectedCity, sortBy, sortOrder]);

  // Load more restaurants
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await searchRestaurants({
        search: debouncedSearchTerm,
        cuisineType: selectedCuisine || undefined,
        city: selectedCity || undefined,
        sortBy,
        sortOrder,
        page: nextPage,
        pageSize: 12,
      });

      setRestaurants(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more restaurants:', err);
      toast.error('Error al cargar más restaurantes');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, debouncedSearchTerm, selectedCuisine, selectedCity, sortBy, sortOrder]);

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisine(cuisine === 'Todas' ? '' : cuisine);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city === 'Todas' ? '' : city);
  };

  const handleSortChange = (newSortBy: 'name' | 'rating' | 'created_at') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Restaurantes
          </h1>
          <p className="text-xl text-blue-100/80">
            Descubre los mejores restaurantes de tu ciudad
          </p>
          {total > 0 && (
            <p className="text-sm text-blue-200/60 mt-2">
              {total} restaurante{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar restaurantes por nombre, descripción o tipo de cocina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white/90 border-white/20 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'name' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSortChange('name')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSortChange('rating')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-blue-100/80 mb-2">Tipo de cocina:</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCuisine === '' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCuisineChange('Todas')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
                >
                  Todas
                </Button>
                {availableCuisines.map((cuisine) => (
                  <Button
                    key={cuisine}
                    variant={selectedCuisine === cuisine ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCuisineChange(cuisine)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </div>

            {availableCities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-100/80 mb-2">Ciudad:</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCity === '' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCityChange('Todas')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
                  >
                    Todas
                  </Button>
                  {availableCities.map((city) => (
                    <Button
                      key={city}
                      variant={selectedCity === city ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleCityChange(city)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-200 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Restaurants Grid */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const isOpen = isRestaurantOpen(restaurant);
              const formatAddress = () => {
                const parts = [restaurant.address, restaurant.city, restaurant.country].filter(Boolean);
                return parts.join(', ');
              };

              return (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-xl border-white/20 hover:bg-white/90">
                  <div className="relative">
                    {restaurant.logoUrl ? (
                      <img
                        src={restaurant.logoUrl}
                        alt={restaurant.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {restaurant.rating && (
                        <div className="bg-white/90 px-2 py-1 rounded-full flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                      }`}>
                        {isOpen ? 'Abierto' : 'Cerrado'}
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">{restaurant.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {restaurant.description || 'Sin descripción disponible'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {formatAddress() && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{formatAddress()}</span>
                        </div>
                      )}
                      {restaurant.openTime && restaurant.closeTime && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          {restaurant.openTime.slice(0, 5)} - {restaurant.closeTime.slice(0, 5)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {restaurant.cuisineType && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                          {restaurant.cuisineType}
                        </span>
                      )}
                      <Link to={`/restaurants/${restaurant.id}`}>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar más restaurantes'
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-blue-200/60 mx-auto mb-4" />
            <p className="text-blue-100/80 text-lg mb-2">
              No se encontraron restaurantes
            </p>
            <p className="text-blue-200/60 text-sm">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



