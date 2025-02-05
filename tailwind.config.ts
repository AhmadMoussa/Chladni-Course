import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        editor: {
          bg: '#1e1e1e',
          border: '#3c3c3c',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            'h1': {
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            // Make math display blocks stand out
            '.math': {
              padding: '1em 0',
              overflowX: 'auto',
            },
            // Ensure math is centered
            '.math-display': {
              display: 'flex',
              justifyContent: 'center',
            },
            // Add some spacing around equations
            'mjx-container': {
              margin: '1em 0',
            }
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
