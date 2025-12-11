import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Mobile-first breakpoints según PRD
        'xs': '320px',   // Móvil pequeño
        'sm': '640px',   // Móvil grande
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Desktop grande
        '2xl': '1536px', // Desktop extra grande
      },
      colors: {
        // Paleta según PRD - Unificada con globals.css
        primary: {
          DEFAULT: 'hsl(205 65% 35%)', // #2c6b8e - Azul río amazonas (unificado con globals.css)
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#00A86B', // Verde selva
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF6B35', // Naranja atardecer
          foreground: '#FFFFFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: '#FFFFFF',
        foreground: '#1F2937',
        muted: {
          DEFAULT: '#F9FAFB',
          foreground: '#6B7280',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#0066CC',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontSize: {
        // Tipografía según PRD
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }], // 36px
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }], // 30px
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // 24px
        'h4': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }], // 20px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      },
      spacing: {
        // Espaciado responsivo
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
