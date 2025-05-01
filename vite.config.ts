import react from "@vitejs/plugin-react-swc"
import vike from "vike/plugin"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vike(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{html,js,css}", "**/*.{png,svg,txt}"],
        navigateFallbackDenylist: [/^.*\.map$/],
      },
      manifest: false,
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      treeshake: "recommended",
    },
  },
})
