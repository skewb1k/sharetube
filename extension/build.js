import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = process.env.ST_HOST || "http://localhost:9090";
const HOST_REGEX = /\$ST_HOST/g;

let manifest = readFileSync("src/manifest.json", "utf-8");
manifest = manifest.replaceAll(HOST_REGEX, HOST);
writeFileSync("dist/manifest.json", manifest);

const contentScriptPath = "dist/content-script/index.js";
let contentScript = readFileSync(contentScriptPath, "utf-8");
contentScript = contentScript.replaceAll(HOST_REGEX, HOST);
writeFileSync(contentScriptPath, contentScript);
