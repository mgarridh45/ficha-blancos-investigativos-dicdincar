import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')

  return {

    base: '/',

    plugins: [react()],

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
