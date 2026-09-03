import { inflateSync, unzlibSync } from "fflate"

function latin1(bytes: Uint8Array): string {
  let text = ""
  for (let i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i]!)
  return text
}

function indexOfAscii(bytes: Uint8Array, needle: string, from = 0): number {
  const first = needle.charCodeAt(0)
  outer: for (let i = from; i <= bytes.length - needle.length; i += 1) {
    if (bytes[i] !== first) continue
    for (let j = 1; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle.charCodeAt(j)) continue outer
    }
    return i
  }
  return -1
}

function sliceAscii(bytes: Uint8Array, start: number, end: number): string {
  let text = ""
  for (let i = start; i < end && i < bytes.length; i += 1) {
    text += String.fromCharCode(bytes[i]!)
  }
  return text
}

function inflatePdf(data: Uint8Array): Uint8Array | null {
  try {
    return unzlibSync(data)
  } catch {
    try {
      return inflateSync(data)
    } catch {
      return null
    }
  }
}

function unescapePdfString(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct) =>
      String.fromCharCode(Number.parseInt(oct, 8))
    )
}

function decodePdfString(token: string): string {
  if (token.startsWith("(") && token.endsWith(")")) {
    return unescapePdfString(token.slice(1, -1))
  }
  if (token.startsWith("<") && token.endsWith(">")) {
    const hex = token.slice(1, -1).replace(/\s+/g, "")
    if (hex.length < 2 || hex.length % 2 !== 0) return ""
    if (hex.startsWith("feff") || hex.startsWith("FEFF")) {
      const chars: string[] = []
      for (let i = 4; i < hex.length; i += 4) {
        chars.push(String.fromCharCode(Number.parseInt(hex.slice(i, i + 4), 16)))
      }
      return chars.join("")
    }
    const chars: string[] = []
    for (let i = 0; i < hex.length; i += 2) {
      chars.push(String.fromCharCode(Number.parseInt(hex.slice(i, i + 2), 16)))
    }
    return chars.join("")
  }
  return ""
}

function tokenizePdf(content: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < content.length) {
    const char = content[i]!
    if (/\s/.test(char)) {
      i += 1
      continue
    }
    if (char === "%") {
      while (i < content.length && content[i] !== "\n") i += 1
      continue
    }
    if (char === "(") {
      let j = i + 1
      let depth = 1
      while (j < content.length && depth > 0) {
        if (content[j] === "\\" ) {
          j += 2
          continue
        }
        if (content[j] === "(") depth += 1
        if (content[j] === ")") depth -= 1
        j += 1
      }
      tokens.push(content.slice(i, j))
      i = j
      continue
    }
    if (char === "<" && content[i + 1] !== "<") {
      const end = content.indexOf(">", i + 1)
      if (end < 0) break
      tokens.push(content.slice(i, end + 1))
      i = end + 1
      continue
    }
    if (char === "[" ) {
      tokens.push("[")
      i += 1
      continue
    }
    if (char === "]" ) {
      tokens.push("]")
      i += 1
      continue
    }
    const rest = content.slice(i)
    const op = rest.match(/^[A-Za-z*'"]+/)
    if (op) {
      tokens.push(op[0])
      i += op[0].length
      continue
    }
    const num = rest.match(/^[+-]?(?:\d+\.?\d*|\.\d+)/)
    if (num) {
      tokens.push(num[0])
      i += num[0].length
      continue
    }
    i += 1
  }
  return tokens
}

function rowsFromContent(content: string): string[][] {
  const tokens = tokenizePdf(content)
  const rows: string[][] = []
  let current: string[] = []

  function pushRow() {
    if (current.some((cell) => cell.trim())) rows.push(current.map((cell) => cell.trim()))
    current = []
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]!
    if (token === "Tj" || token === "'") {
      if (token === "'") pushRow()
      const text = decodePdfString(tokens[i - 1] ?? "")
      if (text) current.push(text)
      continue
    }
    if (token === "TJ") {
      let j = i - 1
      const parts: string[] = []
      while (j >= 0 && tokens[j] !== "[") {
        const decoded = decodePdfString(tokens[j]!)
        if (decoded) parts.unshift(decoded)
        j -= 1
      }
      if (parts.length) current.push(parts.join(""))
      continue
    }
    if (token === "Td" || token === "TD") {
      const ty = Number(tokens[i - 1] ?? "")
      if (Number.isFinite(ty) && ty < -2) pushRow()
      continue
    }
    if (token === "T*") pushRow()
  }
  pushRow()
  return rows
}

function extractStreams(bytes: Uint8Array): string[] {
  const contents: string[] = []
  let cursor = 0
  while (cursor < bytes.length) {
    const start = indexOfAscii(bytes, "stream", cursor)
    if (start < 0) break
    const dictStart = Math.max(0, start - 400)
    const dict = sliceAscii(bytes, dictStart, start)
    let dataStart = start + 6
    if (bytes[dataStart] === 0x0d) dataStart += 1
    if (bytes[dataStart] === 0x0a) dataStart += 1
    const end = indexOfAscii(bytes, "endstream", dataStart)
    if (end < 0) break
    let dataEnd = end
    if (bytes[dataEnd - 1] === 0x0a) dataEnd -= 1
    if (bytes[dataEnd - 1] === 0x0d) dataEnd -= 1
    const payload = bytes.slice(dataStart, dataEnd)
    const inflated = /\/flatedecode/i.test(dict) ? inflatePdf(payload) : payload
    if (inflated) contents.push(latin1(inflated))
    cursor = end + 9
  }
  return contents
}

export function isPdfBytes(bytes: Uint8Array, fileName = ""): boolean {
  if (/\.pdf$/i.test(fileName)) return true
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
}

export function pdfToRows(bytes: Uint8Array): string[][] {
  const rows: string[][] = []
  for (const content of extractStreams(bytes)) {
    rows.push(...rowsFromContent(content))
  }
  if (rows.length > 0) return rows

  const fallback = extractStreams(bytes)
    .join("\n")
    .match(/\((?:\\.|[^\\)])*\)/g)
    ?.map((token) => decodePdfString(token).trim())
    .filter(Boolean)
  if (!fallback?.length) return []
  const joined: string[][] = []
  let line: string[] = []
  for (const part of fallback) {
    line.push(part)
    if (line.length >= 14) {
      joined.push(line)
      line = []
    }
  }
  if (line.length) joined.push(line)
  return joined
}
