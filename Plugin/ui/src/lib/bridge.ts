/**
 * Bridge para comunicación entre React UI y C++ Plugin
 * 
 * JUCE 8 WebBrowserComponent usa un sistema de eventos para funciones nativas.
 * Las funciones nativas se invocan via: backend.emitEvent("__juce__invoke", { name, params, resultId })
 * La función 'sendToPlugin' es registrada en C++ via withNativeFunction()
 */

type MessageHandler = (message: BridgeMessage) => void

export interface BridgeMessage {
  type: string
  payload?: unknown
}

// Cola de handlers para mensajes entrantes
const messageHandlers: Set<MessageHandler> = new Set()

// Detectar si estamos en el WebView de JUCE
const getJuceBridge = (): any => {
  return (window as any).__JUCE__
}

// Promise handler para funciones nativas JUCE 8
let lastPromiseId = 0
const pendingPromises = new Map<number, { resolve: (value: any) => void; reject: (error: any) => void }>()

// Configurar listener para respuestas de funciones nativas (una sola vez)
function setupJuceCompletionListener(): void {
  const juce = getJuceBridge()
  if (juce?.backend?.addEventListener) {
    juce.backend.addEventListener("__juce__complete", ({ promiseId, result }: { promiseId: number; result: any }) => {
      const pending = pendingPromises.get(promiseId)
      if (pending) {
        pending.resolve(result)
        pendingPromises.delete(promiseId)
      }
    })
    console.log('[Bridge] JUCE completion listener configured')
  }
}

// Invocar una función nativa de JUCE 8 siguiendo el patrón oficial
function invokeNativeFunction(name: string, ...args: any[]): Promise<any> {
  const juce = getJuceBridge()
  
  if (!juce?.backend?.emitEvent) {
    return Promise.reject(new Error('JUCE backend.emitEvent not available'))
  }
  
  const promiseId = lastPromiseId++
  
  return new Promise((resolve, reject) => {
    pendingPromises.set(promiseId, { resolve, reject })
    
    // Invocar función nativa usando el evento __juce__invoke
    juce.backend.emitEvent("__juce__invoke", {
      name: name,
      params: args,
      resultId: promiseId
    })
  })
}

// Inicializar el listener de JUCE al cargar
if (typeof window !== 'undefined') {
  // Esperar a que JUCE esté listo
  const initJuce = () => {
    const juce = getJuceBridge()
    if (juce?.backend?.addEventListener) {
      setupJuceCompletionListener()
      
      // Debug: mostrar funciones nativas disponibles
      const functions = juce?.initialisationData?.__juce__functions
      console.log('[Bridge] JUCE native functions available:', functions)
      console.log('[Bridge] backend.emitEvent available:', typeof juce.backend?.emitEvent)
    }
  }
  
  // Intentar inmediatamente y también después de un pequeño delay
  initJuce()
  setTimeout(initJuce, 100)
}

/**
 * Envía un mensaje al plugin C++
 */
export function sendToPlugin(message: BridgeMessage): void {
  const messageStr = JSON.stringify(message)
  const juce = getJuceBridge()
  
  // JUCE 8: usar sistema de eventos para invocar funciones nativas
  if (juce?.backend?.emitEvent) {
    console.log('[Bridge → C++ (JUCE 8 emitEvent)]', message)
    
    invokeNativeFunction('sendToPlugin', messageStr)
      .then((result) => {
        console.log('[Bridge] Native function result:', result)
      })
      .catch((error) => {
        console.error('[Bridge] Native function error:', error)
      })
    return
  }
  
  // Fallback: intentar función directa en window (compatibilidad)
  if (typeof (window as any).sendToPlugin === 'function') {
    console.log('[Bridge → C++ (window direct)]', message)
    ;(window as any).sendToPlugin(messageStr)
    return
  }
  
  // En desarrollo sin plugin, simular respuesta
  console.log('[Bridge → C++ (simulated)]', message)
  simulatePluginResponse(message)
}

/**
 * Registra un handler para mensajes del plugin
 */
export function onMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler)
  return () => messageHandlers.delete(handler)
}

/**
 * Función llamada por C++ para enviar mensajes a React
 * Se expone globalmente para que el plugin pueda llamarla
 */
function handleMessageFromPlugin(messageJson: string): void {
  try {
    const message = JSON.parse(messageJson) as BridgeMessage
    console.log('[C++ → Bridge]', message)
    messageHandlers.forEach(handler => handler(message))
  } catch (e) {
    console.error('Failed to parse message from plugin:', e)
  }
}

// Exponer la función globalmente para C++
;(window as any).__onPluginMessage = handleMessageFromPlugin

/**
 * Simula respuestas del plugin para desarrollo
 */
function simulatePluginResponse(message: BridgeMessage): void {
  setTimeout(() => {
    switch (message.type) {
      case 'ui-ready':
        handleMessageFromPlugin(JSON.stringify({ type: 'connected' }))
        break
      
      case 'generate':
        // Simular generación
        setTimeout(() => {
          handleMessageFromPlugin(JSON.stringify({
            type: 'generation-progress',
            payload: { progress: 50 }
          }))
        }, 1000)
        
        setTimeout(() => {
          handleMessageFromPlugin(JSON.stringify({
            type: 'generation-complete',
            payload: { 
              success: true,
              audioUrl: 'simulated-audio.wav'
            }
          }))
        }, 3000)
        break
    }
  }, 100)
}

/**
 * Hook para usar el bridge en componentes React
 */
export function useBridge() {
  const juce = getJuceBridge()
  return {
    sendToPlugin,
    onMessage,
    isInPlugin: !!juce
  }
}
