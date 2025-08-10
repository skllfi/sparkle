import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/RootDiv"
import { Cpu, HardDrive, Zap, MemoryStick, Server, Monitor } from "lucide-react"
import { invoke as rawInvoke } from "@/lib/electron"
import useTweaksStore from "../store/tweaksStore"
import Button from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import useSystemStore from "@/store/systemInfo"
import log from "electron-log/renderer"

performance.mark("sparkle-start")

const CACHE_KEYS = { systemInfo: "sparkle:systemInfo", tweakInfo: "sparkle:tweakInfo", disks: "sparkle:disks" }
const CACHE_TTL_MS = 5 * 60 * 1000

const hasWindow = typeof window !== "undefined"
const requestIdle = hasWindow && window.requestIdleCallback ? window.requestIdleCallback : (cb) => {
  const start = Date.now()
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) }), 1)
}
const cancelIdle = hasWindow && window.cancelIdleCallback ? window.cancelIdleCallback : (id) => clearTimeout(id)
const idle = (fn) => { const id = requestIdle(fn); return () => cancelIdle(id) }


let globalHasFetchedDrives = false
let globalDrivesFetchPromise = null

const now = () => Date.now()
const readJSON = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null } catch { return null } }
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const writeCache = (k, data) => writeJSON(k, { t: now(), data })
const readCache = (k, ttl) => {
  const v = readJSON(k)
  if (!v || typeof v !== "object" || v.t == null || v.data == null) return null
  if (ttl && now() - v.t > ttl) return null
  return v.data
}

const safeNum = (x) => { const n = Number(x); return Number.isFinite(n) ? n : null }
const formatBytes = (bytes) => { const n = safeNum(bytes); if (!n || n <= 0) return "0 GB"; return (n / 1024 / 1024 / 1024).toFixed(2) + " GB" }
const pct = (num, den) => { const n = safeNum(num), d = safeNum(den); if (!n || !d || d <= 0) return "0%"; return Math.round((n / d) * 100) + "%" }
const clampPct = (v) => {
  const n = parseInt(String(v).replace("%", ""), 10)
  if (!Number.isFinite(n)) return "0%"
  return Math.min(100, Math.max(0, n)) + "%"
}

