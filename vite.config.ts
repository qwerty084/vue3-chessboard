import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    // keep CSS compatible with older browsers (e.g. no media query range syntax)
    cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'TheChessboard',
      formats: ['es'],
      // keep the pre-Vite 6 file name, it is exported as 'vue3-chessboard/style.css'
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // don't let the minifier introduce syntax newer than the source,
        // e.g. rewriting `a || (a = b)` to `a ||= b` (ES2021)
        minify: { compress: { target: 'es2020' } },
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
