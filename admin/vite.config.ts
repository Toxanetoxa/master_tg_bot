import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['jess-nonlarcenous-nonsuspensively.ngrok-free.dev'],
    proxy: {
      '/api': 'http://localhost:5174',
      '/auth': 'http://localhost:5174',
    },
  },
});
