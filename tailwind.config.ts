import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/** Color with a DEFAULT + foreground pair, from the CSS variables in globals.css. */
const pair = (name: string) => ({
  DEFAULT: `hsl(var(--${name}))`,
  foreground: `hsl(var(--${name}-foreground))`,
});

/** Primary also has a generated 50–950 scale (bg-primary-100, text-primary-700, …). */
const withShades = (name: string) => ({
  DEFAULT: `hsl(var(--${name}))`,
  foreground: `hsl(var(--${name}-foreground))`,
  50: `hsl(var(--${name}-50))`,
  100: `hsl(var(--${name}-100))`,
  200: `hsl(var(--${name}-200))`,
  300: `hsl(var(--${name}-300))`,
  400: `hsl(var(--${name}-400))`,
  500: `hsl(var(--${name}-500))`,
  600: `hsl(var(--${name}-600))`,
  700: `hsl(var(--${name}-700))`,
  800: `hsl(var(--${name}-800))`,
  900: `hsl(var(--${name}-900))`,
  950: `hsl(var(--${name}-950))`,
});

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Direct mappings
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: withShades('primary'),
        secondary: pair('secondary'),
        // Subtle surface for hover/selected states.
        accent: pair('accent'),
        // The brand accent color from palette.json.
        highlight: pair('highlight'),
        destructive: pair('destructive'),
        muted: pair('muted'),
        card: pair('card'),
        popover: pair('popover'),
        success: pair('success'),
        warning: pair('warning'),
        info: pair('info'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
