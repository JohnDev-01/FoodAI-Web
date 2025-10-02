import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Star, MapPin, Clock } from 'lucide-react';

// Mock data - en producción esto vendría de la API
const mockRestaurants = [
  {
    id: '1',
    name: 'Restaurante Italiano Bella Vista',
    description: 'Auténtica cocina italiana con ingredientes frescos importados directamente de Italia.',
    cuisine: 'Italiana',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    address: 'Av. Principal 123, Centro',
    phone: '+1 234 567 8900',
    isActive: true,
  },
  {
    id: '2',
    name: 'Sushi Master',
    description: 'Los mejores rollos de sushi y sashimi preparados por chefs japoneses expertos.',
    cuisine: 'Asiática',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    address: 'Calle Sushi 456, Zona Rosa',
    phone: '+1 234 567 8901',
    isActive: true,
  },
  {
    id: '3',
    name: 'Tacos El Mexicano',
    description: 'Tacos auténticos con recetas tradicionales mexicanas y ingredientes frescos.',
    cuisine: 'Mexicana',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    address: 'Plaza México 789, Norte',
    phone: '+1 234 567 8902',
    isActive: true,
  },
  {
    id: '4',
    name: 'Café Parisien',
    description: 'Un rincón de París en tu ciudad con croissants, café y pasteles franceses.',
    cuisine: 'Francesa',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    address: 'Boulevard Francés 321, Sur',
    phone: '+1 234 567 8903',
    isActive: true,
  },
];

export function RestaurantList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisines = ['Todas', 'Italiana', 'Asiática', 'Mexicana', 'Francesa', 'Mediterránea', 'Americana'];

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === '' || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurantes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Descubre los mejores restaurantes de tu ciudad
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar restaurantes..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {cuisines.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine === 'Todas' ? '' : cuisine)}
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{restaurant.rating}</span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {restaurant.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {restaurant.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    Abierto ahora
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm px-2 py-1 rounded-full">
                    {restaurant.cuisine}
                  </span>
                  <Link to={`/restaurant/${restaurant.id}`}>
                    <Button size="sm">
                      Ver Menú
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No se encontraron restaurantes con los criterios de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



