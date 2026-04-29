/**
 * Sanitizes HTML strings by removing non-breaking spaces,
 * multiple spaces, and empty paragraphs.
 * This helps prevent character-level word breaking in various browsers.
 */
export const cleanHTML = (html: string | null | undefined): string => {
  if (!html) return ""

  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
}
