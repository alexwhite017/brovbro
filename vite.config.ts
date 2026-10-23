import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Tailwind v4 is a Vite plugin now — no tailwind.config.js, no postcss.config.js.
// All theme customization lives in src/index.css under @theme.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
