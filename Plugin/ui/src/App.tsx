/**
 * App Root Component
 * 
 * Sets up the plugin bridge communication and renders the router.
 * Authentication logic is handled by route guards in the router.
 */

import { useEffect } from 'react'
import { useBridge } from './lib/bridge'
import { useAuthStateListener } from './lib/hooks'
import { AppRouter } from './routes'

export function App() {
  const { sendToPlugin, onMessage } = useBridge()

  // Listen to auth state changes globally
  useAuthStateListener()

  useEffect(() => {
    // Listen for messages from the C++ plugin
    const unsubscribe = onMessage((message) => {
      console.log('Message from C++:', message)

      if (message.type === 'connected') {
        console.log('Plugin connected')
      }

      if (message.type === 'generation-complete') {
        console.log('Generation complete (legacy)')
      }
    })

    // Notify the plugin that the UI is ready
    sendToPlugin({ type: 'ui-ready' })

    return unsubscribe
  }, [onMessage, sendToPlugin])

  return <AppRouter />
}
