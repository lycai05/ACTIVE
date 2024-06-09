import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import Components from 'unplugin-vue-components/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
      // Components({ /* options */ }),
],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // hmr: {
    //   host: '127.0.0.1'
    // }
  },
  build: {
    lib: {
      entry: './src/browser/elements/Expresso/index.ts',
      // sentry: './src/main.ts',
      name: 'Expresso',
      fileName: (format) => `Expresso.${format}.js`
    },
    rollupOptions: {
      // Make sure to externalize Vue and any other dependencies you do not want to bundle
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    // Ensures that the output is ES module
    minify: false // Optional: Disable minification for easier debugging
  },
  define: {
    'process.env': {}
  }
})
