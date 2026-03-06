import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",  // explicitly bind to localhost
    port: 5173,          // explicitly set port
    strictPort: true,    // fail if port is already used
  }
});
