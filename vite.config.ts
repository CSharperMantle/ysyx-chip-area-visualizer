import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{html,js,css}", "**/*.{png,svg,txt}"],
        navigateFallbackDenylist: [/^.*\.map$/],
      },
      manifest: {
        name: "Y Chip Area Visualizer",
        short_name: "YChipAreaVis",
        description: "Visualize Yosys `stat` reports.",
        theme_color: "#2196f3",
        display: "standalone",
        orientation: "landscape",
        icons: [
          {
            src: "./web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "./web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      treeshake: "recommended",
    },
  },
})
