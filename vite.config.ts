import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TOA_Request_Formspree/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
