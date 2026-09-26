import {
  countCharacters,
  countCharactersWithoutSpaces,
  countWords,
  countLines,
  countParagraphs,
  countSentences,
  calculateBytes,
  calculateReadingTime,
  getWordLengthStats,
  reverseUnicodeGraphemes,
  extractWords
} from '../../utils/unicode';

/**
 * 1. Word Counter Processor
 */
export function wordCounterProcessor(input: string) {
  const charCount = countCharacters(input);
  const charsNoSpaces = countCharactersWithoutSpaces(input);
  const wordCount = countWords(input);
  const lineCount = countLines(input);
  const paragraphCount = countParagraphs(input);
  const sentenceCount = countSentences(input);
  const readingTime = calculateReadingTime(wordCount);

  return {
    output: input, // word counter displays breakdown in metadata/stats
    metadata: {
      wordCount,
      charCount,
      charsNoSpaces,
      lineCount,
      paragraphCount,
      sentenceCount,
      readingTime
    }
  };
}

/**
 * 2. Character Counter Processor
 */
export function characterCounterProcessor(input: string) {
  const charCount = countCharacters(input);
  const charsNoSpaces = countCharactersWithoutSpaces(input);
  const byteCount = calculateBytes(input);
  const wordCount = countWords(input);
  const lineCount = countLines(input);

  return {
    output: input,
    metadata: {
      charCount,
      charsNoSpaces,
      byteCount,
      wordCount,
      lineCount
    }
  };
}

/**
 * 3. Text Statistics Processor
 */
export function textStatisticsProcessor(input: string) {
  const charCount = countCharacters(input);
  const charsNoSpaces = countCharactersWithoutSpaces(input);
  const wordCount = countWords(input);
  const byteCount = calculateBytes(input);
  const lineCount = countLines(input);
  const paragraphCount = countParagraphs(input);
  const sentenceCount = countSentences(input);
  const readingTime = calculateReadingTime(wordCount);
  const wordStats = getWordLengthStats(input);

  return {
    output: input,
    metadata: {
      wordCount,
      charCount,
      charsNoSpaces,
      byteCount,
      lineCount,
      paragraphCount,
      sentenceCount,
      avgWordLength: wordStats.avgWordLength,
      avgSentenceLength: wordStats.avgSentenceLength,
      longestWord: wordStats.longestWord,
      shortestWord: wordStats.shortestWord,
      readingTime
    }
  };
}

/**
 * 4. Reading Time Calculator Processor
 */
