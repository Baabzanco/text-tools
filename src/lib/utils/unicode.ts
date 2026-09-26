import { TextStatistics } from '../../types';

/**
 * Counts characters accurately including Unicode surrogate pairs, emojis, and multi-byte characters.
 */
export function countCharacters(text: string): number {
  if (!text) return 0;
  
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text)).length;
    } catch {
      // Fallback
    }
  }

  return Array.from(text).length;
}

/**
 * Counts characters excluding spaces, tabs, and newlines.
 */
export function countCharactersWithoutSpaces(text: string): number {
  if (!text) return 0;
  const noWhitespace = text.replace(/[\s\r\n\t]/g, '');
  return countCharacters(noWhitespace);
}

/**
 * Extracts array of words considering Unicode spaces and non-English scripts (Persian, Arabic, CJK).
 */
export function extractWords(text: string): string[] {
  if (!text || !text.trim()) return [];

  const trimmed = text.trim();

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
      const words: string[] = [];
      for (const segment of segmenter.segment(trimmed)) {
        if (segment.isWordLike) {
          words.push(segment.segment);
        }
      }
      return words;
    } catch {
      // Fallback
    }
  }

  return trimmed.split(/[\s\r\n\t]+/).filter(w => w.length > 0);
}

/**
 * Counts words accurately.
 */
export function countWords(text: string): number {
  return extractWords(text).length;
}

/**
 * Counts total lines in text.
 */
export function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

/**
 * Counts paragraphs (blocks separated by one or more blank lines or newlines).
 */
export function countParagraphs(text: string): number {
  if (!text || !text.trim()) return 0;
  const paragraphs = text.trim().split(/[\r\n]{2,}/);
  return paragraphs.filter(p => p.trim().length > 0).length;
}

/**
 * Counts sentences in text using Unicode sentence boundaries (. ! ? and CJK/Persian/Arabic full stops).
 */
export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
      return Array.from(segmenter.segment(text.trim())).length;
    } catch {
      // Fallback
    }
  }

  // Fallback regex matching punctuation followed by space or end of text
  const sentences = text.trim().split(/(?<=[\.\!\?؟\u061F\u0964])\s+/);
  return sentences.filter(s => s.trim().length > 0).length;
}

/**
 * Calculates total size in bytes using UTF-8 encoding.
 */
export function calculateBytes(text: string): number {
  if (!text) return 0;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  return unescape(encodeURIComponent(text)).length;
}

/**
 * Calculates estimated reading time in minutes based on WPM (default 200).
 */
export function calculateReadingTime(wordCount: number, wpm = 200): number {
  if (!wordCount || wpm <= 0) return 0;
  const minutes = wordCount / wpm;
  return Math.max(0.1, Math.round(minutes * 10) / 10);
}

/**
 * Computes word length statistics (longest, shortest, average length).
 */
export function getWordLengthStats(text: string): {
  longestWord: string;
  shortestWord: string;
  avgWordLength: number;
  avgSentenceLength: number;
} {
  const words = extractWords(text);
  if (words.length === 0) {
    return { longestWord: '', shortestWord: '', avgWordLength: 0, avgSentenceLength: 0 };
  }

  let longest = words[0];
  let shortest = words[0];
  let totalCharCount = 0;

  for (const word of words) {
    const len = countCharacters(word);
    totalCharCount += len;
    if (len > countCharacters(longest)) longest = word;
    if (len < countCharacters(shortest)) shortest = word;
  }

  const sentenceCount = countSentences(text) || 1;

  return {
    longestWord: longest,
    shortestWord: shortest,
    avgWordLength: Math.round((totalCharCount / words.length) * 10) / 10,
    avgSentenceLength: Math.round((words.length / sentenceCount) * 10) / 10
  };
}

/**
 * Reverses string safely without breaking Unicode grapheme clusters or emoji surrogate pairs.
 */
export function reverseUnicodeGraphemes(text: string): string {
  if (!text) return '';
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      const graphemes = Array.from(segmenter.segment(text)).map(s => s.segment);
      return graphemes.reverse().join('');
    } catch {
      // Fallback
    }
  }
  return Array.from(text).reverse().join('');
}

/**
 * Computes complete text statistics for any string.
 */
export function computeTextStatistics(text: string): TextStatistics {
  const wordCount = countWords(text);
  return {
    charCount: countCharacters(text),
    wordCount,
    lineCount: countLines(text),
    byteCount: calculateBytes(text),
    readingTimeMinutes: calculateReadingTime(wordCount),
  };
}
