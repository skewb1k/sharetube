import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = process.env.ST_HOST || "http://localhost:9090";
const HOST_REGEX = /\$ST_HOST/g;

let manifest = readFileSync("src/manifest.json", "utf-8");
manifest = manifest.replaceAll(HOST_REGEX, HOST);
writeFileSync("dist/manifest.json", manifest);

const bgScriptPath = "dist/background-script/index.js";
let bgScript = readFileSync(bgScriptPath, "utf-8");
bgScript = bgScript.replaceAll(HOST_REGEX, HOST);
writeFileSync(bgScriptPath, bgScript);
