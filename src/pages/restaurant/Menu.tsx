import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  DollarSign,
  Clock,
  ChefHat,
  AlertTriangle,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import { 
  getAllDishesByRestaurant, 
  createDish, 
  updateDish, 
  deleteDish 
} from '../../services/dishService';
import { uploadDishImage } from '../../services/storageService';
import type { Dish, CreateDishInput, UpdateDishInput } from '../../types';

export function Menu() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // String states for ingredients and allergens (easier to edit)
  const [ingredientsText, setIngredientsText] = useState('');
  const [allergensText, setAllergensText] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateDishInput>({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    isAvailable: true,
    ingredients: [],
    allergens: [],
    preparationTime: undefined,
  });

  // Load restaurant and dishes
  useEffect(() => {
    loadData();
  }, [user]);

  // Filter dishes
  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, selectedCategory]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const restaurant = await getRestaurantByOwnerId(user.id);
      
      if (!restaurant) {
        toast.error('No se encontró el restaurante');
        return;
      }

      setRestaurantId(restaurant.id);
      const dishesData = await getAllDishesByRestaurant(restaurant.id);
      setDishes(dishesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  };

  const filterDishes = () => {
    let filtered = [...dishes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'Todas') {
      filtered = filtered.filter(dish => dish.category === selectedCategory);
    }

    setFilteredDishes(filtered);
  };

  const getCategories = () => {
    const categories = new Set(dishes.map(dish => dish.category));
    return ['Todas', ...Array.from(categories)];
  };

  const handleOpenModal = (dish?: Dish) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        imageUrl: dish.imageUrl,
        isAvailable: dish.isAvailable,
        ingredients: dish.ingredients || [],
        allergens: dish.allergens || [],
        preparationTime: dish.preparationTime,
      });
      setImagePreview(dish.imageUrl || '');
      setIngredientsText(dish.ingredients?.join(', ') || '');
      setAllergensText(dish.allergens?.join(', ') || '');
    } else {
      setEditingDish(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
        isAvailable: true,
        ingredients: [],
        allergens: [],
        preparationTime: undefined,
      });
      setImagePreview('');
      setIngredientsText('');
      setAllergensText('');
    }
    setSelectedImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDish(null);
    setSelectedImageFile(null);
    setImagePreview('');
    setIngredientsText('');
    setAllergensText('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }
      setSelectedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      toast.error('No se encontró el restaurante');
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one was selected
      if (selectedImageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadDishImage(selectedImageFile, restaurantId);
          toast.success('Imagen subida exitosamente');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Error al subir la imagen');
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Convert text inputs to arrays
      const ingredients = ingredientsText
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      const allergens = allergensText
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const dishData = { 
        ...formData, 
        imageUrl,
        ingredients,
        allergens
      };

      if (editingDish) {
        // Update
        const updated = await updateDish(editingDish.id, dishData as UpdateDishInput);
        setDishes(dishes.map(d => d.id === updated.id ? updated : d));
        toast.success('Plato actualizado exitosamente');
      } else {
        // Create
        const newDish = await createDish(restaurantId, dishData);
        setDishes([...dishes, newDish]);
        toast.success('Plato creado exitosamente');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving dish:', error);
      toast.error('Error al guardar el plato');
    }
  };

  const handleDelete = async (dishId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      return;
    }

    try {
      await deleteDish(dishId);
      setDishes(dishes.filter(d => d.id !== dishId));
      toast.success('Plato eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Error al eliminar el plato');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Menú
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra los platos de tu restaurante
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {getCategories().map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Add Button */}
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Plato
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay platos disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comienza agregando platos a tu menú
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-5 w-5 mr-2" />
              Agregar Primer Plato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map(dish => (
            <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ChefHat className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                {!dish.isAvailable && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    No Disponible
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {dish.name}
                  </h3>
                  <span className="text-xl font-bold text-blue-600">
                    ${dish.price}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {dish.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    {dish.category}
                  </span>
                  {dish.preparationTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {dish.preparationTime} min
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(dish)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dish.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingDish ? 'Editar Plato' : 'Nuevo Plato'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Plato *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Pasta Carbonara"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe el plato..."
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio * ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="Ej: Pastas, Carnes"
                  />
                </div>
              </div>

              {/* Preparation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tiempo de Preparación (minutos)
                </label>
                <Input
                  type="number"
                  value={formData.preparationTime || ''}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value ? parseInt(e.target.value) : undefined })}
                  min="0"
                  placeholder="Ej: 30"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen del Plato
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setSelectedImageFile(null);
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingredientes (separados por comas)
                </label>
                <Input
                  type="text"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Ej: Tomate, Queso, Albahaca"
                />
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alérgenos (separados por comas)
                </label>
                <Input
                  type="text"
                  value={allergensText}
                  onChange={(e) => setAllergensText(e.target.value)}
                  placeholder="Ej: Gluten, Lácteos"
                />
              </div>

              {/* Is Available */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plato disponible
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal} 
                  className="flex-1"
                  disabled={uploadingImage}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={uploadingImage}>
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo imagen...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingDish ? 'Guardar Cambios' : 'Crear Plato'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

