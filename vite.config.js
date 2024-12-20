import { defineConfig } from 'vite';

export default defineConfig({
    base: '/', // Adjust to '/repo-name/' if deploying to a subpath
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false, // Optional: Prevent generating source maps
    },
});
