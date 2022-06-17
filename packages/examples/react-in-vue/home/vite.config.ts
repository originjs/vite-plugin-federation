import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import federation from '@dilesoft/vite-plugin-federation-dynamic'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    federation({
      name: 'home',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.jsx'
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
