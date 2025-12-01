# Libre CO

<p align="center">
  <img src="./src/assets/img/readLogo.png" alt="Logo Libre CO" width="600" style="vertical-align:middle;"/>
</p>

## Tecnologías

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="https://tailwindcss.com/docs/installation/play-cdn"><img src="https://img.shields.io/badge/Tailwind%20CSS-CDN-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS (CDN)"></a>
  <a href="https://axios-http.com"><img src="https://img.shields.io/badge/Axios-HTTP%20Client-5A29E4" alt="Axios"></a>
  <a href="https://lucide.dev"><img src="https://img.shields.io/badge/Lucide-Icons-000000" alt="Lucide"></a>
  <a href="https://github.com/oframe/ogl"><img src="https://img.shields.io/badge/OGL-WebGL-000000" alt="OGL"></a>
  <a href="https://eslint.org"><img src="https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white" alt="ESLint"></a>
</p>

## Descripción

Frontend para un ecommerce de ebooks. Presenta catálogo, destacados, carrito y compra, biblioteca de usuario y autenticación. Se conecta a un backend vía API REST desarrollada con el stack MERN para el uso exclusivo de JavaScript.

## Requisitos

- Node.js `18+`
- npm `10+` (o `pnpm`/`yarn`)

## Inicio Rápido

- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev` y abrir `http://localhost:5173` para desarrollo
- Compilar producción: `npm run build`
- Previsualizar build: `npm run preview`

## Scripts

- `npm run dev`: inicia el servidor de desarrollo de Vite
- `npm run build`: genera el bundle de producción
- `npm run preview`: sirve el build para revisión
- `npm run lint`: ejecuta ESLint sobre el proyecto

## Configuración de API

- URL de backend: editar `src/services/api.js` línea 1 (`API_URL = 'http://localhost:5000/api'`)
- Autenticación: se usa `localStorage` para almacenar `token` y `user`

## Estructura de Carpetas

```
src/
  assets/
    img/
      planetEbook.png
      readLogo.png
    react.svg
  components/
    UI/
      Alert.jsx
    layout/
      Footer.jsx
      Header.jsx
      Modal.jsx
    sections/
      About.jsx
      BookCatalog.jsx
      Checkout.jsx
      FeaturedBooks.jsx
      Features.jsx
      Hero.jsx
      MyBooks.jsx
  hooks/
    useAuth.js
  pages/
    Index.jsx
  services/
    api.js
    authService.js
    bookService.js
    purchaseService.js
  App.css
  App.jsx
  index.css
  main.jsx
```

## Arquitectura

- `components/layout`: cabecera, pie y modal de autenticación
- `components/sections`: héroe, destacados, catálogo, compra, biblioteca, features, acerca
- `components/UI/Alert.jsx`: alertas con temporizador y tipos (success, error, etc.)
- `hooks/useAuth.js`: login, registro, logout y gestión de estado de usuario
- `services/*`: cliente REST, autenticación, libros y compras

## Estilos

- Tailwind CSS vía CDN en `index.html` para utilidades (`bg-*`, `text-*`, `rounded-*`, etc.)
- Animaciones y gradientes definidos con clases utilitarias
- Iconografía con `lucide-react`

## Integración Backend

- Base: `src/services/api.js` define `API_URL` y métodos `request`/`authenticatedRequest`
- Autenticación: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` (`src/services/authService.js`)
- Libros: `/books`, `/books/promocionales`, `/books/search`, `/books/:id` (`src/services/bookService.js`)
- Compras: `POST /purchases`, `GET /purchases`, `GET /purchases/check/:libroId`, `GET /purchases/:id` (`src/services/purchaseService.js`)

## Funcionalidades Clave

- Catálogo con búsqueda, filtros por categoría y paginación (`src/components/sections/BookCatalog.jsx`)
- Libros destacados con estados de carga y vacíos (`src/components/sections/FeaturedBooks.jsx`)
- Carrito en `Header` con dropdown, total y botón de pago (`src/components/layout/Header.jsx`)
- Checkout con métodos de pago (tarjeta, PayPal, transferencia) (`src/components/sections/Checkout.jsx`)
- Biblioteca del usuario con abrir y descargar ebooks (`src/components/sections/MyBooks.jsx`)
- Héroe animado con galaxia WebGL usando `ogl` (`src/components/sections/Hero.jsx`)
- Alertas configurables (`src/components/UI/Alert.jsx`)

## Notas

- Para despliegue, configure la URL del backend según el entorno de producción en `src/services/api.js`
- La API tambien se construyo y se encuentra en el otro repositorio de GitHub https://github.com/Drey0911/Ebooks-LibreCO-BACKEND

## Licencia
Todos los derechos reservados. © 2025 Andrey Stteven Mantilla Leon.

Este software es propiedad de su creador y si se usa como base, inspiración o referencia, se debe creditar al autor.
