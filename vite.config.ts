import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  define: {
    // Injected by CI from the git tag; falls back to "dev" locally
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION ?? "dev"),
  },

  build: {
    // Use terser for minification with aggressive compression and dead-code drops
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 2,
      },
      mangle: { toplevel: true },
      format: { comments: false },
    },

    // Inline assets smaller than 4 kb as base64 to save round-trips
    assetsInlineLimit: 4096,

    // Raise the warning threshold — we know the bundle is small
    chunkSizeWarningLimit: 300,

    // Tighter source maps for production (none = smallest)
    sourcemap: false,

    // Enable CSS code splitting
    cssCodeSplit: true,

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
      // Tree-shake anything unused
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },

    // Target modern browsers only — smaller output, no legacy polyfills
    target: "es2022",
  },
});
