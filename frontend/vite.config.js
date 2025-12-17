import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Device Service Specific Route (Must come before /api generic rule)
      "/api/devices": {
        target: process.env.DEVICE_SERVICE_URL || "http://localhost:32111",
        changeOrigin: true,
        secure: false,
      },

      // Loan Service
      "/api": {
        target: process.env.LOAN_SERVICE_URL || "http://localhost:32112",
        changeOrigin: true,
        secure: false,
      },

      // Device Service
      "/api-device": {
        target: process.env.DEVICE_SERVICE_URL || "http://localhost:32111",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-device/, "/api"),
      },
    },
  },
});