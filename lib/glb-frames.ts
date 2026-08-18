'use client'

import type { Object3D, WebGLRenderer, Scene, PerspectiveCamera } from 'three'

/**
 * Renders a GLB into an ordered turntable image sequence, entirely in the browser.
 *
 * This is what lets the public site stay lean: visitors download WebP frames and
 * use the existing image-sequence viewer, instead of pulling a WebGL runtime and
 * a multi-megabyte mesh onto a knit page. three.js is dynamically imported here
 * so it only ever loads inside the admin panel, on demand.
 */

export interface RenderFramesOptions {
  /** Frames around a full turn. 36 = one frame per 10°. */
  frameCount?: number
  /** Square output size in CSS pixels. */
  size?: number
  /** Camera elevation in degrees above the horizon. */
  elevation?: number
  onProgress?: (done: number, total: number) => void
  signal?: AbortSignal
}

/** WebP keeps alpha and is far smaller than PNG; PNG is the fallback for old Safari. */
function pickFormat(): { mime: string; ext: string } {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  return supportsWebp ? { mime: 'image/webp', ext: 'webp' } : { mime: 'image/png', ext: 'png' }
}

function toBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('רינדור הפריים נכשל'))),
      mime,
      0.92
    )
  })
}

export interface RenderedFrames {
  frames: Blob[]
  ext: string
}

export async function renderTurntableFrames(
  glb: Blob,
  options: RenderFramesOptions = {}
): Promise<RenderedFrames> {
  const { frameCount = 36, size = 900, elevation = 12, onProgress, signal } = options

  const THREE = await import('three')
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

  const { mime, ext } = pickFormat()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size

  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      // Required so toBlob() can read the buffer after each render.
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(1)
    renderer.setSize(size, size, false)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    scene = new THREE.Scene()

    // Neutral studio light so the knit's own colour is what shows up.
    scene.add(new THREE.AmbientLight(0xffffff, 1.6))
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdedede, 1.2))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(3, 5, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.7)
    fill.position.set(-4, 2, -3)
    scene.add(fill)

    const url = URL.createObjectURL(glb)
    let model: Object3D
    try {
      const loader = new GLTFLoader()
      const gltf = await loader.loadAsync(url)
      model = gltf.scene
    } finally {
      URL.revokeObjectURL(url)
    }

    // Recentre on the origin and normalise scale so every knit fills the frame
    // the same amount — the carousel depends on a consistent scale.
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
    const distance = 1 / Math.tan((camera.fov * Math.PI) / 360) * 0.95
    const elevationRad = (elevation * Math.PI) / 180

    const frames: Blob[] = []
    for (let i = 0; i < frameCount; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

      const angle = (i / frameCount) * Math.PI * 2
      camera.position.set(
        Math.sin(angle) * Math.cos(elevationRad) * distance,
        Math.sin(elevationRad) * distance,
        Math.cos(angle) * Math.cos(elevationRad) * distance
      )
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      frames.push(await toBlob(canvas, mime))
      onProgress?.(i + 1, frameCount)

      // Yields to the event loop so the admin UI keeps painting its progress.
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    return { frames, ext }
  } finally {
    // Release GPU memory — a leaked context will kill later runs in the same tab.
    scene?.traverse(obj => {
      const mesh = obj as unknown as {
        geometry?: { dispose?: () => void }
        material?: unknown
      }
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
}
