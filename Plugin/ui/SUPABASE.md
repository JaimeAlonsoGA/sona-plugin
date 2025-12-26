# Supabase Integration

This directory contains the Supabase client configuration and React Query hooks for authentication and API calls.

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Files Structure

- `lib/supabase.ts` - Supabase client initialization and helper functions
- `lib/hooks/useSupabase.ts` - React Query hooks for optimized data fetching
- `lib/hooks/index.ts` - Barrel export for hooks
- `vite-env.d.ts` - TypeScript type definitions for environment variables
- `components/AuthExample.tsx` - Example component demonstrating authentication
- `components/AudioGenerationExample.tsx` - Example component demonstrating audio generation

## Testing the Integration

Example components are provided to test the Supabase integration:

### Add to App.tsx for testing:

```typescript
import { AuthExample } from './components/AuthExample'
import { AudioGenerationExample } from './components/AudioGenerationExample'

// Add these components to your App return:
<AuthExample />
<AudioGenerationExample />
```

Then run the dev server:
```bash
npm run dev
```

## Usage

### Authentication

```typescript
import { useSignIn, useSignUp, useSignOut, useSession } from './lib/hooks'

function AuthComponent() {
  const signIn = useSignIn()
  const signUp = useSignUp()
  const signOut = useSignOut()
  const { data: session } = useSession()

  const handleSignIn = () => {
    signIn.mutate({ 
      email: 'user@example.com', 
      password: 'password' 
    })
  }

  return (
    <div>
      {session ? (
        <button onClick={() => signOut.mutate()}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  )
}
```

### Audio Generation

```typescript
import { useGenerateAudio } from './lib/hooks'

function AudioGenerator() {
  const generateAudio = useGenerateAudio()

  const handleGenerate = () => {
    generateAudio.mutate({
      prompt: 'Create a peaceful ambient sound',
      mode: 'ambient'
    }, {
      onSuccess: (audioData) => {
        // Handle the audio ArrayBuffer
        const blob = new Blob([audioData], { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        // Play or download the audio
      }
    })
  }

  return (
    <button 
      onClick={handleGenerate}
      disabled={generateAudio.isPending}
    >
      {generateAudio.isPending ? 'Generating...' : 'Generate Audio'}
    </button>
  )
}
```

## Available Functions

### Authentication Functions (from `lib/supabase.ts`)

- `signIn(email, password)` - Sign in with email and password
- `signUp(email, password)` - Sign up with email and password
- `signOut()` - Sign out the current user
- `getSession()` - Get the current session
- `generateAudio(prompt, mode)` - Generate audio using Supabase Edge Function
- `onAuthStateChange(callback)` - Listen to auth state changes

### React Query Hooks (from `lib/hooks/useSupabase.ts`)

- `useSession()` - Query hook for current session
- `useAuthStateListener()` - Hook to listen to auth state changes
- `useSignIn()` - Mutation hook for signing in
- `useSignUp()` - Mutation hook for signing up
- `useSignOut()` - Mutation hook for signing out
- `useGenerateAudio()` - Mutation hook for audio generation
- `useIsAuthenticated()` - Hook to check authentication status

## React Query Configuration

The QueryClient is configured in `main.tsx` with the following defaults:

- `retry: 1` - Retry failed requests once
- `refetchOnWindowFocus: false` - Don't refetch on window focus
- `staleTime: 1 minute` - Consider data fresh for 1 minute

## Environment Variables

All environment variables are typed in `vite-env.d.ts` for TypeScript support:

- `VITE_SUPABASE_URL` - Your Supabase project URL (required)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (required)
- `VITE_LOCAL_HOST` - Local development host (optional)

## Security

- All Supabase operations use the official `@supabase/supabase-js` client
- Authentication tokens are automatically managed by Supabase
- The client is configured with your anon key, which has Row Level Security (RLS) enabled
- Never commit your `.env.local` file - it's already in `.gitignore`
