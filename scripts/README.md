# Stable Audio API Scripts

Scripts for testing and validating integration with Stable Audio API.

## Setup

1. Install dependencies:
```bash
cd scripts
npm install
```

2. Set your API key:
```bash
export STABLE_AUDIO_API_KEY=your-api-key-here
```

Or on Windows:
```powershell
$env:STABLE_AUDIO_API_KEY="your-api-key-here"
```

## Usage

### Text-to-Audio

Generate audio from a text prompt:

```bash
node stable-audio.js text-to-audio "punchy tech house kick drum"
```

Or use the npm script:
```bash
npm run test:text-to-audio
```

### Audio-to-Audio

Transform existing audio with a text prompt:

```bash
node stable-audio.js audio-to-audio ./input.wav "add reverb and make it more ambient"
```

## Output

Generated audio files are saved to the `../output/` directory with timestamps:
- Text-to-audio: `text-YYYY-MM-DDTHH-MM-SS.wav`
- Audio-to-audio: `audio-YYYY-MM-DDTHH-MM-SS.wav`

## Features

- ✅ Reads API key from environment variable (`STABLE_AUDIO_API_KEY`)
- ✅ Makes POST requests to Stable Audio API
- ✅ Saves generated audio as WAV files
- ✅ Displays generation time logs
- ✅ Proper error handling with detailed messages
- ✅ Supports both text-to-audio and audio-to-audio modes

## API Details

- **Text-to-Audio Endpoint**: `https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio`
- **Audio-to-Audio Endpoint**: `https://api.stability.ai/v2beta/audio/stable-audio-2/audio-to-audio`
- **Default Model**: `stable-audio-2.5`
- **Default Duration**: 20 seconds
- **Output Format**: WAV (44.1kHz stereo)

## Example Output

```
🎼 Stable Audio API Test Script
================================

🎵 Starting Text-to-Audio generation...
📝 Prompt: "punchy tech house kick drum"
⏳ Sending request to Stable Audio API...
✅ Audio generated successfully!
📁 Saved to: /path/to/output/text-2025-12-26T18-00-00.wav
⏱️  Generation time: 12.34s
📊 File size: 1234.56 KB

✨ Done!
```
