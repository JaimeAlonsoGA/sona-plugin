/**
 * Bridge para comunicación entre React UI y C++ Plugin
 * 
 * JUCE 8 WebBrowserComponent expone funciones nativas bajo window.__JUCE__.backend
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

/**
 * Envía un mensaje al plugin C++
 */
export function sendToPlugin(message: BridgeMessage): void {
  const messageStr = JSON.stringify(message)
  const juce = getJuceBridge()
  
  // JUCE 8: funciones nativas bajo __JUCE__.backend.functionName
  if (juce?.backend?.sendToPlugin) {
    const nativeFunc = juce.backend.sendToPlugin
    
    // JUCE 8 usa getNativeFunction() que retorna una Promise
    if (typeof nativeFunc === 'function') {
      console.log('[Bridge → C++]', message)
      nativeFunc(messageStr)
        .then((result: any) => {
          console.log('[Bridge] Native function result:', result)
        })
        .catch((error: any) => {
          console.error('[Bridge] Native function error:', error)
        })
      return
    }
  }
  
  // Fallback: intentar función directa en window (compatibilidad)
  if (typeof (window as any).sendToPlugin === 'function') {
    console.log('[Bridge → C++ (direct)]', message)
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
