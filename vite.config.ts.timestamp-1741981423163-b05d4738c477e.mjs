// vite.config.ts
import { defineConfig } from "file:///app/node_modules/vite/dist/node/index.js";
import react from "file:///app/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { tempo } from "file:///app/node_modules/tempo-devtools/dist/vite/index.js";
var conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}
var vite_config_default = defineConfig({
  plugins: [
    react({
      plugins: [...conditionalPlugins]
    }),
    tempo()
  ],
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : void 0
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IHRlbXBvIH0gZnJvbSBcInRlbXBvLWRldnRvb2xzL2Rpc3Qvdml0ZVwiO1xuXG4vLyBBZGQgY29uZGl0aW9uYWwgcGx1Z2lucyBmb3IgVGVtcG9cbmNvbnN0IGNvbmRpdGlvbmFsUGx1Z2lucyA9IFtdO1xuaWYgKHByb2Nlc3MuZW52LlRFTVBPID09PSBcInRydWVcIikge1xuICBjb25kaXRpb25hbFBsdWdpbnMucHVzaChbXCJ0ZW1wby1kZXZ0b29scy9zd2NcIiwge31dKTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7XG4gICAgICBwbHVnaW5zOiBbLi4uY29uZGl0aW9uYWxQbHVnaW5zXSxcbiAgICB9KSxcbiAgICB0ZW1wbygpLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgYWxsb3dlZEhvc3RzOiBwcm9jZXNzLmVudi5URU1QTyA9PT0gXCJ0cnVlXCIgPyB0cnVlIDogdW5kZWZpbmVkLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbXCJsdWNpZGUtcmVhY3RcIl0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOEwsU0FBUyxvQkFBb0I7QUFDM04sT0FBTyxXQUFXO0FBQ2xCLFNBQVMsYUFBYTtBQUd0QixJQUFNLHFCQUFxQixDQUFDO0FBQzVCLElBQUksUUFBUSxJQUFJLFVBQVUsUUFBUTtBQUNoQyxxQkFBbUIsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxHQUFHLGtCQUFrQjtBQUFBLElBQ2pDLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLGNBQWMsUUFBUSxJQUFJLFVBQVUsU0FBUyxPQUFPO0FBQUEsRUFDdEQ7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
