'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, X } from 'lucide-react'
import { usePrefersReducedMotion, useSavesData } from '@/lib/hooks'
import type { Lang } from '@/lib/types'
import type { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

/**
 * Live WebGL viewer for a knit's GLB — the same idea as Google Search's 3D
 * animals: one glTF binary, a real mesh, a camera the visitor orbits, and no
 * control chrome sitting on top of the object.
 *
 * The GLB downloads in the background as soon as the page goes idle, so the
 * button is instant when it is pressed. That download is still a few megabytes,
 * so it waits for idle rather than competing with the cover image, and is
 * skipped outright when the browser reports Data Saver or a slow connection —
 * those visitors get the same viewer, loaded on demand with a progress readout.
 *
 * The lighting rig is copied from lib/glb-frames.ts on purpose, so the live
 * model looks like the pre-rendered frames of the same knit rather than a
 * second, differently-lit interpretation of it.
 */

/** Radians of orbit per pixel dragged — about one full turn per screen width. */
const RAD_PER_PX = 0.008
/** Stops short of the poles, where an orbit camera flips over on itself. */
const MIN_POLAR = 0.2
const MAX_POLAR = Math.PI - 0.2
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.2
const ZOOM_STEP = 1.25
/** Camera elevation at rest, matching the turntable frames. */
const REST_POLAR = Math.PI / 2 - (12 * Math.PI) / 180
const KEY_ORBIT_STEP = (12 * Math.PI) / 180
const AUTO_ROTATE_RAD_PER_SEC = 0.25

interface KnitModelViewerProps {
  src: string
  /** Shown until the visitor opts in, and the permanent static alternative. */
  cover: string | null
  alt: string
  lang: Lang
}

interface OrbitState {
  azimuth: number
  polar: number
  zoom: number
}

const REST: OrbitState = { azimuth: 0, polar: REST_POLAR, zoom: 1 }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Runs a job when the browser is next idle, falling back to a plain timer. */
function whenIdle(job: () => void): () => void {
  const idle = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }
  if (idle.requestIdleCallback) {
    const handle = idle.requestIdleCallback(job, { timeout: 4000 })
    return () => idle.cancelIdleCallback?.(handle)
  }
  const handle = window.setTimeout(job, 1500)
  return () => window.clearTimeout(handle)
}

/** Releases GPU memory — a leaked context breaks every later viewer in the tab. */
function disposeScene(scene: Scene | null, renderer: WebGLRenderer | null) {
  scene?.traverse(obj => {
    const mesh = obj as unknown as { geometry?: { dispose?: () => void }; material?: unknown }
    mesh.geometry?.dispose?.()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      const m = material as { dispose?: () => void; map?: { dispose?: () => void } } | undefined
      m?.map?.dispose?.()
      m?.dispose?.()
    }
  })
  renderer?.dispose()
  renderer?.forceContextLoss?.()
}

