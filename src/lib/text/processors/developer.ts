import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { format as formatSql } from 'sql-formatter';
import jsBeautify from 'js-beautify';

/**
 * UTF-8 Safe Base64 Helpers
 */
export function utf8ToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    // Fallback
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export function base64ToUtf8(str: string): string {
  try {
    const clean = str.trim().replace(/\s/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    throw new Error('Invalid Base64 string formatting or characters');
  }
}

/**
 * 1. JSON Formatter
 */
export function jsonFormatterProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { valid: false } };
  }

  const indent = options?.indent === '4' ? 4 : options?.indent === 'tab' ? '\t' : 2;

  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed, null, indent);

    // Compute basic statistics
    const keysCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
    const rootType = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed;

    return {
      output,
      metadata: {
        valid: true,
        rootType,
        keysCount
      }
    };
  } catch (err: any) {
    return {
      output: input,
      metadata: {
        valid: false,
        error: err?.message || 'Invalid JSON syntax'
      }
    };
  }
}

/**
 * 2. JSON Validator
 */
export function jsonValidatorProcessor(input: string) {
  if (!input || !input.trim()) {
    return { output: 'Enter JSON above to validate.', metadata: { isValid: false } };
  }

  try {
    const parsed = JSON.parse(input);

    const computeDepth = (val: any): number => {
      if (typeof val !== 'object' || val === null) return 1;
      let depth = 1;
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          depth = Math.max(depth, 1 + computeDepth(val[key]));
        }
      }
      return depth;
    };

    const countKeys = (val: any): number => {
      if (typeof val !== 'object' || val === null) return 0;
      let count = 0;
      if (Array.isArray(val)) {
        count += val.length;
        val.forEach(item => count += countKeys(item));
      } else {
        const keys = Object.keys(val);
        count += keys.length;
        keys.forEach(k => count += countKeys(val[k]));
      }
      return count;
    };

    const rootType = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed;
    const nestingDepth = computeDepth(parsed);
    const keyCount = countKeys(parsed);

    return {
      output: 'VALID JSON',
      metadata: {
        isValid: true,
        rootType,
        nestingDepth,
        keyCount
      }
    };
  } catch (err: any) {
    return {
      output: 'INVALID JSON',
      metadata: {
        isValid: false,
        error: err?.message || 'Invalid JSON syntax'
      }
    };
  }
}

/**
 * 3. JSON Minifier
 */
export function jsonMinifierProcessor(input: string) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { valid: false } };
  }

  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed);
    return {
      output,
      metadata: {
        valid: true,
        originalLength: input.length,
        minifiedLength: output.length,
        savingsBytes: Math.max(0, input.length - output.length)
      }
    };
  } catch (err: any) {
    return {
      output: input,
      metadata: {
        valid: false,
        error: err?.message || 'Invalid JSON syntax'
      }
    };
  }
}

/**
 * 4. Base64 Encoder
 */
export function base64EncoderProcessor(input: string) {
  if (!input) return { output: '' };
  try {
    const output = utf8ToBase64(input);
    return { output, metadata: { mode: 'Base64 Encoded' } };
  } catch (err: any) {
    return { output: '', metadata: { error: err?.message || 'Base64 encoding error' } };
  }
}

/**
 * 5. Base64 Decoder
 */
export function base64DecoderProcessor(input: string) {
  if (!input || !input.trim()) return { output: '' };
  try {
    const output = base64ToUtf8(input);
    return { output, metadata: { mode: 'Base64 Decoded' } };
  } catch (err: any) {
    return { output: '', metadata: { error: 'Invalid Base64 payload' } };
  }
}

/**
 * 6. URL Encoder
 */
export function urlEncoderProcessor(input: string) {
  if (!input) return { output: '' };
  try {
    const output = encodeURIComponent(input);
    return { output, metadata: { mode: 'URL Encoded' } };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'URL Encoding error' } };
  }
}

/**
 * 7. URL Decoder
 */
export function urlDecoderProcessor(input: string) {
  if (!input) return { output: '' };
  try {
    const output = decodeURIComponent(input);
    return { output, metadata: { mode: 'URL Decoded' } };
  } catch (err: any) {
    return { output: input, metadata: { error: 'Malformed percent-encoded URI component' } };
  }
}

