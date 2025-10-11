import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { ROUTES } from '../constants';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Restaurantes Inteligentes',
      description: 'Descubre restaurantes con tecnología de vanguardia y menús personalizados.',
      icon: '🍽️',
    },
    {
      title: 'Pedidos en Tiempo Real',
      description: 'Realiza pedidos y recibe actualizaciones en tiempo real del estado de tu orden.',
      icon: '📱',
    },
    {
      title: 'Reservas Inteligentes',
      description: 'Reserva tu mesa con anticipación y disfruta de una experiencia sin esperas.',
      icon: '📅',
    },
    {
      title: 'Analytics Avanzados',
      description: 'Los restaurantes pueden analizar su rendimiento y optimizar sus operaciones.',
      icon: '📊',
    },
  ];

  const cuisines = [
    { name: 'Italiana', icon: '🍝', color: 'bg-red-100 text-red-800' },
    { name: 'Mexicana', icon: '🌮', color: 'bg-green-100 text-green-800' },
    { name: 'Asiática', icon: '🍜', color: 'bg-blue-100 text-blue-800' },
    { name: 'Mediterránea', icon: '🥗', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Americana', icon: '🍔', color: 'bg-purple-100 text-purple-800' },
    { name: 'Francesa', icon: '🥐', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Bienvenido a{' '}
            <span className="text-blue-600 dark:text-blue-400">FoodAI</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            La plataforma inteligente que revoluciona la experiencia gastronómica 
            con tecnología de vanguardia y análisis predictivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.role === 'restaurant' && (
              <Link to={ROUTES.RESTAURANT_DASHBOARD}>
                <Button size="lg" className="text-lg px-8 py-3">
                  Ir al Dashboard
                </Button>
              </Link>
            )}
            <Link to={ROUTES.RESTAURANTS}>
              <Button size="lg" className="text-lg px-8 py-3">
                Explorar Restaurantes
              </Button>
            </Link>
            {!user && (
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Registrarse
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué elegir FoodAI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Nuestra plataforma combina inteligencia artificial con análisis de datos 
              para ofrecer la mejor experiencia gastronómica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explora Diferentes Cocinas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre una amplia variedad de restaurantes con diferentes tipos de cocina.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`${ROUTES.RESTAURANTS}?cuisine=${cuisine.name.toLowerCase()}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">{cuisine.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {cuisine.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para Revolucionar tu Experiencia Gastronómica?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están disfrutando de la mejor experiencia gastronómica con FoodAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="text-lg px-8 py-3">
                Comenzar Ahora
              </Button>
            </Link>
            <Link to={ROUTES.RESTAURANTS}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Ver Restaurantes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
