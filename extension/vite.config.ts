import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import zipPlugin from "vite-plugin-zip-pack";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import manifest from "./src/manifest";
import pkg from "./package.json";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    solidPlugin(),
    crx({ manifest, contentScripts: { injectCss: true } }),
    zipPlugin({
      outDir: "release",
      outFileName: `${pkg.name}-${pkg.version}.zip`,
    }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