export default function KnitModelViewer({ src, cover, alt, lang }: KnitModelViewerProps) {
  const he = lang === 'he'
  const reducedMotion = usePrefersReducedMotion()
  const savesData = useSavesData()

  const [live, setLive] = useState(false)
  const [ready, setReady] = useState(false)
  const [percent, setPercent] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [spinning, setSpinning] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)

  const orbitRef = useRef<OrbitState>({ ...REST })
  const spinningRef = useRef(true)
  // Set once the visitor drags or focuses the model — see the wheel handler.
  const engagedRef = useRef(false)
  // Pointer id -> last position, so a second finger can pinch to zoom.
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<number | null>(null)

  /** The single in-flight (or finished) download, shared by prefetch and click. */
  const downloadRef = useRef<Promise<string> | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    spinningRef.current = spinning && !reducedMotion
  }, [spinning, reducedMotion])

  /**
   * Downloads the GLB once and hands back a blob URL. Calling this again while
   * it is still running joins the existing download rather than starting a
   * second one — that is what makes a click during the background prefetch
   * finish on the bytes already in flight instead of fetching them twice.
   */
  const startDownload = useCallback(() => {
    if (downloadRef.current) return downloadRef.current

    const promise = (async () => {
      const response = await fetch(src)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const total = Number(response.headers.get('content-length'))
      if (!response.body || !Number.isFinite(total) || total <= 0) {
        const url = URL.createObjectURL(await response.blob())
        objectUrlRef.current = url
        return url
      }

      const reader = response.body.getReader()
      const parts: BlobPart[] = []
      let received = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        parts.push(value as BlobPart)
        received += value.length
        setPercent(Math.round((received / total) * 100))
      }

      const url = URL.createObjectURL(new Blob(parts, { type: 'model/gltf-binary' }))
      objectUrlRef.current = url
      return url
    })()

    downloadRef.current = promise
    // A failed attempt must not poison the retry on click.
    promise.catch(() => { downloadRef.current = null })
    return promise
  }, [src])

  // Warm the model in the background so the button is instant when pressed.
  useEffect(() => {
    if (savesData) return
    return whenIdle(() => { void startDownload().catch(() => { /* retried on click */ }) })
  }, [savesData, startDownload])

  // The blob outlives every scene, so it is only released with the component.
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  // Build the scene once the visitor opts in, and tear it down on exit.
  useEffect(() => {
    if (!live) return
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let frameHandle = 0
    let renderer: WebGLRenderer | null = null
    let scene: Scene | null = null
    let observer: ResizeObserver | null = null

    const start = async () => {
      // The mesh is usually already downloaded by now; three.js is not, so both
      // are waited on together.
      const [THREE, { GLTFLoader }, url] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        startDownload(),
      ])
      if (cancelled) return

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      scene = new THREE.Scene()
      scene.add(new THREE.AmbientLight(0xffffff, 1.6))
      scene.add(new THREE.HemisphereLight(0xffffff, 0xdedede, 1.2))
      const key = new THREE.DirectionalLight(0xffffff, 1.5)
      key.position.set(3, 5, 4)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xffffff, 0.7)
      fill.position.set(-4, 2, -3)
      scene.add(fill)

      const gltf = await new GLTFLoader().loadAsync(url)
      if (cancelled) return
      const model: Object3D = gltf.scene

      // Recentre and normalise by the longest axis, exactly as the frames do.
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const extent = box.getSize(new THREE.Vector3())
      const maxAxis = Math.max(extent.x, extent.y, extent.z) || 1
      model.position.sub(center)

      const pivot = new THREE.Group()
      pivot.add(model)
      pivot.scale.setScalar(1 / maxAxis)
      scene.add(pivot)

      const camera: PerspectiveCamera = new THREE.PerspectiveCamera(30, 1, 0.01, 100)
      // Far enough back that the unit-sized model never clips at any angle.
      const baseDistance = (1 / Math.tan((camera.fov * Math.PI) / 360)) * 0.95

      const resize = () => {
        const width = canvas.clientWidth || 1
        const height = canvas.clientHeight || 1
        renderer?.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      observer = new ResizeObserver(resize)
      observer.observe(canvas)

      setReady(true)

      let previous = performance.now()
      const tick = (now: number) => {
        // Clamped so a backgrounded tab does not resume with one huge jump.
        const delta = Math.min((now - previous) / 1000, 0.1)
        previous = now
        if (spinningRef.current && pointersRef.current.size === 0) {
          orbitRef.current.azimuth += AUTO_ROTATE_RAD_PER_SEC * delta
        }

        const { azimuth, polar, zoom } = orbitRef.current
        const distance = baseDistance * zoom
        camera.position.set(
          Math.sin(polar) * Math.sin(azimuth) * distance,
          Math.cos(polar) * distance,
          Math.sin(polar) * Math.cos(azimuth) * distance
        )
        camera.lookAt(0, 0, 0)
        if (scene) renderer?.render(scene, camera)
        frameHandle = requestAnimationFrame(tick)
      }
      frameHandle = requestAnimationFrame(tick)
    }

    start().catch(() => {
      if (cancelled) return
      setError(he ? 'טעינת המודל התלת-ממדי נכשלה.' : 'The 3D model failed to load.')
      setLive(false)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameHandle)
      observer?.disconnect()
      disposeScene(scene, renderer)
    }
  }, [live, he, startDownload])

  const applyZoom = useCallback((factor: number) => {
    orbitRef.current.zoom = clamp(orbitRef.current.zoom * factor, MIN_ZOOM, MAX_ZOOM)
  }, [])

  /**
   * Wheel zoom, but only once the visitor has taken hold of the model. Claiming
   * the wheel any earlier would trap a reader who is merely scrolling past the
   * viewer on the way down the page.
   */
  useEffect(() => {
    const surface = surfaceRef.current
    if (!live || !surface) return
    const onWheel = (event: WheelEvent) => {
      if (!engagedRef.current) return
      event.preventDefault()
      applyZoom(event.deltaY > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)
      setSpinning(false)
    }
    surface.addEventListener('wheel', onWheel, { passive: false })
    return () => surface.removeEventListener('wheel', onWheel)
  }, [live, applyZoom])

  const enter = () => {
    setError('')
    setReady(false)
    orbitRef.current = { ...REST }
    engagedRef.current = false
    setSpinning(true)
    setLive(true)
  }

  const exit = useCallback(() => {
    setLive(false)
    setReady(false)
    pointersRef.current.clear()
    pinchRef.current = null
    engagedRef.current = false
    // Focus has to go somewhere real once the canvas is gone.
    requestAnimationFrame(() => enterRef.current?.focus())
  }, [])

  const pinchDistance = () => {
    const points = [...pointersRef.current.values()]
    if (points.length < 2) return null
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    pinchRef.current = pinchDistance()
    engagedRef.current = true
    setSpinning(false)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const previous = pointersRef.current.get(e.pointerId)
    if (!previous) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size >= 2) {
      const distance = pinchDistance()
      if (distance && pinchRef.current) applyZoom(pinchRef.current / distance)
      pinchRef.current = distance
      return
    }

    // Dragging right turns the knit to the right, matching Knit360Viewer.
    orbitRef.current.azimuth -= (e.clientX - previous.x) * RAD_PER_PX
    // Vertical drag tilts with a mouse only: on touch that axis scrolls the page.
    if (e.pointerType === 'mouse') {
      orbitRef.current.polar = clamp(
        orbitRef.current.polar - (e.clientY - previous.y) * RAD_PER_PX,
        MIN_POLAR,
        MAX_POLAR
      )
    }
  }

  const endPointer = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    pinchRef.current = pinchDistance()
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const orbit = orbitRef.current
    switch (e.key) {
      case 'ArrowRight': orbit.azimuth -= KEY_ORBIT_STEP; break
      case 'ArrowLeft': orbit.azimuth += KEY_ORBIT_STEP; break
      case 'ArrowUp': orbit.polar = clamp(orbit.polar - KEY_ORBIT_STEP, MIN_POLAR, MAX_POLAR); break
      case 'ArrowDown': orbit.polar = clamp(orbit.polar + KEY_ORBIT_STEP, MIN_POLAR, MAX_POLAR); break
      case '+': case '=': applyZoom(1 / ZOOM_STEP); break
      case '-': case '_': applyZoom(ZOOM_STEP); break
      case 'Home': orbitRef.current = { ...REST }; break
      case 'Escape': exit(); return
      default: return
    }
    e.preventDefault()
    setSpinning(false)
  }

  return (
    <div className="relative aspect-square w-full bg-white">
      {/* Static alternative — the only thing rendered until the visitor opts in. */}
      {!live && (
        <>
          {cover ? (
            <Image
              src={cover}
              alt={alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-contain p-6 md:p-10"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F5F0E8]">
              <span className="text-[#5C3D2E]/30 text-xs tracking-widest uppercase">{alt}</span>
            </div>
          )}

          <button
            ref={enterRef}
            onClick={enter}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 min-h-11 inline-flex items-center gap-2 px-5 bg-[#5C3D2E] text-[#FAF7F2] text-xs tracking-[0.15em] uppercase hover:bg-[#4A3025] transition-colors"
          >
            <Box size={15} aria-hidden="true" />
            {he ? 'צפייה תלת-ממדית' : 'View in 3D'}
          </button>

          {error && (
            <p
              role="alert"
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-max max-w-[90%] text-center text-xs text-red-700 bg-white/90 px-3 py-1.5"
            >
              {error}
            </p>
          )}
        </>
      )}

      {live && (
        <>
          <div
            ref={surfaceRef}
            role="application"
            aria-roledescription={he ? 'מציג תלת-ממד' : '3D viewer'}
            aria-label={
              he
                ? `מודל תלת-ממדי של ${alt}. גררו לסיבוב, מקשי החצים לסיבוב, פלוס ומינוס לזום, Escape לחזרה לתמונה.`
                : `3D model of ${alt}. Drag to orbit, arrow keys to orbit, plus and minus to zoom, Escape to return to the photo.`
            }
            tabIndex={0}
            onFocus={() => { engagedRef.current = true }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onKeyDown={onKeyDown}
            // pan-y leaves vertical page scrolling to the page, as in Knit360Viewer.
            className="absolute inset-0 touch-pan-y select-none cursor-grab active:cursor-grabbing"
          >
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Only ever seen when the background prefetch has not finished first. */}
          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white pointer-events-none">
              <p className="text-xs tracking-[0.15em] uppercase text-[#5C3D2E]/70" role="status">
                {he ? 'טוען מודל תלת-ממדי' : 'Loading 3D model'}
                {percent !== null && ` ${percent}%`}
              </p>
              <div className="h-px w-40 bg-[#5C3D2E]/10">
                <div
                  className="h-full bg-[#5C3D2E]/40 transition-[width] duration-200"
                  style={{ width: `${percent ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* The one piece of chrome: without it a mouse cannot reach the photo again. */}
          <button
            onClick={exit}
            aria-label={he ? 'חזרה לתמונה' : 'Back to the photo'}
            style={{ insetInlineEnd: '0.5rem' }}
            className="absolute top-2 w-11 h-11 flex items-center justify-center text-[#5C3D2E]/45 hover:text-[#5C3D2E] transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}
