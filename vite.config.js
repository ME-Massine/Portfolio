import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Keep the heavy, rarely-changing 3D stack in its own cacheable chunk.
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion', 'lenis'],
        },
      },
    },
  },
});
