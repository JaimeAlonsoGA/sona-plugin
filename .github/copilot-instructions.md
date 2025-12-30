Tis is Sona, an IA audio generation plugin for sound designers, game audio, and musicians.

Stack: 

JUCE framework in C++, 
WEbview React, Typescript, Tailwind, Tanstack Query. 
Supabase DB, Storage, Auth, Edge Functions. 

backend Audio Service Worker Node.js, Typescript.

All the database types are in /Plugin/ui/src/types/database.types.ts

The plugin is VST3 and Standalone.

The LM for audio generation is Stable Audio API. 

Flow:
user opens plugin -> configures settings for audio generation -> sends request to Supabase Edge Function -> Edge Function creates job in DB -> Audio Service Worker processes job and calls Stable Audio API -> retrieves audio and process it into WAV and MP3 -> stores it into Supabase Storage -> Updates Job -> Plugin fetches audio data from Supabase Storage using the job information -> plays audio to user.

/audio-worker - Audio Service Worker that process audio generation jobs and communicates with Stable Audio API.
 /plugin - JUCE C++ code for the plugin.
 /plugin/ui - Webview code for the plugin using React, Typescript, Tailwind, Tanstack Query.
 /supabase - Supabase Edge Functions code.

```md