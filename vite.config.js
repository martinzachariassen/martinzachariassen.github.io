import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        preserveSymlinks: false, // Ensure Vite resolves actual file paths, not symlinks
    },
    build: {
        outDir: 'dist', // Specify output directory
        emptyOutDir: true, // Clean the output directory before building
        sourcemap: false, // Disable source maps to reduce output size
    },
});
