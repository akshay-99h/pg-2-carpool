import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        heading: ['var(--font-merriweather)', 'serif'],
        body: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px -28px rgba(17, 74, 42, 0.35)',
        glow: '0 0 0 1px rgba(53, 143, 88, 0.18), 0 28px 50px -30px rgba(17, 74, 42, 0.42)',
      },
      backgroundImage: {
        'leaf-mesh':
          'radial-gradient(circle at 20% 10%, rgba(56, 154, 94, 0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(122, 30, 43, 0.16), transparent 30%), radial-gradient(circle at 70% 90%, rgba(38, 123, 75, 0.18), transparent 45%)',
        'orchard-haze':
          'radial-gradient(circle at 12% 14%, rgba(47, 158, 68, 0.16), transparent 32%), radial-gradient(circle at 86% 2%, rgba(122, 30, 43, 0.22), transparent 30%), radial-gradient(circle at 74% 82%, rgba(35, 105, 59, 0.2), transparent 42%)',
        'orchard-grid':
          'linear-gradient(rgba(76, 132, 96, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 132, 96, 0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '26px 26px',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
