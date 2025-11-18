# Sistema de Gestión de QA

Sistema completo de gestión de reportes de bugs para equipos de QA, con panel administrativo y interfaz para testers.

## Características

### Panel Administrativo
- Crear y gestionar aplicaciones
- Asignar QA testers a aplicaciones
- Ver todos los reportes de bugs
- Actualizar estado de reportes
- Gestionar usuarios del sistema

### Panel QA
- Ver aplicaciones asignadas
- Crear reportes detallados de bugs
- Seguimiento de reportes propios
- Sistema de severidad (baja, media, alta, crítica)
- Estados de reporte (abierto, en progreso, resuelto, cerrado)

## Tecnologías

### Backend
- Node.js + Express
- TypeScript
- MongoDB con Mongoose
- JWT para autenticación
- bcryptjs para encriptación

### Frontend
- React 18 + TypeScript
- Vite
- React Router para navegación
- Zustand para manejo de estado
- Axios para peticiones HTTP

## Requisitos Previos

- Node.js 18 o superior
- MongoDB instalado y ejecutándose localmente
- npm o yarn

## Instalación

1. Clonar el repositorio
```bash
cd QA
```

2. Instalar dependencias
```bash
npm run install-all
```

3. Configurar variables de entorno del backend
```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` y configurar:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qa-system
JWT_SECRET=tu_clave_secreta_aqui
NODE_ENV=development
```

## Ejecución

### Desarrollo (Frontend y Backend simultáneamente)
```bash
npm run dev
```

### Solo Backend
```bash
cd backend
npm run dev
```

### Solo Frontend
```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:3000
El backend estará disponible en: http://localhost:5000

## Uso

### Primer Usuario Administrador

Para crear el primer usuario administrador, usa una herramienta como Postman o Thunder Client para hacer una petición POST a:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Administrador",
  "role": "admin"
}
```

### Crear Usuario QA

Desde el mismo endpoint, cambiar `role` a `"qa"`:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "qa@example.com",
  "password": "qa123",
  "name": "QA Tester",
  "role": "qa"
}
```

### Flujo de Trabajo

1. **Administrador**: Inicia sesión y crea aplicaciones
2. **Administrador**: Asigna QA testers a las aplicaciones
3. **QA Tester**: Inicia sesión y ve sus aplicaciones asignadas
4. **QA Tester**: Reporta bugs con información detallada
5. **Administrador**: Revisa reportes y actualiza estados

## Estructura del Proyecto

```
QA/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración (base de datos)
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middleware de autenticación
│   │   └── server.ts       # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── store/          # Gestión de estado (Zustand)
│   │   ├── lib/            # Utilidades (API client)
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Punto de entrada
│   ├── package.json
│   └── vite.config.ts
└── package.json            # Scripts principales
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Aplicaciones
- `GET /api/applications` - Listar aplicaciones
- `POST /api/applications` - Crear aplicación (admin)
- `PUT /api/applications/:id` - Actualizar aplicación (admin)
- `DELETE /api/applications/:id` - Eliminar aplicación (admin)

### Usuarios QA
- `GET /api/qa-users` - Listar usuarios QA (admin)
- `GET /api/qa-users/my-applications` - Aplicaciones asignadas al QA

### Reportes de Bugs
- `GET /api/bug-reports` - Listar reportes
- `POST /api/bug-reports` - Crear reporte
- `PATCH /api/bug-reports/:id/status` - Actualizar estado
- `GET /api/bug-reports/application/:id` - Reportes por aplicación

## Modelos de Datos

### User
```typescript
{
  email: string
  password: string (encriptada)
  name: string
  role: 'admin' | 'qa'
}
```

### Application
```typescript
{
  name: string
  description: string
  version: string
  platform: string
  assignedQAs: ObjectId[]
}
```

### BugReport
```typescript
{
  title: string
  description: string
  stepsToReproduce: string
  expectedBehavior: string
  actualBehavior: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  application: ObjectId
  reportedBy: ObjectId
  environment: string
  screenshots?: string[]
}
```

## Licencia

MIT