export function readingTimeCalculatorProcessor(input: string, options?: Record<string, any>) {
  const wpm = options?.wpm ? Number(options.wpm) : 200;
  const wordCount = countWords(input);
  const minutesDecimal = wordCount / (wpm || 200);

  const totalSeconds = Math.round(minutesDecimal * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  let formattedTime = '0 seconds';
  if (minutes > 0 && seconds > 0) {
    formattedTime = `${minutes} min ${seconds} sec`;
  } else if (minutes > 0) {
    formattedTime = `${minutes} min`;
  } else if (seconds > 0) {
    formattedTime = `${seconds} sec`;
  }

  return {
    output: input,
    metadata: {
      wordCount,
      wpm,
      readingTimeFormatted: formattedTime,
      minutes,
      seconds
    }
  };
}

/**
 * 5. Uppercase Converter
 */
export function uppercaseProcessor(input: string) {
  return {
    output: input.toUpperCase(),
    metadata: { mode: 'UPPERCASE' }
  };
}

/**
 * 6. Lowercase Converter
 */
export function lowercaseProcessor(input: string) {
  return {
    output: input.toLowerCase(),
    metadata: { mode: 'lowercase' }
  };
}

/**
 * 7. Title Case Converter
 * Intelligently capitalizes title words while preserving URLs, email addresses, and minor words (a, an, the, and, but, for, etc.).
 */
export function titleCaseProcessor(input: string) {
  if (!input) return { output: '' };

  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'off', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'yet']);

  const processLine = (line: string) => {
    // Preserve URLs or email addresses
    if (line.includes('http://') || line.includes('https://') || line.includes('@')) {
      const parts = line.split(/(\s+)/);
      return parts.map(part => {
        if (/^https?:\/\/\S+$/i.test(part) || /^\S+@\S+\.\S+$/i.test(part)) {
          return part;
        }
        return processLineText(part);
      }).join('');
    }

    return processLineText(line);
  };

  const processLineText = (text: string) => {
    const words = text.split(/(\s+|[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/);
    let wordIndex = 0;

    return words.map(word => {
      if (!word.trim() || /^[^\w\u0600-\u06FF]+$/.test(word)) {
        return word; // whitespace or punctuation
      }

      wordIndex++;
      const lower = word.toLowerCase();

      // Always capitalize first and last words, or words not in minorWords list
      if (wordIndex === 1 || !minorWords.has(lower)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      return lower;
    }).join('');
  };

  const output = input.split(/\r?\n/).map(processLine).join('\n');
  return { output, metadata: { mode: 'Title Case' } };
}

/**
 * 8. Sentence Case Converter
 * Capitalizes the first letter of each sentence while preserving paragraph boundaries, URLs, and punctuation.
 */
export function sentenceCaseProcessor(input: string) {
  if (!input) return { output: '' };

  const processParagraph = (p: string) => {
    if (!p.trim()) return p;

    // Preserve URLs
    const urlMatches: { placeholder: string; original: string }[] = [];
    let processed = p.replace(/(https?:\/\/\S+|\S+@\S+\.\S+)/gi, (match) => {
      const placeholder = `__URL_PLACEHOLDER_${urlMatches.length}__`;
      urlMatches.push({ placeholder, original: match });
      return placeholder;
    });

    // Capitalize first character of text and after sentence delimiters (. ! ?)
    processed = processed.toLowerCase();
    processed = processed.replace(/(^\s*|[.!?؟]\s+)([\w\u0600-\u06FF])/g, (m, p1, p2) => {
      return p1 + p2.toUpperCase();
    });

    // Restore URLs
    urlMatches.forEach(({ placeholder, original }) => {
      processed = processed.replace(placeholder, original);
    });

    return processed;
  };

  const output = input.split(/(\r?\n)/).map(part => {
    if (/^\r?\n$/.test(part)) return part;
    return processParagraph(part);
  }).join('');

  return { output, metadata: { mode: 'Sentence case' } };
}

/**
 * 9. Remove Extra Spaces
 */
export function removeExtraSpacesProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const normalizeTabs = options?.normalizeTabs ?? true;

  let text = input;
  if (normalizeTabs) {
    text = text.replace(/\t/g, ' ');
  }

  // Replace 2+ spaces with a single space per line, while preserving line breaks
  const output = text
    .split(/\r?\n/)
    .map(line => line.replace(/ {2,}/g, ' ').trim())
    .join('\n');

  return { output, metadata: { mode: 'Remove Extra Spaces' } };
}

/**
 * 10. Remove Empty Lines
 */
export function removeEmptyLinesProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const preserveSingleBlank = options?.preserveSingleBlank ?? false;

  const lines = input.split(/\r?\n/);

  if (preserveSingleBlank) {
    const result: string[] = [];
    let prevWasEmpty = false;

    for (const line of lines) {
      const isEmpty = line.trim().length === 0;
      if (isEmpty) {
        if (!prevWasEmpty) {
          result.push('');
          prevWasEmpty = true;
        }
      } else {
        result.push(line);
        prevWasEmpty = false;
      }
    }
    return { output: result.join('\n') };
  }

  const output = lines.filter(line => line.trim().length > 0).join('\n');
  return { output, metadata: { mode: 'Remove Empty Lines' } };
}

/**
 * 11. Remove Duplicate Lines
 */
export function removeDuplicateLinesProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const caseSensitive = options?.caseSensitive ?? true;
  const trimLines = options?.trimLines ?? false;

  const lines = input.split(/\r?\n/);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const keyCandidate = trimLines ? line.trim() : line;
    const key = caseSensitive ? keyCandidate : keyCandidate.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  return {
    output: result.join('\n'),
    metadata: {
      originalLineCount: lines.length,
      newLineCount: result.length,
      removedCount: lines.length - result.length
    }
  };
}

/**
 * 12. Sort Lines
 */
export function sortLinesProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const order = options?.order || 'asc'; // 'asc' | 'desc'
  const caseSensitive = options?.caseSensitive ?? false;
  const numericSort = options?.numericSort ?? false;
  const removeEmpty = options?.removeEmpty ?? false;

  let lines = input.split(/\r?\n/);

  if (removeEmpty) {
    lines = lines.filter(l => l.trim().length > 0);
  }

  lines.sort((a, b) => {
    if (numericSort) {
      const numA = parseFloat(a.replace(/[^0-9.-]+/g, ''));
      const numB = parseFloat(b.replace(/[^0-9.-]+/g, ''));

      if (!isNaN(numA) && !isNaN(numB)) {
        return order === 'asc' ? numA - numB : numB - numA;
      }
    }

    const strA = caseSensitive ? a : a.toLowerCase();
    const strB = caseSensitive ? b : b.toLowerCase();

    const comp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: caseSensitive ? 'variant' : 'base' });
    return order === 'asc' ? comp : -comp;
  });

  return { output: lines.join('\n'), metadata: { lineCount: lines.length, order } };
}

