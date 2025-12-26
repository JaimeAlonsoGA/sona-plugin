# Sona - AI Audio Sample Generator Plugin

Generador de samples de audio con IA, diseñado para sound designers y productores musicales.

## Stack Tecnológico

- **Plugin**: JUCE 8.0.11 (C++)
- **UI**: React + TypeScript + Vite
- **Backend**: Supabase (Edge Functions + Auth + Storage)
- **AI**: Stable Audio API
- **Styling**: Tailwind CSS
- **State**: TanStack Query + React Context

## Estructura del Proyecto

```
sona/
├── Plugin/                 # Código del plugin
│   ├── Source/            # C++ (JUCE)
│   │   ├── PluginProcessor.cpp/h
│   │   └── PluginEditor.cpp/h
│   ├── ui/                # React UI
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── store/
│   │   └── package.json
│   └── CMakeLists.txt
├── edge-functions/        # Supabase Edge Functions (Deno)
│   ├── generate/          # Audio job creation endpoint
│   ├── examples/          # Integration examples
│   └── README.md          # Edge Functions documentation
├── service-worker/        # Background audio worker (Node.js)
│   ├── src/               # TypeScript source
│   ├── Dockerfile         # Docker configuration
│   ├── fly.toml           # Fly.io deployment config
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── README.md          # Worker documentation
├── supabase/              # Supabase configuration
│   ├── config.toml        # Project configuration
│   └── migrations/        # Database migrations
├── CMake/                 # CMake modules
├── Modules/               # JUCE custom modules (opcional)
├── Scripts/               # Build scripts
└── CMakeLists.txt         # Configuración principal
```

## Setup de Desarrollo

### Requisitos

- Visual Studio 2022 o 2026 (con C++ Desktop Development)
- CMake 3.16+
- Node.js 18+ (para React UI)
- Git

### Compilar el Plugin

```powershell
# 1. Generar proyecto
cmake -B build

# 2. Compilar
cmake --build build --config Debug

# 3. Ejecutar standalone
.\build\Plugin\Sona_artefacts\Debug\Standalone\Sona.exe
```

### Desarrollo de UI (React)

```powershell
cd Plugin/ui
npm install
npm run dev
```

El dev server correrá en http://localhost:5173

### Supabase Edge Functions

Las Edge Functions están en la carpeta `/edge-functions` y manejan la creación de trabajos de generación de audio.

Ver documentación completa: [edge-functions/README.md](edge-functions/README.md)

**Desplegar Edge Functions:**

```bash
# Vincular proyecto
supabase link --project-ref your-project-ref

# Aplicar migración de base de datos
supabase db push

# Desplegar función
supabase functions deploy generate
```

**Documentación relacionada:**
- [Edge Functions README](edge-functions/README.md) - Documentación de la API
- [Deployment Guide](edge-functions/DEPLOYMENT.md) - Guía de despliegue paso a paso
- [Implementation Summary](edge-functions/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación

### Servicio Worker de Audio

El servicio worker procesa trabajos de generación de audio en segundo plano.

Ver documentación completa: [service-worker/README.md](service-worker/README.md)

**Desplegar Worker:**

```bash
cd service-worker

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Validar configuración
npm run validate

# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

**Documentación relacionada:**
- [Service Worker README](service-worker/README.md) - Documentación completa
- [Deployment Guide](service-worker/DEPLOYMENT.md) - Guía de despliegue para Fly.io, Render, Railway, VPS

## Next Steps

1. [x] Configurar Supabase Edge Functions (COD-29)
2. [x] Build Audio Worker Service for Stable Audio generation (COD-30)
3. [ ] Configurar Supabase project
4. [ ] Implementar comunicación C++ ↔ React
5. [ ] Crear componentes React base
6. [ ] Sistema de autenticación
7. [ ] Features core (Designer/Producer modes)

## Licencia

[Tu licencia aquí] 
