import type { Config } from 'tailwindcss'
import { heroui } from "@heroui/react"

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontSize: {
        'header-semi-bold': ['1.53rem', { lineHeight: '2rem', fontWeight: '600' }],
        'header-bold': ['1.31rem', { lineHeight: '2rem' }],
        'semiheader-semi-bold': ['1.09rem', { lineHeight: '2rem' }],
        'normal-bold': ['0.88rem', { lineHeight: '2rem' }],
        'normal-regular': ['0.88rem', { lineHeight: '2rem' }],
        'normal-regular-gray': ['0.88rem', { lineHeight: '2rem' }],
        'small-regular-gray': ['0.75rem', { lineHeight: '2rem' }]
      },
      boxShadow: {
        up: '0 -4px 8px 0px rgba(195, 195, 195, 0.225)',
        down: '0 2px 6px 0px rgba(181, 181, 181, 0.25)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        primary: '#374bff',
        secondary: '#151515'
      }
    },
    screens: {
      sm: '350px',
      md: '600px',
      lg: '1024px',
      xl: '1280px'
    }
  },
  darkMode: 'class',
  plugins: [heroui()]
}
export default config
