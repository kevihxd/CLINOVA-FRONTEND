# Arquitectura del Frontend — Kawakips

## Estructura de carpetas
```
src/
├── components/     # Componentes globales reutilizables
├── config/         # Constantes y configuración
├── hooks/          # Custom hooks (useApi, etc.)
├── layouts/        # Layouts de página
├── modules/        # Módulos de negocio
│   ├── auth/
│   ├── calidad/
│   ├── configuracion/
│   ├── dashboard/
│   ├── miCuenta/
│   ├── procesos/
│   └── talentoHumano/
├── providers/      # Context providers (Auth, Alert, Theme)
├── router/         # Rutas de la aplicación
├── services/       # httpClient y servicios de API
└── utils/          # Utilidades (apiUtils, formatters)
```

## Patrones usados
- **Custom hooks**: `useApi(endpoint)` para fetch de datos
- **Providers**: Context API para estado global (auth, alertas, tema)
- **Módulos**: Cada módulo tiene su propia carpeta con pages/ y components/
- **httpClient**: Axios con interceptores para JWT y manejo de 401

## Convenciones
- Componentes en PascalCase
- Hooks en camelCase con prefijo `use`
- Constantes en UPPER_SNAKE_CASE
- Servicios en camelCase
