import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        theme: {
          extend: {
            backgroundImage: {
              'grid-pattern': 'linear-gradient(to right, rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
            },
            animation: {
              'float': 'float 6s ease-in-out infinite',
              'float-delayed': 'float 6s ease-in-out 2s infinite',
              'scroll': 'scroll 2s ease-in-out infinite',
            },
            keyframes: {
              float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
              },
              scroll: {
                '0%': { transform: 'translateY(0)', opacity: '1' },
                '100%': { transform: 'translateY(15px)', opacity: '0' },
              }
            },
            boxShadow: {
              'glow': '0 0 15px rgba(249,115,22,0.25)',
            },
          },
        },
        plugins: [],
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
  },
})



