// utils/display.ts
// Small helper utilities for safe display of backend values.

export function safeVal(v: unknown): string | number {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' || typeof v === 'number') return v
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('en' in o && (o.en || o.en === 0)) return o.en as string | number
    if ('vi' in o && (o.vi || o.vi === 0)) return o.vi as string | number
    for (const key of Object.keys(o)) {
      const val = o[key]
      if (typeof val === 'string' || typeof val === 'number') return val
    }
  }
  return ''
}

export function safeArray<T>(a: T | T[] | null | undefined): T[] {
  if (!a) return []
  if (Array.isArray(a)) return a
  return [a]
}

export function formatNumber(num: unknown): string {
  if (num === null || num === undefined || num === '') return ''
  const n = Number(String(num).replace(/,/g, ''))
  if (Number.isNaN(n)) return String(num)
  return n.toLocaleString()
}

export function parseNumber(str: unknown): string {
  if (!str) return ''
  return String(str).replace(/,/g, '')
}

/**
 * Normalizes "fancy fonts" (Unicode Mathematical Alphanumeric Symbols)
 * back to standard Latin characters and digits.
 */
export function normalizeFancyText(text: unknown): unknown {
  if (typeof text !== 'string') return text

  return text.replace(/[\uD835][\uDC00-\uDFFF]/g, (match) => {
    const code = match.codePointAt(0)
    if (code === undefined) return match

    if (code >= 0x1d400 && code <= 0x1d419) return String.fromCodePoint(code - 0x1d400 + 0x41)
    if (code >= 0x1d434 && code <= 0x1d44d) return String.fromCodePoint(code - 0x1d434 + 0x41)
    if (code >= 0x1d468 && code <= 0x1d481) return String.fromCodePoint(code - 0x1d468 + 0x41)
    if (code >= 0x1d49c && code <= 0x1d4b5) return String.fromCodePoint(code - 0x1d49c + 0x41)
    if (code >= 0x1d4d0 && code <= 0x1d4e9) return String.fromCodePoint(code - 0x1d4d0 + 0x41)
    if (code >= 0x1d504 && code <= 0x1d51d) return String.fromCodePoint(code - 0x1d504 + 0x41)
    if (code >= 0x1d538 && code <= 0x1d551) return String.fromCodePoint(code - 0x1d538 + 0x41)
    if (code >= 0x1d56c && code <= 0x1d585) return String.fromCodePoint(code - 0x1d56c + 0x41)
    if (code >= 0x1d5a0 && code <= 0x1d5b9) return String.fromCodePoint(code - 0x1d5a0 + 0x41)
    if (code >= 0x1d5d4 && code <= 0x1d5ed) return String.fromCodePoint(code - 0x1d5d4 + 0x41)
    if (code >= 0x1d608 && code <= 0x1d621) return String.fromCodePoint(code - 0x1d608 + 0x41)
    if (code >= 0x1d63c && code <= 0x1d655) return String.fromCodePoint(code - 0x1d63c + 0x41)
    if (code >= 0x1d670 && code <= 0x1d689) return String.fromCodePoint(code - 0x1d670 + 0x41)

    if (code >= 0x1d41a && code <= 0x1d433) return String.fromCodePoint(code - 0x1d41a + 0x61)
    if (code >= 0x1d44e && code <= 0x1d467) return String.fromCodePoint(code - 0x1d44e + 0x61)
    if (code >= 0x1d482 && code <= 0x1d49b) return String.fromCodePoint(code - 0x1d482 + 0x61)
    if (code >= 0x1d4b6 && code <= 0x1d4cf) return String.fromCodePoint(code - 0x1d4b6 + 0x61)
    if (code >= 0x1d4ea && code <= 0x1d503) return String.fromCodePoint(code - 0x1d4ea + 0x61)
    if (code >= 0x1d51e && code <= 0x1d537) return String.fromCodePoint(code - 0x1d51e + 0x61)
    if (code >= 0x1d552 && code <= 0x1d56b) return String.fromCodePoint(code - 0x1d552 + 0x61)
    if (code >= 0x1d586 && code <= 0x1d59f) return String.fromCodePoint(code - 0x1d586 + 0x61)
    if (code >= 0x1d5ba && code <= 0x1d5d3) return String.fromCodePoint(code - 0x1d5ba + 0x61)
    if (code >= 0x1d5ee && code <= 0x1d607) return String.fromCodePoint(code - 0x1d5ee + 0x61)
    if (code >= 0x1d622 && code <= 0x1d63b) return String.fromCodePoint(code - 0x1d622 + 0x61)
    if (code >= 0x1d656 && code <= 0x1d66f) return String.fromCodePoint(code - 0x1d656 + 0x61)
    if (code >= 0x1d68a && code <= 0x1d6a3) return String.fromCodePoint(code - 0x1d68a + 0x61)

    if (code >= 0x1d7ce && code <= 0x1d7d7) return String.fromCodePoint(code - 0x1d7ce + 0x30)
    if (code >= 0x1d7d8 && code <= 0x1d7e1) return String.fromCodePoint(code - 0x1d7d8 + 0x30)
    if (code >= 0x1d7e2 && code <= 0x1d7eb) return String.fromCodePoint(code - 0x1d7e2 + 0x30)
    if (code >= 0x1d7ec && code <= 0x1d7f5) return String.fromCodePoint(code - 0x1d7ec + 0x30)
    if (code >= 0x1d7f6 && code <= 0x1d7ff) return String.fromCodePoint(code - 0x1d7f6 + 0x30)

    return match
  })
}

/**
 * Strips HTML tags from a string and normalizes whitespace.
 * Replaces block-level tags with spaces to prevent words from sticking together.
 */
export function stripHtml(html: unknown): string {
  if (!html || typeof html !== 'string') return ''
  return html
    .replace(/<[^>]*>?/gm, ' ') // Replace all tags with a space
    .replace(/&nbsp;/g, ' ')     // Replace non-breaking spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces/newlines into one
    .trim()
}
