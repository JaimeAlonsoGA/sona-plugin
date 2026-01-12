/**
 * Hook for enhancing prompts via Edge Function
 * 
 * Provides functionality to enhance user prompts using GPT.
 * This is an optional, user-initiated action that costs 1 token.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

interface EnhancePromptInput {
  prompt: string
  mode?: 'designer' | 'producer' | 'creator'
}

interface EnhancePromptResponse {
  success: boolean
  enhancedPrompt: string
  tokensCharged: number
}

/**
 * Enhance prompt via Edge Function
 * Uses supabase.functions.invoke() which handles auth correctly
 */
async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptResponse> {
  const { data, error } = await supabase.functions.invoke<EnhancePromptResponse>('enhance-prompt', {
    body: input,
  })

  if (error) {
    console.error('Enhance prompt error:', error)
    throw new Error(error.message || 'Failed to enhance prompt')
  }

  if (!data) {
    throw new Error('No response from enhance-prompt function')
  }

  return data
}

/**
 * Hook for enhancing prompts
 * 
 * @example
 * ```tsx
 * const { mutateAsync: enhance, isPending } = useEnhancePrompt()
 * 
 * const handleEnhance = async () => {
 *   const result = await enhance({ prompt: 'my prompt', mode: 'designer' })
 *   setPrompt(result.enhancedPrompt)
 * }
 * ```
 */
export function useEnhancePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enhancePrompt,
    onSuccess: () => {
      // Invalidate token balance since we charged 1 token
      queryClient.invalidateQueries({ queryKey: ['userTokens'] })
      queryClient.invalidateQueries({ queryKey: ['hasTokens'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error) => {
      console.error('Prompt enhancement failed:', error)
    },
  })
}
