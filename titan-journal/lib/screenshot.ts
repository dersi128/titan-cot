export const MAX_SCREENSHOT_BYTES = 700_000
const MAX_EDGE = 1600

export type ScreenshotError = "not-image" | "too-large" | "invalid-url" | "failed"

export type ScreenshotResult =
  | { ok: true; value: string }
  | { ok: false; reason: ScreenshotError }

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",")
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  return Math.ceil((payload.length * 3) / 4)
}

export function hydrateScreenshot(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const value = raw.trim()
  if (!value) return null
  if (isHttpUrl(value)) return value
  if (value.startsWith("data:image/")) return value
  return null
}

export async function ingestScreenshot(
  source: Blob | string
): Promise<ScreenshotResult> {
  if (typeof source === "string") return ingestText(source)
  return ingestBlob(source)
}

async function ingestText(raw: string): Promise<ScreenshotResult> {
  const value = raw.trim()
  if (!value) return { ok: false, reason: "invalid-url" }
  if (isHttpUrl(value)) return { ok: true, value }
  if (value.startsWith("blob:")) {
    try {
      const blob = await fetch(value).then((response) => response.blob())
      return ingestBlob(blob)
    } catch {
      return { ok: false, reason: "failed" }
    }
  }
  if (value.startsWith("data:image/")) return compressDataUrl(value)
  return { ok: false, reason: "invalid-url" }
}

async function ingestBlob(blob: Blob): Promise<ScreenshotResult> {
  if (blob.type && !blob.type.startsWith("image/")) {
    return { ok: false, reason: "not-image" }
  }
  const dataUrl = await readAsDataUrl(blob)
  if (!dataUrl?.startsWith("data:image/")) {
    return { ok: false, reason: "not-image" }
  }
  return compressDataUrl(dataUrl)
}

function readAsDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(blob)
  })
}

async function compressDataUrl(dataUrl: string): Promise<ScreenshotResult> {
  if (dataUrlBytes(dataUrl) <= MAX_SCREENSHOT_BYTES) {
    return { ok: true, value: dataUrl }
  }
  if (typeof document === "undefined") {
    return { ok: false, reason: "too-large" }
  }

  const image = await loadImage(dataUrl)
  if (!image) return { ok: false, reason: "failed" }

  let width = image.width
  let height = image.height
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height, 1))
  width = Math.max(1, Math.round(width * scale))
  height = Math.max(1, Math.round(height * scale))

  let quality = 0.82
  let next = drawJpeg(image, width, height, quality)
  while (next && dataUrlBytes(next) > MAX_SCREENSHOT_BYTES && quality > 0.42) {
    quality -= 0.08
    next = drawJpeg(image, width, height, quality)
  }
  while (next && dataUrlBytes(next) > MAX_SCREENSHOT_BYTES && Math.max(width, height) > 640) {
    width = Math.max(1, Math.round(width * 0.85))
    height = Math.max(1, Math.round(height * 0.85))
    next = drawJpeg(image, width, height, quality)
  }

  if (!next) return { ok: false, reason: "failed" }
  if (dataUrlBytes(next) > MAX_SCREENSHOT_BYTES) {
    return { ok: false, reason: "too-large" }
  }
  return { ok: true, value: next }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function drawJpeg(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): string | null {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) return null
    context.fillStyle = "#0b1220"
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL("image/jpeg", quality)
  } catch {
    return null
  }
}
