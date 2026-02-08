// utils/display.js
// Small helper utilities for safe display of backend values.

export function safeVal(v) {
    // Return string or number safely from union types:
    // string | number | {en,vi} | null | {}
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number") return v;
    if (typeof v === "object") {
        // prefer en then vi then any primitive inside object
        if ("en" in v && (v.en || v.en === 0)) return v.en;
        if ("vi" in v && (v.vi || v.vi === 0)) return v.vi;
        // fallback: if object contains primitives, return first primitive value
        for (const key of Object.keys(v)) {
            const val = v[key];
            if (typeof val === "string" || typeof val === "number") return val;
        }
    }
    return "";
}

export function safeArray(a) {
    // ensures array or empty array
    if (!a) return [];
    if (Array.isArray(a)) return a;
    return [a];
}

export function formatNumber(num) {
    if (num === null || num === undefined || num === "") return "-";
    const n = Number(num);
    if (Number.isNaN(n)) return String(num);
    return n.toLocaleString();
}

/**
 * Normalizes "fancy fonts" (Unicode Mathematical Alphanumeric Symbols) 
 * back to standard Latin characters and digits.
 */
export function normalizeFancyText(text) {
    if (typeof text !== 'string') return text;

    return text.replace(/[\uD835][\uDC00-\uDFFF]/g, (match) => {
        const code = match.codePointAt(0);

        // Mathematical Alphanumeric Symbols (Standard ranges)
        // Ranges: Bold, Italic, Bold Italic, Script, Fraktur, Double-Struck, Sans-Serif, Monospace, etc.
        
        // A-Z ranges
        if (code >= 0x1D400 && code <= 0x1D419) return String.fromCodePoint(code - 0x1D400 + 0x41); // Bold A-Z
        if (code >= 0x1D434 && code <= 0x1D44D) return String.fromCodePoint(code - 0x1D434 + 0x41); // Italic A-Z
        if (code >= 0x1D468 && code <= 0x1D481) return String.fromCodePoint(code - 0x1D468 + 0x41); // Bold Italic A-Z
        if (code >= 0x1D49C && code <= 0x1D4B5) return String.fromCodePoint(code - 0x1D49C + 0x41); // Script A-Z
        if (code >= 0x1D4D0 && code <= 0x1D4E9) return String.fromCodePoint(code - 0x1D4D0 + 0x41); // Bold Script A-Z
        if (code >= 0x1D504 && code <= 0x1D51D) return String.fromCodePoint(code - 0x1D504 + 0x41); // Fraktur A-Z
        if (code >= 0x1D538 && code <= 0x1D551) return String.fromCodePoint(code - 0x1D538 + 0x41); // Double-struck A-Z
        if (code >= 0x1D56C && code <= 0x1D585) return String.fromCodePoint(code - 0x1D56C + 0x41); // Bold Fraktur A-Z
        if (code >= 0x1D5A0 && code <= 0x1D5B9) return String.fromCodePoint(code - 0x1D5A0 + 0x41); // Sans-serif A-Z
        if (code >= 0x1D5D4 && code <= 0x1D5ED) return String.fromCodePoint(code - 0x1D5D4 + 0x41); // Sans-serif Bold A-Z
        if (code >= 0x1D608 && code <= 0x1D621) return String.fromCodePoint(code - 0x1D608 + 0x41); // Sans-serif Italic A-Z
        if (code >= 0x1D63C && code <= 0x1D655) return String.fromCodePoint(code - 0x1D63C + 0x41); // Sans-serif Bold Italic A-Z
        if (code >= 0x1D670 && code <= 0x1D689) return String.fromCodePoint(code - 0x1D670 + 0x41); // Monospace A-Z

        // a-z ranges
        if (code >= 0x1D41A && code <= 0x1D433) return String.fromCodePoint(code - 0x1D41A + 0x61); // Bold a-z
        if (code >= 0x1D44E && code <= 0x1D467) return String.fromCodePoint(code - 0x1D44E + 0x61); // Italic a-z
        if (code >= 0x1D482 && code <= 0x1D49B) return String.fromCodePoint(code - 0x1D482 + 0x61); // Bold Italic a-z
        if (code >= 0x1D4B6 && code <= 0x1D4CF) return String.fromCodePoint(code - 0x1D4B6 + 0x61); // Script a-z (some are in BMP)
        if (code >= 0x1D4EA && code <= 0x1D503) return String.fromCodePoint(code - 0x1D4EA + 0x61); // Bold Script a-z
        if (code >= 0x1D51E && code <= 0x1D537) return String.fromCodePoint(code - 0x1D51E + 0x61); // Fraktur a-z
        if (code >= 0x1D552 && code <= 0x1D56B) return String.fromCodePoint(code - 0x1D552 + 0x61); // Double-struck a-z
        if (code >= 0x1D586 && code <= 0x1D59F) return String.fromCodePoint(code - 0x1D586 + 0x61); // Bold Fraktur a-z
        if (code >= 0x1D5BA && code <= 0x1D5D3) return String.fromCodePoint(code - 0x1D5BA + 0x61); // Sans-serif a-z
        if (code >= 0x1D5EE && code <= 0x1D607) return String.fromCodePoint(code - 0x1D5EE + 0x61); // Sans-serif Bold a-z
        if (code >= 0x1D622 && code <= 0x1D63B) return String.fromCodePoint(code - 0x1D622 + 0x61); // Sans-serif Italic a-z
        if (code >= 0x1D656 && code <= 0x1D66F) return String.fromCodePoint(code - 0x1D656 + 0x61); // Sans-serif Bold Italic a-z
        if (code >= 0x1D68A && code <= 0x1D6A3) return String.fromCodePoint(code - 0x1D68A + 0x61); // Monospace a-z

        // Digits 0-9
        if (code >= 0x1D7CE && code <= 0x1D7D7) return String.fromCodePoint(code - 0x1D7CE + 0x30); // Bold digits
        if (code >= 0x1D7D8 && code <= 0x1D7E1) return String.fromCodePoint(code - 0x1D7D8 + 0x30); // Double-struck digits
        if (code >= 0x1D7E2 && code <= 0x1D7EB) return String.fromCodePoint(code - 0x1D7E2 + 0x30); // Sans-serif digits
        if (code >= 0x1D7EC && code <= 0x1D7F5) return String.fromCodePoint(code - 0x1D7EC + 0x30); // Sans-serif bold digits
        if (code >= 0x1D7F6 && code <= 0x1D7FF) return String.fromCodePoint(code - 0x1D7F6 + 0x30); // Monospace digits

        return match;
    });
}