const isPlainObject = (o) => o && typeof o === "object" && !Array.isArray(o)
const validateSystemInfo = (x) => {
  if (!isPlainObject(x)) return null
  const y = {
    cpu_model: typeof x.cpu_model === "string" ? x.cpu_model : "Unknown",
    cpu_cores: safeNum(x.cpu_cores) || 0,
    gpu_model: typeof x.gpu_model === "string" ? x.gpu_model : "Unknown",
    vram: typeof x.vram === "string" || typeof x.vram === "number" ? String(x.vram) : "Unknown",
    memory_total: safeNum(x.memory_total) || 0,
    memory_type: typeof x.memory_type === "string" ? x.memory_type : "Unknown",
    os: typeof x.os === "string" ? x.os : "Unknown",
    os_version: typeof x.os_version === "string" ? x.os_version : "Unknown",
    disk_model: typeof x.disk_model === "string" ? x.disk_model : "Unknown",
    disk_size: typeof x.disk_size === "string" || typeof x.disk_size === "number" ? String(x.disk_size) : "Unknown",
  }
  return y
}
const validateDisks = (arr) => {
  if (!Array.isArray(arr)) return []
  return arr.map((d) => ({
    model: typeof d?.model === "string" ? d.model : d?.name || "",
    name: typeof d?.name === "string" ? d.name : "",
    size: safeNum(d?.size) || 0,
    bus: typeof d?.bus === "string" ? d.bus : "",
    type: typeof d?.type === "string" ? d.type : "",
    volumes: Array.isArray(d?.volumes)
      ? d.volumes.map((v) => ({
          name: typeof v?.name === "string" ? v.name : "",
          letter: typeof v?.letter === "string" ? v.letter : "",
          label: typeof v?.label === "string" ? v.label : "",
          size: safeNum(v?.size) || 0,
          used: v?.used != null ? safeNum(v.used) : null,
          free: v?.free != null ? safeNum(v.free) : null,
        }))
      : [],
  }))
}
const validateTweaks = (x) => (Array.isArray(x) ? x : [])

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))
const invoke = async ({ channel, payload, timeoutMs = 8000, retries = 1 }) => {
  let lastErr
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await Promise.race([rawInvoke({ channel, payload }), timeout(timeoutMs)])
      return res
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

const Bar = ({ value }) => (
  <div className="h-2 w-full bg-sparkle-border/50 rounded">
    <div className="h-2 bg-sparkle-primary rounded" style={{ width: clampPct(value) }} />
  </div>
)

const InfoCard = ({ Icon, iconWrapClass, title, subtitle, rows, onClick }) => {
  const Wrapper = onClick ? motion.button : motion.div
  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={`text-left bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-5 w-full ${onClick ? "focus:outline-none focus:ring-2 focus:ring-sparkle-primary/40 transition" : ""}`}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      layout
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-3 rounded-lg ${iconWrapClass || ""}`}><Icon size={24} /></div>
        <div>
          <h2 className="text-lg font-semibold text-sparkle-text mb-1">{title}</h2>
          <p className="text-sparkle-text-secondary text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">{rows.map((r, i) => (<div key={i}><p className="text-sparkle-text-secondary text-xs mb-1">{r.label}</p><p className="text-sparkle-text font-medium">{r.value}</p></div>))}</div>
    </Wrapper>
  )
}

const Modal = ({ open, onClose, title, children }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const node = ref.current
    const focusable = node ? node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') : []
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Tab" && focusable.length) {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey) }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }} 
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              ref={ref}
              className="w-full max-w-2xl bg-sparkle-card border border-sparkle-border rounded-xl p-5 origin-bottom"
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.12 }}
              layout
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="modal-title" className="text-lg font-semibold text-sparkle-text">{title}</h3>
                <button type="button" onClick={onClose} className="text-sparkle-text-secondary hover:text-sparkle-text" aria-label="Close">✕</button>
              </div>
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


function Home() {
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const setSystemInfo = useSystemStore((s) => s.setSystemInfo)
  const [tweakInfo, setTweakInfo] = useState(() => readCache(CACHE_KEYS.tweakInfo, CACHE_TTL_MS))
  const [loading, setLoading] = useState(true)
  const [usingCache, setUsingCache] = useState(false)
  const activeTweaks = useTweaksStore((s) => s.activeTweaks)
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [disks, setDisks] = useState(() => readCache(CACHE_KEYS.disks, CACHE_TTL_MS) || [])
  const mounted = useRef(true)

  const goToTweaks = useCallback(() => navigate("tweaks"), [navigate])
  const openDetail = (k) => setDetail(k)
  const closeDetail = () => setDetail(null)

  let globalHasFetchedSystemInfo = window.__sparkleHasFetchedSystemInfo || false
  let globalSystemInfoFetchPromise = window.__sparkleSystemInfoFetchPromise || null

  useEffect(() => {
    mounted.current = true
    if (!globalHasFetchedSystemInfo && !globalSystemInfoFetchPromise) {
      window.__sparkleSystemInfoFetchPromise = (async () => {
        const cached = readCache(CACHE_KEYS.systemInfo, CACHE_TTL_MS)
        if (cached) {
          const v = validateSystemInfo(cached)
          if (v && mounted.current) { setSystemInfo(v); setUsingCache(true); setLoading(false) }
        }
        try {
          const infoRaw = await invoke({ channel: "get-system-info", timeoutMs: 10000, retries: 1 })
          const info = validateSystemInfo(infoRaw)
          if (info && mounted.current) { setSystemInfo(info); writeCache(CACHE_KEYS.systemInfo, info); setUsingCache(false); log.info("Fetched system info") }
        } catch (err) {
          log.error("Error fetching system info:", err)
        } finally {
          if (mounted.current) setLoading(false)
        }
        window.__sparkleHasFetchedSystemInfo = true
        window.__sparkleSystemInfoFetchPromise = null
      })()
    } else if (window.__sparkleHasFetchedSystemInfo) {
      const cached = readCache(CACHE_KEYS.systemInfo, CACHE_TTL_MS)
      const v = validateSystemInfo(cached)
      if (v && mounted.current) { setSystemInfo(v); setUsingCache(true); setLoading(false) }
    }
    if (!globalHasFetchedDrives && !globalDrivesFetchPromise) {
      globalDrivesFetchPromise = (async () => {
        try {
          const res = await invoke({ channel: "storage:list", timeoutMs: 12000, retries: 1 })
          const list = validateDisks(res)
          if (mounted.current) { setDisks(list); writeCache(CACHE_KEYS.disks, list) }
        } catch {}
        globalHasFetchedDrives = true
        globalDrivesFetchPromise = null
      })()
    } else if (globalHasFetchedDrives) {
      setDisks(readCache(CACHE_KEYS.disks, CACHE_TTL_MS) || [])
    }
    return () => { mounted.current = false }
  }, [setSystemInfo])

  useEffect(() => {
    const cancel = idle(() => {
      const cached = readCache(CACHE_KEYS.tweakInfo, CACHE_TTL_MS)
      if (cached) setTweakInfo(validateTweaks(cached))
      invoke({ channel: "tweaks:fetch", timeoutMs: 15000, retries: 1 })
        .then((tweaks) => { const v = validateTweaks(tweaks); if (mounted.current) { setTweakInfo(v); writeCache(CACHE_KEYS.tweakInfo, v) } })
        .catch(() => {})
    })
    return cancel
  }, [])

  const cards = useMemo(() => {
    const cpuModel = systemInfo?.cpu_model || "Unknown"
    const cpuCores = systemInfo?.cpu_cores ? `${systemInfo.cpu_cores} Cores` : "0 Cores"
    const gpuModel = systemInfo?.gpu_model || "Unknown"
    const vram = systemInfo?.vram ? `${systemInfo.vram}` : "Unknown"
    const memTotal = formatBytes(systemInfo?.memory_total)
    const memType = systemInfo?.memory_type || "Unknown"
    const os = systemInfo?.os || "Unknown"
    const osVersion = systemInfo?.os_version || "Unknown"

    let cDisk = null
    if (Array.isArray(disks)) {
      cDisk = disks.find(d => Array.isArray(d.volumes) && d.volumes.some(v => v.letter === "C:"))
    }
    const diskModel = cDisk?.model || cDisk?.name || systemInfo?.disk_model || "Unknown"
    const diskSize = cDisk?.size ? formatBytes(cDisk.size) : systemInfo?.disk_size || "Unknown"

    const tweaksAvailable = `${tweakInfo?.length || 0} Tweaks`
    const tweaksActive = `${activeTweaks || 0} Active`
    return [
      { Icon: (p) => <Cpu {...p} className="text-blue-500" />, iconWrapClass: "bg-blue-500/10", title: "CPU", subtitle: "Processor Information", rows: [{ label: "Model", value: cpuModel }, { label: "Cores", value: cpuCores }] },
      { Icon: (p) => <Monitor {...p} className="text-green-500" />, iconWrapClass: "bg-green-500/10", title: "GPU", subtitle: "Graphics Information", rows: [{ label: "Model", value: gpuModel }, { label: "VRAM", value: vram }] },
      { Icon: (p) => <MemoryStick {...p} className="text-purple-500" />, iconWrapClass: "bg-purple-500/10", title: "Memory", subtitle: "RAM Information", rows: [{ label: "Total Memory", value: memTotal }, { label: "Type", value: memType }] },
      { Icon: (p) => <Server {...p} className="text-red-500" />, iconWrapClass: "bg-red-500/10", title: "System", subtitle: "OS Information", rows: [{ label: "Operating System", value: os }, { label: "Version", value: osVersion }] },
      { Icon: (p) => <HardDrive {...p} className="text-orange-500" />, iconWrapClass: "bg-orange-500/10", title: "Storage", subtitle: "Disk Information", rows: [{ label: "Primary Disk", value: diskModel }, { label: "Total Space", value: diskSize }], onClick: () => openDetail("storage") },
      { Icon: (p) => <Zap {...p} className="text-yellow-500" />, iconWrapClass: "bg-yellow-500/10", title: "Tweaks", subtitle: "System Tweaks Status", rows: [{ label: "Available Tweaks", value: tweaksAvailable }, { label: "Active Tweaks", value: tweaksActive }] },
    ]
  }, [systemInfo, tweakInfo, activeTweaks, disks])

  if (loading) return (
    <RootDiv>
      <div className="flex items-center justify-center h-64 flex-col gap-5">
        <div className=""><div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-sparkle-primary rounded-full ml-3" role="status" aria-label="loading" /></div>
        <div className="text-sparkle-text-secondary">Loading system information...</div>
        <p className="text-sm text-sparkle-primary">You may use other parts of sparkle while this loads</p>
      </div>
    </RootDiv>
  )

  return (
    <RootDiv>
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {cards.map((c, i) => (
            <motion.div key={i} variants={{ hidden: { y: 12 }, visible: { y: 0, transition: { duration: 0.15 } } }}>
              <InfoCard {...c} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="bg-sparkle-card backdrop-blur-sm rounded-xl border border-sparkle-border hover:shadow-sm overflow-hidden p-3 w-full mt-5 flex gap-4 items-center "
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="p-3 bg-yellow-500/10 rounded-lg items-center justify-center text-center "><Zap className="text-yellow-500 " size={18} /></div>
          <div><h1 className="font-medium text-sparkle-text">PC Running slow?</h1><p className="text-sparkle-text-secondary">Try Using Tweaks to improve system performance</p></div>
          <div className="ml-auto"><Button variant="outline" className="flex items-center gap-2" onClick={goToTweaks}><Zap size={18} /> Tweaks</Button></div>
        </motion.div>
      </div>

      <Modal open={detail === "storage"} onClose={closeDetail} title="Storage Devices">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sparkle-text-secondary text-sm">Drives may change after plugging/unplugging devices.</span>
          <Button variant="outline" size="sm" onClick={async () => {
            try {
              const res = await invoke({ channel: "storage:list", timeoutMs: 12000, retries: 1 })
              const list = validateDisks(res)
              setDisks(list)
            } catch {}
          }}>Refresh</Button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {(disks || []).map((pd, i) => (
            <motion.div key={i} className="border border-sparkle-border rounded-lg p-3" initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.12 }}>
              <div className="flex items-center justify-between"><div className="text-sparkle-text font-medium">{pd.model || pd.name || `Disk ${i + 1}`}</div><div className="text-sparkle-text-secondary text-sm">{pd.size ? formatBytes(pd.size) : "Unknown"}</div></div>
              <div className="text-sparkle-text-secondary text-xs mt-1">{pd.bus || pd.type || ""}</div>
              <div className="mt-3 space-y-3">
                {(pd.volumes || []).map((v, j) => {
                  const total = v.size || 0
                  const used = v.used != null ? v.used : total && v.free != null ? total - v.free : 0
                  return (
                    <div key={j}>
                      <div className="flex items-center justify-between text-sm"><div className="text-sparkle-text">{v.name || v.letter || ""} {v.label ? `— ${v.label}` : ""}</div><div className="text-sparkle-text-secondary">{total ? `${formatBytes(used)} used (${pct(used, total)})` : "Usage Unknown"}</div></div>
                      <div className="mt-1"><Bar value={total ? pct(used, total) : "0%"} /></div>
                    </div>
                  )
                })}
                {!pd.volumes?.length && <div className="text-sparkle-text-secondary text-sm">No volumes</div>}
              </div>
            </motion.div>
          ))}
          {!disks?.length && <div className="text-sparkle-text-secondary text-sm">No disk list available</div>}
        </div>
      </Modal>
    </RootDiv>
  )
}

export default Home
