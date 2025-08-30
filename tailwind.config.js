/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',   // Extra small devices (large phones)
      'sm': '640px',   // Small devices (tablets)
      'md': '768px',   // Medium devices (small laptops)
      'lg': '1024px',  // Large devices (desktops)
      'xl': '1280px',  // Extra large devices (large desktops)
      '2xl': '1536px', // 2X large devices (larger desktops)
      '3xl': '1792px'  // Ultra wide screens
    },
    extend: {
      colors: {
        darkBg: '#1A1A1A', // Dark background from your summary, matches the images' blackish base
        neonCyan: '#00FFFF', // Bright cyan blue for glows, like in the logo and buttons
        neonPink: '#FF00FF', // Magenta pink for accents, matching the logo's edges
        neonText: '#FFFFFF', // White text for contrast on dark bg
        'neon-green': '#00FF00', // Bright green for admin accents
        'neon-blue': '#0080FF', // Bright blue
        'neon-purple': '#8000FF', // Purple accent
        'neon-orange': '#FF8000', // Orange accent
        'neon-yellow': '#FFFF00', // Yellow accent
        'neon-sunset': '#FF4500', // Bright vibrant orange for selected elements
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
        'fluid-5xl': 'clamp(2.5rem, 2.2rem + 2vw, 3.5rem)',
        'fluid-6xl': 'clamp(3rem, 2.5rem + 2.5vw, 4rem)'
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      boxShadow: {
        neon: '0 0 10px #00FFFF, 0 0 20px #FF00FF, 0 0 30px #00FFFF', // Multi-color glow shadow to mimic neon tube lighting
        'neon-sm': '0 0 5px #00FFFF, 0 0 10px #FF00FF',
        'neon-lg': '0 0 15px #00FFFF, 0 0 30px #FF00FF, 0 0 45px #00FFFF',
      },
      borderColor: {
        neon: '#00FFFF', // Default neon border, can override with pink if needed
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(to right, #00FFFF, #FF00FF)', // Gradient for buttons/logos to match the multi-hue in images
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Subtle glow pulse for hover effects
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 }, // Fades slightly for a flickering neon feel
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: 0 },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
