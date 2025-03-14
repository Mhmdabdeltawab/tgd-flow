import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// Add conditional plugins for Tempo
const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/dist/swc-plugin", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [...conditionalPlugins],
    }),
    tempo(),
  ],
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
