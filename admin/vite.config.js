import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  base: '/admin',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'mixed-decls',
          'legacy-js-api',
          'abs-percent',
          'if-function',
        ],
        quietDeps: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    // Polyfill process.env for libraries that expect it
    'process.env': {},
  },
});