/**
 * 8. HTML Encoder
 */
export function htmlEncoderProcessor(input: string) {
  if (!input) return { output: '' };
  const output = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return { output, metadata: { mode: 'HTML Entities Encoded' } };
}

/**
 * 9. HTML Decoder
 */
export function htmlDecoderProcessor(input: string) {
  if (!input) return { output: '' };

  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' '
  };

  let output = input.replace(/&(amp|lt|gt|quot|#39|#x27|#x2F|nbsp);/g, (match) => entities[match] || match);

  // Decimal entities e.g. &#65;
  output = output.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // Hex entities e.g. &#x41;
  output = output.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return { output, metadata: { mode: 'HTML Entities Decoded' } };
}

/**
 * 10. Unicode Encoder / Decoder
 */
export function unicodeConverterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  const mode = options?.mode || 'encode'; // 'encode' | 'decode'

  if (mode === 'decode') {
    try {
      const output = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      return { output, metadata: { mode: 'Unicode Decoded' } };
    } catch (err) {
      return { output: input, metadata: { error: 'Malformed Unicode escape sequence' } };
    }
  }

  // Encode text to \uXXXX
  const output = Array.from(input)
    .map(char => {
      const code = char.codePointAt(0);
      if (!code) return char;
      if (code > 0x7f) {
        return '\\u' + code.toString(16).padStart(4, '0');
      }
      return char;
    })
    .join('');

  return { output, metadata: { mode: 'Unicode Encoded' } };
}

/**
 * 11. HTML Formatter
 */
export function htmlFormatterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  const indent = Number(options?.indent) || 2;
  try {
    const output = jsBeautify.html(input, { indent_size: indent, wrap_line_length: 0 });
    return { output, metadata: { mode: 'HTML Formatted' } };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'HTML formatting error' } };
  }
}

/**
 * 12. CSS Formatter
 */
export function cssFormatterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  const indent = Number(options?.indent) || 2;
  try {
    const output = jsBeautify.css(input, { indent_size: indent });
    return { output, metadata: { mode: 'CSS Formatted' } };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'CSS formatting error' } };
  }
}

/**
 * 13. JavaScript Formatter
 */
export function javascriptFormatterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  const indent = Number(options?.indent) || 2;
  try {
    const output = jsBeautify.js(input, { indent_size: indent });
    return { output, metadata: { mode: 'JavaScript Formatted' } };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'JavaScript formatting error' } };
  }
}

/**
 * 14. SQL Formatter
 */
export function sqlFormatterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  try {
    const output = formatSql(input, {
      language: 'sql',
      tabWidth: 2,
      keywordCase: 'upper'
    });
    return { output, metadata: { mode: 'SQL Formatted' } };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'SQL formatting error' } };
  }
}

/**
 * 15. Markdown to HTML Converter
 */
export function markdownToHtmlProcessor(input: string) {
  if (!input) return { output: '', metadata: { sanitizedHtml: '' } };
  try {
    const rawHtml = marked.parse(input) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return {
      output: sanitizedHtml,
      metadata: {
        rawHtml,
        sanitizedHtml
      }
    };
  } catch (err: any) {
    return { output: input, metadata: { error: err?.message || 'Markdown parsing error' } };
  }
}

/**
 * 16. Regex Tester Processor
 */