/**
 * 13. Reverse Text
 */
export function reverseTextProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const mode = options?.mode || 'entire'; // 'entire' | 'perLine' | 'wordOrder'

  if (mode === 'perLine') {
    const lines = input.split(/\r?\n/);
    const output = lines.map(line => reverseUnicodeGraphemes(line)).join('\n');
    return { output, metadata: { mode: 'Reverse Each Line' } };
  }

  if (mode === 'wordOrder') {
    const lines = input.split(/\r?\n/);
    const output = lines.map(line => {
      const words = extractWords(line);
      return words.reverse().join(' ');
    }).join('\n');
    return { output, metadata: { mode: 'Reverse Word Order' } };
  }

  // Entire text reverse using Unicode-safe graphemes
  const output = reverseUnicodeGraphemes(input);
  return { output, metadata: { mode: 'Reverse Entire Text' } };
}

/**
 * 14. Text Cleaner
 */
export function textCleanerProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '' };

  const trim = options?.trim ?? true;
  const removeExtraSpaces = options?.removeExtraSpaces ?? true;
  const removeEmptyLines = options?.removeEmptyLines ?? true;
  const removeDuplicates = options?.removeDuplicates ?? false;
  const removeTabs = options?.removeTabs ?? true;

  let lines = input.split(/\r?\n/);

  lines = lines.map(line => {
    let l = line;
    if (removeTabs) l = l.replace(/\t/g, ' ');
    if (removeExtraSpaces) l = l.replace(/ {2,}/g, ' ');
    if (trim) l = l.trim();
    return l;
  });

  if (removeEmptyLines) {
    lines = lines.filter(l => l.length > 0);
  }

  if (removeDuplicates) {
    const seen = new Set<string>();
    lines = lines.filter(l => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    });
  }

  let output = lines.join('\n');
  if (trim) {
    output = output.trim();
  }

  return { output, metadata: { mode: 'Text Cleaner' } };
}

/**
 * 15. Find & Replace
 */
export function findAndReplaceProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '', metadata: { count: 0 } };

  const search = options?.search || '';
  const replace = options?.replace || '';
  const replaceAll = options?.replaceAll ?? true;
  const caseSensitive = options?.caseSensitive ?? false;
  const wholeWord = options?.wholeWord ?? false;

  if (!search) {
    return { output: input, metadata: { count: 0 } };
  }

  // Escape regex special chars
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = wholeWord ? '\\b' : '';
  const flags = (replaceAll ? 'g' : '') + (caseSensitive ? '' : 'i');

  try {
    const regex = new RegExp(`${boundary}${escapedSearch}${boundary}`, flags);
    const matches = input.match(regex);
    const count = matches ? matches.length : 0;

    const output = input.replace(regex, replace);
    return {
      output,
      metadata: { count, search, replace }
    };
  } catch (err) {
    return { output: input, metadata: { count: 0, error: 'Invalid search string' } };
  }
}

/**
 * 16. Text Compare Processor
 * Line by line diff analysis
 */
export function textCompareProcessor(inputA: string, inputB: string) {
  const linesA = (inputA || '').split(/\r?\n/);
  const linesB = (inputB || '').split(/\r?\n/);

  const isIdentical = inputA === inputB;

  const diffLines: Array<{
    type: 'added' | 'removed' | 'unchanged';
    lineANumber?: number;
    lineBNumber?: number;
    text: string;
  }> = [];

  let lineCountA = 0;
  let lineCountB = 0;

  const maxLen = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];

    if (a === b) {
      if (a !== undefined) {
        lineCountA++;
        lineCountB++;
        diffLines.push({ type: 'unchanged', lineANumber: lineCountA, lineBNumber: lineCountB, text: a });
      }
    } else {
      if (a !== undefined) {
        lineCountA++;
        diffLines.push({ type: 'removed', lineANumber: lineCountA, text: a });
      }
      if (b !== undefined) {
        lineCountB++;
        diffLines.push({ type: 'added', lineBNumber: lineCountB, text: b });
      }
    }
  }

  return {
    output: isIdentical ? 'Texts are identical.' : 'Texts contain differences.',
    metadata: {
      isIdentical,
      linesACount: linesA.length,
      linesBCount: linesB.length,
      diffLines
    }
  };
}

