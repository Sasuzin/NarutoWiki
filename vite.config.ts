import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Base relativa: o build funciona servido de subpasta (GitHub Pages etc.)
  // sem quebrar as rotas, porque a navegacao inteira e por hash.
  base: "./",
  server: { open: true },
});
