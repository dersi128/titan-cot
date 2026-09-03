import { unzipSync } from "fflate"

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes)
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function colIndex(ref: string): number {
  const letters = ref.match(/^[A-Za-z]+/)?.[0] ?? "A"
  let index = 0
  for (const char of letters.toUpperCase()) {
    index = index * 26 + (char.charCodeAt(0) - 64)
  }
  return Math.max(0, index - 1)
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = []
  const blocks = xml.match(/<si\b[^>]*>[\s\S]*?<\/si>/gi) ?? []
  for (const block of blocks) {
    const parts = [...block.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((match) =>
      decodeXml(match[1])
    )
    strings.push(parts.join(""))
  }
  return strings
}

function cellValue(
  xml: string,
  shared: string[]
): string {
  const type = xml.match(/\bt="([^"]+)"/)?.[1] ?? ""
  if (type === "s") {
    const index = Number(xml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1] ?? "")
    return Number.isFinite(index) ? (shared[index] ?? "") : ""
  }
  if (type === "inlineStr" || type === "str") {
    const text = xml.match(/<t\b[^>]*>([\s\S]*?)<\/t>/i)?.[1]
    if (text != null) return decodeXml(text)
  }
  const value = xml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1]
  return value != null ? decodeXml(value).trim() : ""
}

function parseSheet(xml: string, shared: string[]): string[][] {
  const rows: string[][] = []
  const rowBlocks = xml.match(/<row\b[^>]*>[\s\S]*?<\/row>/gi) ?? []
  for (const rowXml of rowBlocks) {
    const cells: string[] = []
    const cellBlocks = rowXml.match(/<c\b[^>]*>[\s\S]*?<\/c>/gi) ?? []
    for (const cellXml of cellBlocks) {
      const ref = cellXml.match(/\br="([A-Z]+\d+)"/i)?.[1]
      const index = ref ? colIndex(ref) : cells.length
      while (cells.length < index) cells.push("")
      cells[index] = cellValue(cellXml, shared)
    }
    if (cells.some((cell) => cell.length > 0)) rows.push(cells)
  }
  return rows
}

export function isXlsxZip(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b
}

export function xlsxSheetsToRows(bytes: Uint8Array): string[][][] {
  const files = unzipSync(bytes)
  const names = Object.keys(files)
  const sharedName = names.find((name) => /xl\/sharedstrings\.xml$/i.test(name))
  const shared = sharedName ? parseSharedStrings(decodeUtf8(files[sharedName]!)) : []
  const sheetNames = names
    .filter((name) => /xl\/worksheets\/[^/]+\.xml$/i.test(name))
    .sort()
  const sheets: string[][][] = []
  for (const name of sheetNames) {
    const rows = parseSheet(decodeUtf8(files[name]!), shared)
    if (rows.length > 0) sheets.push(rows)
  }
  return sheets
}
