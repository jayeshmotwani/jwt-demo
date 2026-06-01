import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api is forwarded to the FastAPI backend.
      // This means you can call fetch("/api/demo") in React without CORS issues
      // during local development.
      "/api": "http://localhost:8000",
    },
  },
});