export function regexTesterProcessor(input: string, options?: Record<string, any>) {
  const pattern = options?.pattern || '';
  const flags = options?.flags || 'g';

  if (!pattern) {
    return { output: input, metadata: { matches: [], matchCount: 0 } };
  }

  if (pattern.length > 500) {
    return {
      output: input,
      metadata: { valid: false, error: 'Pattern exceeds max safety length limit of 500 characters.' }
    };
  }

  if (input.length > 100000) {
    return {
      output: input,
      metadata: { valid: false, error: 'Input text exceeds max safety limit of 100,000 characters for live regex evaluation.' }
    };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matchesArr: Array<{ match: string; index: number; groups: string[] }> = [];

    let match: RegExpExecArray | null;
    let iterations = 0;
    const maxIterations = 5000;

    if (flags.includes('g')) {
      while ((match = regex.exec(input)) !== null && iterations < maxIterations) {
        iterations++;
        matchesArr.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(input);
      if (match) {
        matchesArr.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }

    return {
      output: input,
      metadata: {
        valid: true,
        matchCount: matchesArr.length,
        matches: matchesArr
      }
    };
  } catch (err: any) {
    return {
      output: input,
      metadata: {
        valid: false,
        error: err?.message || 'Invalid Regular Expression'
      }
    };
  }
}

/**
 * 17. JWT Decoder Processor
 */
export function jwtDecoderProcessor(input: string) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { valid: false } };
  }

  const token = input.trim();
  const parts = token.split('.');

  if (parts.length !== 3) {
    return {
      output: input,
      metadata: {
        valid: false,
        error: 'Invalid JWT structure: JWT must consist of three dot-separated sections (header.payload.signature).'
      }
    };
  }

  try {
    const headerJson = JSON.parse(base64ToUtf8(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payloadJson = JSON.parse(base64ToUtf8(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    return {
      output: token,
      metadata: {
        valid: true,
        header: headerJson,
        payload: payloadJson,
        signature,
        disclaimer: 'Decoding a JWT locally does not verify its cryptographic signature.'
      }
    };
  } catch (err: any) {
    return {
      output: token,
      metadata: {
        valid: false,
        error: 'Failed to decode JWT payload: Malformed Base64 or JSON structure'
      }
    };
  }
}

/**
 * 18. Unix Timestamp Converter Processor
 */
export function timestampConverterProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    const ms = now.getTime();
    return {
      output: '',
      metadata: {
        valid: true,
        nowSec: sec,
        nowMs: ms,
        nowIso: now.toISOString(),
        nowUtc: now.toUTCString(),
        nowLocal: now.toLocaleString()
      }
    };
  }

  const num = Number(input.trim());

  if (isNaN(num)) {
    // Try parsing date string
    const d = new Date(input.trim());
    if (isNaN(d.getTime())) {
      return { output: input, metadata: { valid: false, error: 'Invalid date or timestamp string' } };
    }
    const sec = Math.floor(d.getTime() / 1000);
    const ms = d.getTime();
    return {
      output: sec.toString(),
      metadata: {
        valid: true,
        sec,
        ms,
        iso: d.toISOString(),
        utc: d.toUTCString(),
        local: d.toLocaleString()
      }
    };
  }

  // If input length <= 11 digits, assume seconds; if > 11 digits, assume milliseconds
  const ms = input.trim().length > 11 ? num : num * 1000;
  const sec = Math.floor(ms / 1000);
  const d = new Date(ms);

  if (isNaN(d.getTime())) {
    return { output: input, metadata: { valid: false, error: 'Timestamp out of range' } };
  }

  return {
    output: d.toISOString(),
    metadata: {
      valid: true,
      sec,
      ms,
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString()
    }
  };
}

/**
 * 19. Hash Generator Processor (Async / Sync helper)
 */
export async function hashGeneratorProcessorAsync(input: string, algorithm = 'SHA-256') {
  if (!input) return { output: '', metadata: { algorithm } };

  try {
    const algoMap: Record<string, string> = {
      'SHA-256': 'SHA-256',
      'SHA-384': 'SHA-384',
      'SHA-512': 'SHA-512'
    };

    const targetAlgo = algoMap[algorithm] || 'SHA-256';
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(targetAlgo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      output: hashHex,
      metadata: {
        algorithm: targetAlgo,
        hashHex
      }
    };
  } catch (err: any) {
    return { output: '', metadata: { error: err?.message || 'Cryptographic hashing failed' } };
  }
}

/**
 * 20. Escape / Unescape String Processor
 */
export function escapeUnescapeProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };
  const mode = options?.mode || 'json-escape'; // 'json-escape' | 'js-escape' | 'unescape'

  if (mode === 'unescape') {
    try {
      const output = input
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
      return { output, metadata: { mode: 'Unescaped String' } };
    } catch (err) {
      return { output: input, metadata: { error: 'Error unescaping string' } };
    }
  }

  if (mode === 'js-escape') {
    const output = input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return { output, metadata: { mode: 'JS String Escaped' } };
  }

  // Default: JSON Escape
  const output = JSON.stringify(input);
  return { output, metadata: { mode: 'JSON Escaped' } };
}
