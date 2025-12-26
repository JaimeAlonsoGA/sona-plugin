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

### Testing Stable Audio API

Para probar la integración con Stable Audio API:

```bash
cd scripts
npm install

# Set API key
export STABLE_AUDIO_API_KEY=your-api-key-here

# Test text-to-audio
node stable-audio.js text-to-audio "punchy tech house kick drum"

# Test audio-to-audio
node stable-audio.js audio-to-audio ./input.wav "add reverb"
```

Ver [scripts/README.md](scripts/README.md) para más detalles.

## Next Steps

1. [ ] Configurar Supabase project
2. [ ] Implementar comunicación C++ ↔ React
3. [ ] Crear componentes React base
4. [ ] Integrar Stable Audio API
5. [ ] Sistema de autenticación
6. [ ] Features core (Designer/Producer modes)

## Licencia

[Tu licencia aquí] 
