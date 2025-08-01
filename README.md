* ColdServiceApp

Aplicación creada en React Native con Expo para el registro y gestión de servicios de refrigeración.
Este proyecto está en desarrollo y es colaborativo.

-----------------------------------------------------------------------------------------------------------------

* Instalación

Clona el repositorio:

git clone https://github.com/YCatT-shirt/ColdServiceApp.git
cd ColdServiceApp

Instala las dependencias:
npm install

Inicia Expo:
npx expo start

Puedes escanear el QR con Expo Go en tu celular, o usar un emulador xd.

-----------------------------------------------------------------------------------------------------------------

PARA FLUJO DE TRABAJO.

Crear una rama nueva
Antes de empezar una tarea, crea una nueva rama basada en main:

git checkout main
git pull origin main
git checkout -b feature/nombre-de-la-tarea

Ejemplo: feature/formulario-reporte

Hacer cambios y subirlos
Una vez que termines una parte:

git add .
git commit -m "Descripción clara de lo que hiciste"
git push origin feature/nombre-de-la-tarea

Integrar cambios a main directamente

git checkout main
git pull origin main
git merge feature/nombre-de-la-tarea
git push origin main

Estructura sugerida del proyecto

ColdServiceApp/
├── components/ ← Componentes reutilizables
├── screens/ ← Pantallas principales
├── reportScreens/ ← Pantallas relacionadas con reportes
├── services/ ← Lógica externa (Firebase, API, etc.)
├── utils/ ← Funciones de utilidad
├── assets/ ← Imágenes, íconos
├── App.js ← Punto de entrada

Puedes aplicar formateo automático con EsLint y Prettier si lo tienes instalado.

Siempre hacer git pull origin main antes de comenzar algo nuevo
Comentar tu código por si hay algo que puede no ser obvio para otros



