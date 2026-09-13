import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    // Havok ships its own .wasm next to the ES module; pre-bundling breaks the path.
    exclude: ["@babylonjs/havok"],
  },
});
