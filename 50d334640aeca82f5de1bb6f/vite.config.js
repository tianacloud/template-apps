import { defineConfig } from "vite";
export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    target: "es2022",
    lib: { entry: "src/main.js", formats: ["es"], fileName: "assets/app" },
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
  },
});
