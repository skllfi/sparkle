import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

interface TweakMeta {
  name?: string;
  title?: string;
  description?: string;
  category?: string[];
  recommended?: boolean;
  reversible?: boolean;
  addedversion?: string;
  updatedversion?: string;
}

const root = process.cwd();
const tweaksDir = path.join(root, "tweaks");
const registryPath = path.join(tweaksDir, "registry.json");
const registryScriptsPath = path.join(tweaksDir, "registry-scripts.json");

async function buildRegistry(): Promise<void> {
  const folders = await fs.readdir(tweaksDir);
  const registryNormal: any[] = [];
  const registryScripts: any[] = [];

  for (const folder of folders) {
    const tweakPath = path.join(tweaksDir, folder);
    const stat = await fs.stat(tweakPath).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const metaPath = path.join(tweakPath, "meta.json");
    const applyPath = path.join(tweakPath, "apply.ps1");
    const unapplyPath = path.join(tweakPath, "unapply.ps1");

    try {
      const metaRaw = await fs.readFile(metaPath, "utf8");
      const meta: TweakMeta = JSON.parse(metaRaw);

      const baseTweak = {
        id: meta.name || folder,
        title: meta.title || folder,
        description: meta.description || "",
        category: meta.category || [],
        recommended: !!meta.recommended,
        reversible: meta.reversible !== false,
        addedversion: meta.addedversion,
        updatedversion: meta.updatedversion,
        docsurl: `https://docs.getsparkle.net/tweaks/${folder}`,
        source: `https://github.com/Parcoil/Sparkle/blob/v2/tweaks/${folder}/meta.json`,
      };

      registryNormal.push(baseTweak);

      let applyScript: string | null = null;
      let unapplyScript: string | null = null;

      try {
        applyScript = await fs.readFile(applyPath, "utf8");
      } catch {
        console.warn(`⚠️ No apply.ps1 found for ${folder}`);
      }

      if (baseTweak.reversible) {
        try {
          unapplyScript = await fs.readFile(unapplyPath, "utf8");
        } catch {
          console.warn(`⚠️ No unapply.ps1 found for ${folder}`);
        }
      }

      registryScripts.push({
        ...baseTweak,
        scripts: {
          apply: applyScript,
          unapply: unapplyScript,
        },
      });
    } catch (e: any) {
      console.error(`⚠️ Failed to read tweak in ${folder}: ${e.message}`);
    }
  }

  const timestamp = new Date().toISOString();

  const normalOutput = { version: timestamp, tweaks: registryNormal };
  await fs.writeFile(registryPath, JSON.stringify(normalOutput, null, 2));
  console.log(`✅ registry.json created at ${registryPath}`);

  const scriptsOutput = { version: timestamp, tweaks: registryScripts };
  await fs.writeFile(
    registryScriptsPath,
    JSON.stringify(scriptsOutput, null, 2),
  );
  console.log(`✅ registry-scripts.json created at ${registryScriptsPath}`);
}

function buildElectron(): void {
  console.log("🚀 Building Electron app...");
  execSync("npm run build:vite && electron-builder", { stdio: "inherit" });
}

const args = process.argv.slice(2);
const shouldBuildRegistry = args.includes("--registry") || args.length === 0;
const shouldBuildApp = args.includes("--build") || args.length === 0;

(async () => {
  if (shouldBuildRegistry) await buildRegistry();
  if (shouldBuildApp) buildElectron();
})();
