import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    // Use esbuild (default, fastest) for minification — good enough for this bundle size
    minify: "esbuild",

    // Inline assets smaller than 4 kb as base64 to save round-trips
    assetsInlineLimit: 4096,

    // Raise the warning threshold — we know the bundle is small
    chunkSizeWarningLimit: 300,

    // Tighter source maps for production (none = smallest)
    sourcemap: false,

    rollupOptions: {
      output: {
        // Split vendor (react/react-dom) from app code for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
        // Predictable, cache-friendly file names
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },

    // Target modern browsers only — smaller output, no legacy polyfills
    target: "es2022",
  },
});
