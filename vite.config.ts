import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'med-connecter-alb-*.elb.amazonaws.com',
      '*.elb.amazonaws.com',
      'localhost',
      '127.0.0.1'
    ],
    // Allow all hosts in production/container environment
    hmr: {
      host: '0.0.0.0'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
