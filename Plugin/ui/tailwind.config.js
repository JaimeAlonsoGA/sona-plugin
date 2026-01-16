/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: '#D97706',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			sona: {
  				bg: '#0a0a0a',
  				surface: '#141414',
  				border: '#2a2a2a',
  				accent: '#6366f1',
  				'accent-hover': '#818cf8',
  				// Landing page colors
  				void: '#0F0F11',
  				'surface-dark': '#1A1A1D',
  				cream: '#FDFBF7',
  				gold: '#FCD34D',
  				designer: '#2DD4BF',
  				producer: '#F59E0B',
  				creator: '#8B5CF6',
  			},
  			'landing': {
  				'bg-light': '#FAFAF9',
  				'bg-dark': '#0F0F11',
  				'surface-light': '#FFFFFF',
  				'surface-dark': '#18181B',
  				'text-light': '#1C1917',
  				'text-dark': '#F5F5F4',
  				'subtext-light': '#57534E',
  				'subtext-dark': '#A8A29E',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			display: ['Space Grotesk', 'sans-serif'],
  			body: ['Inter', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'xl': '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  		},
  		animation: {
  			'float': 'float 6s ease-in-out infinite',
  			'shimmer': 'shimmer 2s infinite',
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			shimmer: {
  				'0%': { transform: 'translateX(-100%) skewX(-12deg)' },
  				'100%': { transform: 'translateX(200%) skewX(-12deg)' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
