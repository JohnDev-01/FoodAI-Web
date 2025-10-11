# FoodAI Web

Aplicación web construida con React y Vite que centraliza la experiencia gastronómica de FoodAI. La plataforma ofrece vistas diferenciadas para clientes, restaurantes y administradores, integrando pedidos en tiempo real, reservas inteligentes y analítica avanzada para la operación de restaurantes.

## Tecnologías principales
- **React 19** con **TypeScript** y **React Router** para la construcción de la interfaz y la navegación.
- **Vite 7** como herramienta de desarrollo y empaquetado.
- **Tailwind CSS** para estilos utilitarios y diseño responsivo.
- **React Query**, **Axios** y **Socket.IO** para el consumo de API, manejo de estado del servidor y eventos en tiempo real.
- **Firebase Hosting** como destino de despliegue continuo mediante GitHub Actions.

## Requisitos previos
- Node.js ≥ 18 y npm (o pnpm si prefieres).
- Acceso al backend de FoodAI expuesto en `http://localhost:3000/api` o la URL que utilices.
- (Opcional) Firebase CLI autenticado con el proyecto correspondiente (`firebase login`).

## Instalación
```bash
# Instalar dependencias
npm install
# o, si usas pnpm
pnpm install
```

## Scripts disponibles
- `npm run dev`: inicia el servidor de desarrollo de Vite en `http://localhost:5173`.
- `npm run build`: genera la versión optimizada para producción en `dist`.
- `npm run preview`: sirve el contenido de `dist` para validaciones manuales post-build.
- `npm run lint`: ejecuta ESLint con la configuración del repositorio.

Para ejecutar los tests con Vitest (sin script predefinido): `npx vitest --ui` o `npx vitest run`.

## Configuración y variables
- Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto Supabase.
- La URL base del backend se controla desde `src/constants/index.ts:107` (`APP_CONFIG.apiUrl`). Actualízala según tu entorno (`/Users/johnsilvestre/Projects/itla/foodai-web/src/constants/index.ts:107`).
- Los tokens y datos de usuario se guardan en `localStorage` empleando las claves definidas en `STORAGE_KEYS`.
- Si necesitas variables de entorno, crea un archivo `.env` siguiendo la convención de Vite (`VITE_NOMBRE=valor`) y accede a ellas con `import.meta.env`.

## Cliente Supabase
- El cliente centralizado se encuentra en `src/services/supabaseClient.ts` y expone `supabaseClient` para interactuar con tus tablas, storage y auth.
- Importa este cliente desde cualquier componente o servicio: 
  ```ts
  import { supabaseClient } from '../services/supabaseClient';
  const { data, error } = await supabaseClient.from('restaurants').select('*');
  ```
- El archivo `src/env.d.ts` define los tipos de las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para asegurar autocompletado y validaciones en TypeScript.
- El flujo de registro para restaurantes utiliza Supabase Auth (correo y Google) y finaliza en la pantalla de onboarding `src/pages/restaurant/Onboarding.tsx`, que sincroniza la tabla `public.users`.
- Si utilizas el workflow de despliegue, configura en GitHub Actions los secretos `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para que la compilación produzca el build sin errores.

## Estructura del proyecto
```text
├── public/            # Recursos estáticos servidos sin procesar
├── src/
│   ├── components/    # Componentes reutilizables y elementos UI
│   ├── context/       # Proveedores de contexto (auth, carrito, sockets, tema)
│   ├── layouts/       # Estructuras base para cada tipo de usuario
│   ├── pages/         # Páginas de cliente, restaurante y administración
│   ├── services/      # Cliente HTTP, Supabase y servicios de dominio
│   ├── hooks/, utils/, types/  # Helpers y tipados compartidos
│   └── main.tsx       # Punto de entrada de la aplicación React
├── vite.config.ts     # Configuración de Vite
└── firebase.json      # Configuración de hosting y rewrites para Firebase
```

## Estilo y buenas prácticas
- El proyecto usa ESLint + TypeScript para mantener la calidad del código.
- Tailwind CSS se complementa con utilidades como `clsx` y `tailwind-merge` para gestionar clases dinámicas.
- Se recomienda seguir la arquitectura existente basada en contextos para nuevos estados globales.

## Despliegue en Firebase Hosting
1. Autentícate con Firebase: `firebase login`.
2. Selecciona el proyecto adecuado: `firebase use <project-id>`.
3. Genera el build: `npm run build`.
4. Despliega: `firebase deploy --only hosting`.

El flujo de GitHub Actions (`.github/workflows/firebase-hosting.yml`) automatiza el despliegue cuando se publican cambios en la rama configurada.

## Recursos adicionales
- [Documentación de Vite](https://vite.dev/guide/)
- [Documentación de React](https://react.dev/learn)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
