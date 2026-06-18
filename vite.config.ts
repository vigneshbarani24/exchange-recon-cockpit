import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port is fixed to 5173 because the OAuth redirect URI registered in
// the UiPath External Application must match exactly.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
