/**
 * Export all hooks for easy importing
 */

export {
  useSession,
  useAuthStateListener,
  useSignIn,
  useSignUp,
  useSignOut,
  useGenerateAudio,
  useIsAuthenticated,
  queryKeys,
} from './use-supabase'

export {
  useSubmitJob,
  useJob,
  useUserJobs,
  useCompletedJobs,
  useJobSubscription,
  useJobPolling,
  jobQueryKeys,
} from './use-jobs'

export {
  useNamingSettings,
  exportNamingConventionForJob,
} from './use-naming-settings'

export {
  useUserNamingConventions,
  useUserNamingSettingsQuery,
  useNamingData,
  useCreateNamingConvention,
  useUpdateNamingConvention,
  useDeleteNamingConvention,
  useUpdateNamingSettings,
  namingQueryKeys,
} from './use-naming-conventions'
export type { NamingConventionExport } from './use-naming-settings'

export { useEnhancePrompt } from './use-enhance-prompt'

export {
  useUserTokens,
  useTokenTransactions,
  useCreateCheckoutSession,
  useHasTokens,
  useUseToken,
  useUseTokens,
  billingQueryKeys,
} from './use-billing'
