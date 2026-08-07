import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// GitHub Pages sirve el repo bajo /rutina/. En dev la base es "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/rutina/" : "/",
  plugins: [preact(), tailwindcss()],
  build: { target: "es2022" }
}));
