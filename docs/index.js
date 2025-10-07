// move this to python soon as mkdocs uses python so it makes sense to use python

import fs from "fs"
import path from "path"

const tweaksDir = "../resources/tweaks"
const docsDir = "./docs/tweaks"
const tweaksIndexFile = "./docs/tweaks/index.md"

fs.mkdirSync(docsDir, { recursive: true })

let tweaksList = []

const subfolders = fs
  .readdirSync(tweaksDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

for (const folder of subfolders) {
  const metaPath = path.join(tweaksDir, folder, "meta.json")

  if (!fs.existsSync(metaPath)) {
    console.warn(`⚠️ Skipping ${folder}, no meta.json found`)
    continue
  }

  const tweak = JSON.parse(fs.readFileSync(metaPath, "utf-8"))

  const slug = tweak.name
    ? tweak.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : folder

  const mdPath = path.join(docsDir, `${slug}.md`)

  const applyPath = path.join(tweaksDir, folder, "apply.ps1")
  const unapplyPath = path.join(tweaksDir, folder, "unapply.ps1")

  const applyScript = fs.existsSync(applyPath) ? fs.readFileSync(applyPath, "utf-8") : null

  const unapplyScript = fs.existsSync(unapplyPath) ? fs.readFileSync(unapplyPath, "utf-8") : null

  let deepDesc = tweak.deepDescription || ""
  deepDesc = deepDesc
    .split(/\n?([^\n]+:)\s*/g)
    .filter(Boolean)
    .map((section) => {
      if (section.endsWith(":")) {
        return `## ${section}`
      } else {
        return section
          .split(/- /)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => `- ${s}`)
          .join("\n")
      }
    })
    .join("\n\n")

  const mdContent = `

# ${tweak.title || folder}

## Overview
- **ID/URL**: \`${tweak.name || folder}\`
- **Description**: ${tweak.description || ""}

${
  tweak.reversible === false
    ? `!!! info "Irreversible"
    This tweak cannot be reversed and must be undone manually.
`
    : ""
}

${
  tweak.updatedversion 
  ? `!!! info "Updated"
    This tweak was last updated in ${tweak.updatedversion}
  ` 
  : ""
}
${
  tweak.addedversion 
  ? `!!! info "Added"
    This tweak was added in ${tweak.addedversion}, Sparkle ${tweak.addedversion}+ is required.
  ` 
  : ""
}
${deepDesc ? `## Details\n\n${deepDesc}` : ""}

${
  tweak.docs_warning
    ? `!!! warning "Documentation Warning"
    ${tweak.docs_warning}`
    : ""
}
${
  tweak.warning
    ? `!!! warning "Tweak Warning"
    ${tweak.warning}`
    : ""
}
${
  tweak.recommended
    ? `!!! tip "Recommended"
    This tweak is recommended.
`
    : ""
}

${applyScript ? `## Apply\n\n\`\`\`powershell\n${applyScript}\n\`\`\`\n` : ""}
${unapplyScript ? `## Unapply\n\n\`\`\`powershell\n${unapplyScript}\n\`\`\`\n` : ""}

${tweak.links ? `## Links\n${tweak.links.map((link) => `- [${link.name}](${link.url})`).join("\n")}` : ""}
`


  fs.writeFileSync(mdPath, mdContent.trim() + "\n", "utf-8")

  tweaksList.push({ name: tweak.name || folder, slug })
}

const tweaksIndex = `
---
title: "All Tweaks"
---

# Sparkle Tweaks
A collection of tweaks to customize and enhance your Windows experience using Sparkle.

_This page is auto-generated._

## All Tweaks (${tweaksList.length})
${tweaksList.map((t) => `- [${t.name}](${t.slug}.md)`).join("\n")}
`

fs.writeFileSync(tweaksIndexFile, tweaksIndex.trim() + "\n", "utf-8")

console.log("✅ - Docs generated!")
console.log(`🛠️  - Total tweaks: ${tweaksList.length}`)
