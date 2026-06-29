import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:         resolve(__dirname, 'index.html'),
        login:        resolve(__dirname, 'login.html'),
        editor:       resolve(__dirname, 'editor.html'),
        items:        resolve(__dirname, 'items.html'),
        visitDetail:  resolve(__dirname, 'visit-detail.html'),
      }
    }
  }
})