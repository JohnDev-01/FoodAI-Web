import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  ChefHat,
  Star,
  Calendar,
  Users,
  Utensils,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getRestaurantById } from '../../services/restaurantService';
import { getDishesByRestaurant, getRestaurantDishImages } from '../../services/dishService';
import { ROUTES } from '../../constants';
import type { Restaurant, Dish, DishImage } from '../../types';

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Obtener datos del restaurante
        const restaurantData = await getRestaurantById(id);
        setRestaurant(restaurantData);

        // Obtener platos del restaurante
        const dishesData = await getDishesByRestaurant(id);
        setDishes(dishesData);

        // Obtener imágenes de platos
        const imagesData = await getRestaurantDishImages(id);
        setDishImages(imagesData);

      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Error al cargar los datos del restaurante');
        navigate(ROUTES.CLIENT_RESTAURANTS);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, navigate]);

  // Obtener categorías únicas de platos
  const categories = ['Todas', ...Array.from(new Set(dishes.map(dish => dish.category)))];

  // Filtrar platos por categoría
  const filteredDishes = selectedCategory === 'Todas' 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory);

  // Agrupar imágenes por plato
  const imagesByDish = dishImages.reduce((acc, image) => {
    if (!acc[image.dishId]) {
      acc[image.dishId] = [];
    }
    acc[image.dishId].push(image);
    return acc;
  }, {} as Record<string, DishImage[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurante no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El restaurante que buscas no existe o ha sido eliminado.
          </p>
          <Link to={ROUTES.CLIENT_RESTAURANTS}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Restaurantes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOpen = restaurant.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.CLIENT_RESTAURANTS}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Restaurantes
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {restaurant.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {restaurant.description || 'Sin descripción disponible'}
              </p>
              
              {/* Estado del restaurante */}
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isOpen 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {isOpen ? 'Abierto' : 'Cerrado'}
                </span>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <ChefHat className="h-4 w-4 mr-1" />
                  <span className="text-sm">{restaurant.cuisineType}</span>
                </div>
              </div>
            </div>

            {/* Botón de reserva */}
            <div className="text-right">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  navigate(ROUTES.RESERVATIONS, {
                    state: { restaurant }
                  });
                }}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Hacer Reserva
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información del restaurante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2" />
                  Información del Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {restaurant.address}, {restaurant.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {restaurant.phone}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {restaurant.email}
                    </span>
                  </div>
                  
                  {restaurant.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Sitio Web
                      </a>
                    </div>
                  )}
                </div>

                {/* Horarios */}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {restaurant.openingHours} - {restaurant.closingHours}
                  </span>
                </div>

                {/* Capacidad */}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Capacidad: {restaurant.capacity} personas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Platos del restaurante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-5 w-5 mr-2" />
                  Nuestros Platos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filtros de categoría */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Lista de platos */}
                {filteredDishes.length > 0 ? (
                  <div className="space-y-4">
                    {filteredDishes.map((dish) => (
                      <div key={dish.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {dish.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {dish.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ${dish.price.toFixed(2)}
                              </span>
                              {dish.preparationTime && (
                                <span>
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {dish.preparationTime} min
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {dish.category}
                              </span>
                            </div>
                          </div>
                          
                          {/* Imagen del plato */}
                          {dish.imageUrl && (
                            <div className="ml-4">
                              <img
                                src={dish.imageUrl}
                                alt={dish.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay platos disponibles en esta categoría
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Galería de imágenes de platos */}
            {dishImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Galería de Platos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dishImages.slice(0, 8).map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          alt={image.altText}
                          className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary">
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {dishImages.length > 8 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">
                        Ver todas las imágenes ({dishImages.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen de reserva */}
            <Card>
              <CardHeader>
                <CardTitle>Reservar Mesa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {restaurant.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {restaurant.cuisineType} • {restaurant.city}
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      (4.5)
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    navigate(ROUTES.RESERVATIONS, {
                      state: { restaurant }
                    });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Hacer Reserva
                </Button>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Reserva tu mesa y disfruta de una experiencia única
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Capacidad</span>
                  <span className="text-sm font-medium">{restaurant.capacity} personas</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tipo de Cocina</span>
                  <span className="text-sm font-medium">{restaurant.cuisineType}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                  <span className={`text-sm font-medium ${
                    isOpen ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}