export default defineConfig({
    base: '/', // Use '/repo-name/' if deploying to a subpath
    build: {
        outDir: 'dist',
        emptyOutDir: true, // Ensures a clean build
        sourcemap: false, // Prevent unnecessary source maps
    },
});
