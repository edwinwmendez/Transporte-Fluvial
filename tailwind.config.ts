import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Breakpoints responsive según PRD
      screens: {
        'xs': '320px',      // Móvil pequeño
        'sm': '640px',      // Móvil grande
        'md': '768px',      // Tablet
        'lg': '1024px',     // Desktop pequeño
        'xl': '1280px',     // Desktop
        '2xl': '1536px',    // Desktop grande
      },
      colors: {
        // Paleta de colores del PRD
        primary: {
          DEFAULT: '#0066CC', // Azul río
          dark: '#0052A3',
          light: '#3385D9',
        },
        secondary: {
          DEFAULT: '#00A86B', // Verde selva
          dark: '#00855A',
          light: '#33B885',
        },
        accent: {
          DEFAULT: '#FF6B35', // Naranja atardecer
          dark: '#E55A2B',
          light: '#FF8C66',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Neutrales
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
        background: {
          DEFAULT: '#FFFFFF',
          alternate: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Tipografía responsive del PRD
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],      // 36px
        'h1-mobile': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }], // 28px móvil
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],    // 30px
        'h2-mobile': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px móvil
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],      // 24px
        'h3-mobile': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px móvil
        'h4': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],     // 20px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],       // 16px
        'body-mobile': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }], // 15px móvil
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
      },
      spacing: {
        // Espaciado responsive
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [],
};

export default config;
