import { readFile, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("dist/_expo/static/js/web");
const fontPath = path.resolve(
  "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"
);
const fontData = (await readFile(fontPath)).toString("base64");
const files = (await readdir(outputDir)).filter((name) => name.endsWith(".js"));
const htmlFiles = (await readdir(path.resolve("dist"))).filter((name) => name.endsWith(".html"));
const assetPath = /\/assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/Ionicons\.[a-f0-9]+\.ttf/g;

if (!files.length) throw new Error("No Expo web bundle found in dist.");

let replaced = 0;
for (const name of files) {
  const filePath = path.join(outputDir, name);
  const source = await readFile(filePath, "utf8");
  const updated = source.replace(assetPath, () => {
    replaced += 1;
    return `data:font/ttf;base64,${fontData}`;
  });
  if (updated !== source) await writeFile(filePath, updated);
}

// Vercel's static drop keeps HTML and JS files but can omit the exported
// assets directory. Expo also emits a global @font-face in each HTML route,
// so inline that reference there as well (and remove the redundant preload).
for (const name of htmlFiles) {
  const filePath = path.resolve("dist", name);
  const source = await readFile(filePath, "utf8");
  const updated = source.replace(assetPath, () => `data:font/ttf;base64,${fontData}`)
    .replace(/<link rel="preload" href="data:font\/ttf;base64,[^"]+" as="font" crossorigin=""\s*\/>/g, "");
  if (updated !== source) await writeFile(filePath, updated);
}

if (!replaced) throw new Error("Ionicons font asset reference was not found in the web bundle.");
console.log(`Inlined Ionicons font into ${files.length} web bundle(s).`);
