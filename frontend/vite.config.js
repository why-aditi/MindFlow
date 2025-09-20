import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.VITE_FRONTEND_PORT) || 3000,
      host: "0.0.0.0",
      strictPort: false,
    },
  };
});
