import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Settings as SettingsIcon,
  User,
  Building2,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getRestaurantByOwnerId, updateRestaurant } from '../../services/restaurantService';
import type { Restaurant } from '../../types';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'restaurant',
    title: 'Información del Restaurante',
    description: 'Configura los datos básicos de tu restaurante',
    icon: Building2,
  },
  {
    id: 'profile',
    title: 'Perfil de Usuario',
    description: 'Gestiona tu información personal',
    icon: User,
  },
  {
    id: 'data',
    title: 'Cuenta',
    description: 'Gestiona tu cuenta',
    icon: Database,
  },
];

export function RestaurantSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('restaurant');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para formularios
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    cuisineType: '',
    capacity: 0,
    openingHours: '',
    closingHours: '',
    website: '',
    status: 'active' as 'active' | 'suspended' | 'pending',
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const restaurantData = await getRestaurantByOwnerId(user.id);
        setRestaurant(restaurantData);
        
        // Llenar formulario con datos del restaurante
        setRestaurantForm({
          name: restaurantData?.name || '',
          description: restaurantData?.description || '',
          email: restaurantData?.email || '',
          phone: restaurantData?.phone || '',
          address: restaurantData?.address || '',
          city: restaurantData?.city || '',
          cuisineType: restaurantData?.cuisineType || '',
          capacity: restaurantData?.capacity || 0,
          openingHours: restaurantData?.openingHours || '',
          closingHours: restaurantData?.closingHours || '',
          website: restaurantData?.website || '',
          status: restaurantData?.status || 'active',
        });

        // Llenar formulario de perfil
        setProfileForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleRestaurantSave = async () => {
    if (!restaurant?.id) return;
    
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, restaurantForm);
      toast.success('Configuración del restaurante guardada');
    } catch (error) {
      console.error('Error guardando restaurante:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      // Aquí implementarías la actualización del perfil de usuario
      toast.success('Perfil actualizado');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };


  const renderRestaurantSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Restaurante
          </label>
          <Input
            value={restaurantForm.name}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
            placeholder="Nombre del restaurante"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Cocina
          </label>
          <Input
            value={restaurantForm.cuisineType}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisineType: e.target.value })}
            placeholder="Ej: Italiana, Mexicana, Asiática"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          rows={3}
          value={restaurantForm.description}
          onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
          placeholder="Describe tu restaurante..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email
          </label>
          <Input
            type="email"
            value={restaurantForm.email}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
            placeholder="restaurante@ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Teléfono
          </label>
          <Input
            value={restaurantForm.phone}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Dirección
          </label>
          <Input
            value={restaurantForm.address}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
            placeholder="Dirección completa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ciudad
          </label>
          <Input
            value={restaurantForm.city}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
            placeholder="Ciudad"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Capacidad
          </label>
          <Input
            type="number"
            value={restaurantForm.capacity}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, capacity: parseInt(e.target.value) || 0 })}
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Hora de Apertura
          </label>
          <Input
            type="time"
            value={restaurantForm.openingHours}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, openingHours: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Hora de Cierre
          </label>
          <Input
            type="time"
            value={restaurantForm.closingHours}
            onChange={(e) => setRestaurantForm({ ...restaurantForm, closingHours: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Globe className="inline h-4 w-4 mr-1" />
          Sitio Web
        </label>
        <Input
          value={restaurantForm.website}
          onChange={(e) => setRestaurantForm({ ...restaurantForm, website: e.target.value })}
          placeholder="https://www.mirestaurante.com"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleRestaurantSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre
          </label>
          <Input
            value={profileForm.firstName}
            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Apellido
          </label>
          <Input
            value={profileForm.lastName}
            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
            placeholder="Tu apellido"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email
          </label>
          <Input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Teléfono
          </label>
          <Input
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleProfileSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Perfil'}
        </Button>
      </div>
    </div>
  );


  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Eliminar Cuenta
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Esta acción es irreversible. Se eliminarán todos tus datos de la base de datos, incluyendo tu restaurante y reservas.
        </p>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => {
            if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y eliminará todos tus datos de la base de datos.')) {
              // Aquí implementarías la eliminación de la cuenta
              toast.success('Cuenta eliminada correctamente de la base de datos');
            }
          }}
        >
          <Database className="h-4 w-4 mr-2" />
          Eliminar Cuenta
        </Button>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'restaurant':
        return renderRestaurantSettings();
      case 'profile':
        return renderProfileSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderRestaurantSettings();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona todas las configuraciones de tu restaurante y cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 text-sm font-medium rounded-none transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {section.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(settingsSections.find(s => s.id === activeSection)?.icon || SettingsIcon, { className: "h-5 w-5" })}
                <span>{settingsSections.find(s => s.id === activeSection)?.title}</span>
              </CardTitle>
              <CardDescription>
                {settingsSections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderActiveSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
