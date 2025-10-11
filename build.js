import fs from "fs/promises"
import path from "path"
import { execSync } from "child_process"

const root = process.cwd()
const tweaksDir = path.join(root, "tweaks")
const registryPath = path.join(tweaksDir, "registry.json")

async function buildRegistry() {
  const folders = await fs.readdir(tweaksDir)
  const tweaks = []

  for (const folder of folders) {
    const tweakPath = path.join(tweaksDir, folder)
    const stat = await fs.stat(tweakPath).catch(() => null)
    if (!stat?.isDirectory()) continue

    const metaPath = path.join(tweakPath, "meta.json")
    try {
      const metaRaw = await fs.readFile(metaPath, "utf8")
      const meta = JSON.parse(metaRaw)

      tweaks.push({
        id: meta.name || folder,
        title: meta.title || folder,
        description: meta.description || "",
        category: meta.category || [],
        recommended: !!meta.recommended,
        reversible: meta.reversible !== false,
        addedversion: meta.addedversion,
        updatedversion: meta.updatedversion,
        source: `https://github.com/Parcoil/Sparkle/blob/v2/tweaks/${folder}/meta.json`,
        sourceUrl: {
          apply: `https://raw.githubusercontent.com/Parcoil/Sparkle/v2/tweaks/${folder}/apply.ps1`,
          unapply: `https://raw.githubusercontent.com/Parcoil/Sparkle/v2/tweaks/${folder}/unapply.ps1`,
        },
      })
    } catch (e) {
      console.error(`⚠️ Failed to read tweak in ${folder}: ${e.message}`)
    }
  }

  const registry = { version: new Date().toISOString(), tweaks }

  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))
  console.log(`✅ registry.json created at ${registryPath}`)
}

function buildElectron() {
  console.log("🚀 Building Electron app...")
  execSync("npm run build:vite && electron-builder", { stdio: "inherit" })
}

const args = process.argv.slice(2)
const shouldBuildRegistry = args.includes("--registry") || args.length === 0
const shouldBuildApp = args.includes("--build") || args.length === 0

;(async () => {
  if (shouldBuildRegistry) await buildRegistry()
  if (shouldBuildApp) buildElectron()
})()