/**
 * 17. Text Splitter
 */
export function textSplitterProcessor(input: string, options?: Record<string, any>) {
  if (!input) return { output: '', metadata: { chunks: [] } };

  const splitBy = options?.splitBy || 'chars'; // 'chars' | 'words' | 'lines'
  const chunkSize = Math.max(1, Number(options?.chunkSize) || 1000);

  const chunks: string[] = [];

  if (splitBy === 'chars') {
    // Unicode grapheme-aware character splitting
    const graphemes = Array.from(input);
    for (let i = 0; i < graphemes.length; i += chunkSize) {
      chunks.push(graphemes.slice(i, i + chunkSize).join(''));
    }
  } else if (splitBy === 'words') {
    const words = extractWords(input);
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
  } else if (splitBy === 'lines') {
    const lines = input.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
  }

  return {
    output: chunks.join('\n--- CHUNK SEPARATOR ---\n'),
    metadata: {
      chunkCount: chunks.length,
      chunks,
      splitBy,
      chunkSize
    }
  };
}

/**
 * 18. Text Merger
 */
export function textMergerProcessor(textBlocks: string[], separator = '\n') {
  const filtered = textBlocks.filter(t => t !== undefined && t !== null);
  let sep = separator;
  if (separator === '\\n') sep = '\n';
  if (separator === '\\n\\n') sep = '\n\n';

  const output = filtered.join(sep);
  return {
    output,
    metadata: { blockCount: filtered.length, separator }
  };
}

/**
 * 19. Lorem Ipsum Generator
 */
export function loremIpsumProcessor(options?: Record<string, any>) {
  const mode = options?.mode || 'paragraphs'; // 'paragraphs' | 'sentences' | 'words'
  const count = Math.min(100, Math.max(1, Number(options?.count) || 3));

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehender',
    'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateSentence = () => {
    const wordCount = Math.floor(Math.random() * 10) + 6;
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
      words.push(randomWord);
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  let output = '';

  if (mode === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(loremWords[i % loremWords.length]);
    }
    output = words.join(' ');
  } else if (mode === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence());
    }
    output = sentences.join(' ');
  } else {
    // Paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(generateParagraph());
    }
    output = paragraphs.join('\n\n');
  }

  return {
    output,
    metadata: { mode, count }
  };
}

/**
 * 20. Random Text Generator
 */
export function randomTextProcessor(options?: Record<string, any>) {
  const mode = options?.mode || 'paragraphs';
  const count = Math.min(100, Math.max(1, Number(options?.count) || 3));
  const includeNumbers = options?.includeNumbers ?? true;
  const includePunctuation = options?.includePunctuation ?? true;

  const sampleWords = [
    'alpha', 'beacon', 'cascade', 'delta', 'echo', 'falcon', 'galaxy', 'horizon',
    'infinite', 'jubilant', 'kindle', 'lunar', 'matrix', 'nebula', 'orbit',
    'pulsar', 'quantum', 'radiant', 'spectrum', 'timber', 'unity', 'vector',
    'whisper', 'xenon', 'yield', 'zenith', 'artisan', 'breeze', 'crystal', 'dynamic'
  ];

  const generateWord = () => {
    let word = sampleWords[Math.floor(Math.random() * sampleWords.length)];
    if (includeNumbers && Math.random() > 0.7) {
      word += Math.floor(Math.random() * 100);
    }
    return word;
  };

  const generateSentence = () => {
    const wordCount = Math.floor(Math.random() * 8) + 5;
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(generateWord());
    }
    let sentence = words.join(' ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (includePunctuation) {
      const puncts = ['.', '.', '.', '!', '?'];
      sentence += puncts[Math.floor(Math.random() * puncts.length)];
    }
    return sentence;
  };

  let output = '';

  if (mode === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(generateWord());
    }
    output = words.join(' ');
  } else if (mode === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence());
    }
    output = sentences.join(' ');
  } else {
    // Paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      const pSentences: string[] = [];
      const sCount = Math.floor(Math.random() * 3) + 3;
      for (let s = 0; s < sCount; s++) {
        pSentences.push(generateSentence());
      }
      paragraphs.push(pSentences.join(' '));
    }
    output = paragraphs.join('\n\n');
  }

  return {
    output,
    metadata: { mode, count }
  };
}
