import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  permissions: [],
  content_scripts: [
    {
      js: ["src/content/index.ts"],
      matches: ["https://*.youtube.com/*"],
    },
  ],
});
