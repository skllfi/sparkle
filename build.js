import fs from "fs/promises"
import path from "path"
import { execSync } from "child_process"

const root = process.cwd()
const tweaksDir = path.join(root, "tweaks")
const registryPath = path.join(tweaksDir, "registry.json")

async function buildRegistry() {
  const folders = await fs.readdir(tweaksDir)
  const registryNormal = []

  for (const folder of folders) {
    const tweakPath = path.join(tweaksDir, folder)
    const stat = await fs.stat(tweakPath).catch(() => null)
    if (!stat?.isDirectory()) continue

    const metaPath = path.join(tweakPath, "meta.json")

    try {
      const metaRaw = await fs.readFile(metaPath, "utf8")
      const meta = JSON.parse(metaRaw)

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
      }

      registryNormal.push(baseTweak)
    } catch (e) {
      console.error(`⚠️ Failed to read tweak in ${folder}: ${e.message}`)
    }
  }

  const normalOutput = { version: new Date().toISOString(), tweaks: registryNormal }
  await fs.writeFile(registryPath, JSON.stringify(normalOutput, null, 2))
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
