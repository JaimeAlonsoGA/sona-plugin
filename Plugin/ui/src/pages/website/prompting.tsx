/**
 * Prompting Guide Page
 * 
 * Tips and best practices for writing effective prompts - Website Style
 * Based on official documentation from TangoFlux and Stable Audio 2.5
 * 
 * Note: Nav, Footer, and BetaModal are provided by WebsiteLayout
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, AudioLines, Headphones, Wand, Disc } from 'lucide-react'
import { Link } from 'react-router-dom'

type ModeTab = 'designer' | 'producer' | 'creator'

// Designer Mode Tips - Based on TangoFlux capabilities
// TangoFlux excels at multi-event prompts with temporal relationships
const DESIGNER_TIPS = [
  {
    title: 'Describe Multiple Events',
    example: '"Birds chirping and thunder strikes in the distance"',
    description: 'Generate audio with multiple distinct sound events. Combine 3-6 different sounds in your description for rich, layered results.',
  },
  {
    title: 'Specify Temporal Order',
    example: '"A drawer creaks open, papers rustle wildly, then a lock snaps shut"',
    description: 'Use temporal words like "then", "followed by", "as", "while", "after" to describe the sequence of events. This maintains temporal coherence.',
  },
  {
    title: 'Include Spatial Context',
    example: '"Distant growl reverberates through the cavern, soft scraping metal nearby"',
    description: 'Describe the spatial relationship of sounds using words like "distant", "nearby", "close", "far", "echoing", "muffled".',
  },
  {
    title: 'Be Specific About Materials',
    example: '"Metallic clatter of coins on wooden table, followed by glass vials clinking"',
    description: 'Name the materials (metal, wood, glass, fabric, concrete, plastic) to get more accurate sound textures and realistic foley.',
  },
  {
    title: 'Add Movement & Action',
    example: '"Robotic arm whirs frantically while electric plasma arc crackles"',
    description: 'Describe the action producing the sound, not just the sound itself. Use verbs like "scraping", "clattering", "whooshing", "sizzling".',
  },
  {
    title: 'Describe Sound Character',
    example: '"Sharp metallic ping with long reverb tail" or "Dull thud with no resonance"',
    description: 'Specify sonic qualities: sharp/dull, bright/dark, dry/wet, short/sustained, harsh/smooth.',
  },
  {
    title: 'Include Environment',
    example: '"Footsteps in a large cathedral with long natural reverb"',
    description: 'Mention the environment: indoor/outdoor, small room/large hall, underwater, in a forest. This affects the acoustic character.',
  },
  {
    title: 'Use Onomatopoeia',
    example: '"Whoosh of wind, followed by a sharp crack and sizzling sparks"',
    description: 'Words like "whoosh", "crack", "buzz", "hiss", "thump", "clang" help convey the exact sound quality you want.',
  },
  {
    title: 'Specify Intensity & Volume',
    example: '"Subtle rustling leaves, then a loud thunderclap, fading into soft rain"',
    description: 'Describe relative loudness: whisper-quiet, subtle, moderate, loud, deafening. Include dynamics like crescendo or fade.',
  },
  {
    title: 'Add Emotional Context',
    example: '"Tense, unsettling mechanical drone with subtle pulsing"',
    description: 'Emotional descriptors like "eerie", "peaceful", "chaotic", "ominous" guide the overall feel of the sound design.',
  },
  {
    title: 'Describe Texture & Layers',
    example: '"Grainy static underlayer with clean digital beeps on top"',
    description: 'Mention texture: smooth, grainy, rough, clean, distorted. Describe how sounds layer together.',
  },
  {
    title: 'Include Silence & Pauses',
    example: '"Clock ticking steadily, brief silence, then sudden glass shattering"',
    description: 'Silence and pauses create dramatic effect. Use "brief pause", "moment of silence", "interrupted by" to structure timing.',
  },
]

// Producer Mode Tips - Based on Stable Audio 2.5 for loops and one-shots
const PRODUCER_TIPS = [
  {
    title: 'Follow the Optimal Order',
    example: '"Funky disco instrumental, slap bass and rhythm guitar, groovy and energetic, 118 BPM"',
    description: 'Structure: Genre/Style → Key Instruments → Mood/Emotion → BPM. This order is optimized for the generative model.',
  },
  {
    title: 'Use Specific Subgenres',
    example: '"Chicago house", "Outlaw country", "Ambient techno", "Lo-fi hip hop"',
    description: 'Avoid broad terms like "electronic" or "rock". Use specific subgenres for focused, authentic results.',
  },
  {
    title: 'Set the Right BPM',
    example: '"60-80 BPM for ballads, 100-120 BPM for pop/rock, 140-160 BPM for dubstep/metal"',
    description: 'BPM is essential for rhythmic coherence. Match it to your target genre for natural-sounding results.',
  },
  {
    title: 'Detail Your Instruments',
    example: '"808 drum machine, SP-1200 beats, tube-distorted bass, vintage Rhodes piano"',
    description: 'Name specific instruments, synths, drum machines, and their characteristics for precise sound.',
  },
  {
    title: 'Add Production Style',
    example: '"Lo-fi, bedroom-recorded quality" or "Pristine studio-quality, lush and layered"',
    description: 'Describe the recording/production style: raw, polished, vintage, modern, compressed, dynamic.',
  },
  {
    title: 'Specify Rhythm Components',
    example: '"Syncopated hi-hats, punchy kick on 1 and 3, snappy snare with tight reverb"',
    description: 'Detail the percussive elements: drum machines (808, 909, SP-1200), live drums, break beats, programmed patterns.',
  },
  {
    title: 'Include Texture Elements',
    example: '"Atmospheric pads underneath, subtle vinyl crackle, reverb tails"',
    description: 'Add layers that create depth: pads, ambient textures, noise, reverb, delay trails, filtered sweeps.',
  },
  {
    title: 'Reference Recording Quality',
    example: '"Warm analog tape saturation" or "Clean digital precision"',
    description: 'Specify recording aesthetics: tape warmth, digital clarity, vinyl character, cassette lo-fi, pristine studio.',
  },
  {
    title: 'Describe Arrangement Style',
    example: '"Minimalist arrangement with sparse elements" or "Dense, layered wall of sound"',
    description: 'Indicate arrangement density: minimal, sparse, moderate, dense, expansive, stripped-back.',
  },
  {
    title: 'Add Sonic Characteristics',
    example: '"Bright and airy mix" or "Dark, murky low-end focused"',
    description: 'Describe the overall sonic character: bright/dark, warm/cold, clean/dirty, wide/narrow stereo.',
  },
  {
    title: 'Specify Key or Scale',
    example: '"D minor, melancholic feel" or "G major, uplifting progression"',
    description: 'Musical keys convey mood: minor keys for sadness/tension, major keys for happiness/resolution.',
  },
  {
    title: 'Include Dynamic Instructions',
    example: '"Building energy throughout" or "Steady groove, no drops"',
    description: 'For loops, specify if energy should be consistent or evolving. This affects arrangement and intensity.',
  },
]

// Creator Mode Tips - Based on Stable Audio 2.5 for full compositions
const CREATOR_TIPS = [
  {
    title: 'Define a Use Case',
    example: '"Cinematic orchestral piece perfect for opening credits"',
    description: 'Adding context like "perfect for a long drive", "ideal for a boss battle", "suitable for meditation" guides the composition structure.',
  },
  {
    title: 'Use Titles for Direction',
    example: '"An epic orchestral piece titled \'Rise of the Phoenix\'"',
    description: 'Adding a title gives the model creative direction. Titles like "Rebellion", "Serenity", "Chaos" influence mood and development.',
  },
  {
    title: 'Include Geographic Context',
    example: '"Detroit techno", "Nashville country", "Ibiza house", "Tokyo city pop"',
    description: 'Location references capture regional styles: Chicago house, New York hip hop, Berlin techno, Jamaican dub.',
  },
  {
    title: 'Layer Musical Elements',
    example: '"Soaring accordion solo, tape-driven rattly drum-kit, supporting bass lines, string section swells"',
    description: 'Describe primary instruments (melody), supporting instruments (harmony), rhythm section, and texture layers.',
  },
  {
    title: 'Use Sophisticated Mood Words',
    example: '"Euphoric" instead of "happy", "Melancholic" instead of "sad", "Soaring" instead of "energetic"',
    description: 'Precise emotional descriptors yield better results. Use: wistful, triumphant, haunting, exhilarating, contemplative.',
  },
  {
    title: 'Reference Eras & Styles',
    example: '"80s gated reverb drums", "90s grunge distortion", "70s analog warmth", "60s psychedelic swirl"',
    description: 'Era references capture specific production aesthetics. Combine eras for unique sounds.',
  },
  {
    title: 'Describe Song Structure',
    example: '"Starts sparse, builds to a powerful chorus, ends with a quiet outro"',
    description: 'Guide the arrangement: intro, verse, chorus, bridge, breakdown, build-up, drop, outro. Describe energy flow.',
  },
  {
    title: 'Specify Primary & Secondary Instruments',
    example: '"Piano carries the melody, strings provide countermelody, bass anchors the harmony"',
    description: 'Define roles: which instrument leads, which supports. This creates clearer arrangements.',
  },
  {
    title: 'Add Atmosphere & Texture',
    example: '"Lush reverb on vocals, atmospheric synth pads, subtle tape hiss"',
    description: 'Texture elements add depth: reverb tails, ambient noise, pad layers, field recordings, granular textures.',
  },
  {
    title: 'Define Energy & Tempo Feel',
    example: '"Driving, relentless energy at 140 BPM" or "Languid, laid-back groove at 75 BPM"',
    description: 'Combine BPM with energy descriptors: driving, laid-back, frantic, relaxed, building, steady.',
  },
  {
    title: 'Include Cultural References',
    example: '"Bollywood strings", "Celtic folk melodies", "Brazilian bossa nova rhythm"',
    description: 'Cultural references add authenticity: traditional instruments, regional scales, characteristic rhythms.',
  },
  {
    title: 'Describe Emotional Journey',
    example: '"Starts melancholic, shifts to hopeful, culminates in triumphant"',
    description: 'Great compositions evolve emotionally. Describe the arc: tension/release, dark/light, chaos/peace.',
  },
  {
    title: 'Specify Vocal Style (if needed)',
    example: '"Ethereal female vocals with heavy reverb" or "Gritty male vocals, spoken word style"',
    description: 'If you want vocals, describe: male/female, clean/distorted, lead/background, choral, wordless harmonies.',
  },
  {
    title: 'Reference Iconic Sounds',
    example: '"Massive Moog bass", "Juno-106 pads", "Fender Rhodes warmth"',
    description: 'Reference iconic synths and instruments for specific tonal qualities known to musicians and producers.',
  },
  {
    title: 'Add Production Polish',
    example: '"Radio-ready mix with punchy drums and clear vocals"',
    description: 'Describe mix quality: radio-ready, raw demo, bedroom production, professional master, vintage warmth.',
  },
]

const GENERAL_TIPS = [
  {
    icon: Wand,
    title: 'Enhance your prompt',
    description: 'SONA engine uses powerful GPT models to make your prompt detailed, creative and optimized for audio generation.',
  },
  {
    icon: Lightbulb,
    title: 'Learn to prompt',
    description: 'Read the documentation carefully to understand how SONA works from the inside out. Good prompts yield better results. Always prompt in English.',
  },
  {
    icon: AudioLines,
    title: 'One mode, one function',
    description: 'Use Designer Mode for sound effects and foley, Producer Mode for One shots and loops, Creator Mode for complete music composition or stems. Each mode is optimized for its specific purpose.',
  },
]

const MODE_CONFIG = {
  designer: {
    label: 'Designer',
    icon: AudioLines,
    color: 'var(--sona-designer)',
    tips: DESIGNER_TIPS,
    description: 'Sound effects, foley, ambiences',
  },
  producer: {
    label: 'Producer',
    icon: Headphones,
    color: 'var(--sona-producer)',
    tips: PRODUCER_TIPS,
    description: 'Loops, one-shots',
  },
  creator: {
    label: 'Creator',
    icon: Disc,
    color: 'var(--sona-creator)',
    tips: CREATOR_TIPS,
    description: 'Songs, stems',
  },
}

export default function PromptingGuidePage() {
  const [activeTab, setActiveTab] = useState<ModeTab>('designer')
  const activeMode = MODE_CONFIG[activeTab]

  return (
    <>
      <section className="bg-gradient-to-br from-primary to-black relative pt-32 lg:pt-40 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-32">
          <h1 className="font-display text-4xl md:text-7xl font-bold mb-4">
            Prompting Better
          </h1>

          <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-lg mb-4">
            Want to generate audio that is worth listening to? It all starts with the prompt.
          </p>

          {/* Changelog */}
          <div className="mt-6 mb-32 flex flex-col ">
            <Link to="/changelog" className="text-blue-500  hover:underline decoration-blue-500">View Changelog ↗</Link>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24">

        {/* General tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {GENERAL_TIPS.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 dark:bg-black/20 border border-landing-text-light/10 dark:border-landing-text-dark/10 hover:border-landing-accent/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-landing-accent/10 flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-landing-accent" />
                </div>
                <h3 className="font-medium mb-2">{tip.title}</h3>
                <p className="text-sm text-landing-text-light/70 dark:text-landing-text-dark/70">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mode Tips with Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Mode-Specific Tips
          </h2>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {(Object.keys(MODE_CONFIG) as ModeTab[]).map((mode) => {
              const config = MODE_CONFIG[mode]
              const isActive = activeTab === mode
              return (
                <button
                  key={mode}
                  onClick={() => setActiveTab(mode)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'text-white' 
                      : 'bg-white/5 dark:bg-black/20 text-landing-text-light/70 dark:text-landing-text-dark/70 hover:bg-white/10 dark:hover:bg-black/30'
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? config.color : undefined,
                  }}
                >
                  <config.icon className="w-5 h-5" />
                  <span className="font-medium">{config.label}</span>
                </button>
              )
            })}
          </div>

          {/* Model Badge */}
          <div className="flex justify-center mb-6">
            <div 
              className={` inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm`}
              style={{
                // backgroundColor: `color-mix(in srgb, ${activeMode.color} 50%, transparent)`,
                color: activeMode.color,
              }}
            >
              {/* <span className="font-medium">Powered by {activeMode.model}</span> */}
              <span className="font-bold">{activeMode.description}</span>
            </div>
          </div>

          {/* Tips Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeMode.tips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-2xl backdrop-blur-sm bg-landing-surface-dark dark:bg-black/20 border border-landing-text-light/10 dark:border-landing-text-dark/10"
                >
                  <h3 className="font-medium mb-2 text-white">{tip.title}</h3>
                  <p className="text-sm text-landing-subtext-dark dark:text-landing-text-dark/70 mb-3">{tip.description}</p>
                  <code 
                    className="block px-4 py-2 rounded-lg text-sm"
                    style={{
                      color: activeMode.color,
                      backgroundColor: `color-mix(in srgb, ${activeMode.color} 10%, transparent)`,
                    }}
                  >
                    {tip.example}
                  </code>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Example prompts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-8 rounded-3xl backdrop-blur-sm bg-white/5 dark:bg-black/20 border border-landing-text-light/10 dark:border-landing-text-dark/10"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Try These Prompts
          </h2>
          <div className="space-y-3">
            {[
              { prompt: 'A drawer creaks open, papers rustle wildly, and a lock snaps shut', mode: 'designer' as ModeTab },
              { prompt: 'Chicago house instrumental, 808 drums and funky bass, groovy and energetic, 124 BPM', mode: 'producer' as ModeTab },
              { prompt: 'Cinematic orchestral piece titled "Dawn of Heroes" perfect for opening credits, epic and soaring', mode: 'creator' as ModeTab },
              { prompt: 'Metallic impact with debris scattering on concrete floor, then glass shattering nearby', mode: 'designer' as ModeTab },
              { prompt: 'Lo-fi hip hop beat, dusty vinyl samples and mellow Rhodes, relaxed and nostalgic, 85 BPM', mode: 'producer' as ModeTab },
            ].map((item, index) => (
              <div
                key={index}
                className="px-4 py-3 rounded-xl text-sm text-landing-subtext-dark dark:text-landing-text-dark/80 bg-landing-surface-dark dark:bg-black/40 font-mono flex items-start gap-3"
              >
                <span 
                  className="px-2 py-0.5 rounded text-xs font-sans font-medium shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${MODE_CONFIG[item.mode].color} 20%, transparent)`,
                    color: MODE_CONFIG[item.mode].color,
                  }}
                >
                  {MODE_CONFIG[item.mode].label}
                </span>
                <span>"{item.prompt}"</span>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </>
  )
}
