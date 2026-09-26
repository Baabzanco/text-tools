import DOMPurify from 'dompurify';
import { countCharacters, countWords, extractWords, countSentences, countLines } from '../../utils/unicode';

// Common English Stop Words
const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Common Persian Stop Words
const PERSIAN_STOP_WORDS = new Set([
  'از', 'با', 'به', 'بر', 'برای', 'در', 'تا', 'بی', 'که', 'این', 'آن', 'آنها', 'وی', 'او', 'ما', 'شما', 'من', 'است',
  'بود', 'شد', 'شدند', 'باید', 'هم', 'نیز', 'یا', 'و', 'چون', 'اگر', 'اما', 'ولی', 'زیرا', 'خود', 'یک', 'یکی', 'چند'
]);

/**
 * Helper to escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 1. Keyword Counter Processor
 */
export function keywordCounterProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { results: [], totalMatches: 0, totalWords: 0 } };
  }

  const rawKeywords = options?.keywords || '';
  const caseSensitive = options?.caseSensitive ?? false;
  const wholeWord = options?.wholeWord ?? true;

  const totalWords = countWords(input);
  const keywordsList = (typeof rawKeywords === 'string' ? rawKeywords.split(/[\n,]+/) : [])
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const results: Array<{ keyword: string; count: number; percentage: number }> = [];
  let totalMatches = 0;

  keywordsList.forEach(kw => {
    let count = 0;
    const flags = (caseSensitive ? '' : 'i') + 'g' + 'u';

    if (wholeWord) {
      // Unicode-aware word boundary pattern
      const pattern = new RegExp(`(?<=^|[\\s\\p{P}])${escapeRegex(kw)}(?=$|[\\s\\p{P}])`, flags);
      const matches = input.match(pattern);
      count = matches ? matches.length : 0;
    } else {
      const pattern = new RegExp(escapeRegex(kw), flags);
      const matches = input.match(pattern);
      count = matches ? matches.length : 0;
    }

    const percentage = totalWords > 0 ? Math.round((count / totalWords) * 10000) / 100 : 0;
    totalMatches += count;

    results.push({ keyword: kw, count, percentage });
  });

  return {
    output: input,
    metadata: {
      results,
      totalMatches,
      totalWords
    }
  };
}

/**
 * 2. Keyword Density Checker Processor
 */
export function keywordDensityProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { items: [], totalWords: 0 } };
  }

  const totalWords = countWords(input);
  const words = extractWords(input);
  const frequencyMap = new Map<string, number>();

  words.forEach(w => {
    const key = w.toLowerCase();
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  });

  const items = Array.from(frequencyMap.entries())
    .map(([word, count]) => {
      const density = totalWords > 0 ? Math.round((count / totalWords) * 10000) / 100 : 0;
      return {
        word,
        count,
        density,
        isHighDensity: density > 4.5
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    output: input,
    metadata: {
      items: items.slice(0, 50),
      totalWords
    }
  };
}

/**
 * 3. Word Frequency Processor
 */
export function wordFrequencyProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { frequencies: [], totalWords: 0, uniqueWords: 0 } };
  }

  const caseSensitive = options?.caseSensitive ?? false;
  const minLength = Number(options?.minLength) || 1;
  const ignoreNumbers = options?.ignoreNumbers ?? false;
  const ignoreStopWords = options?.ignoreStopWords ?? false;

  const rawWords = extractWords(input);
  const totalWords = rawWords.length;
  const frequencyMap = new Map<string, number>();

  rawWords.forEach(rawWord => {
    let word = caseSensitive ? rawWord : rawWord.toLowerCase();

    if (ignoreNumbers && /^\d+$/.test(word)) return;
    if (word.length < minLength) return;
    if (ignoreStopWords) {
      const lower = word.toLowerCase();
      if (ENGLISH_STOP_WORDS.has(lower) || PERSIAN_STOP_WORDS.has(lower)) return;
    }

    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  });

  const frequencies = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: totalWords > 0 ? Math.round((count / totalWords) * 10000) / 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  return {
    output: input,
    metadata: {
      frequencies,
      totalWords,
      uniqueWords: frequencyMap.size
    }
  };
}

/**
 * 4. Slug Generator Processor
 */
export function slugGeneratorProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { slug: '' } };
  }

  const maxLength = Number(options?.maxLength) || 100;

  let text = input.trim().toLowerCase();

  // Transliteration map for Persian/Arabic to Latin if requested
  if (options?.transliterate) {
    const map: Record<string, string> = {
      'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch',
      'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
      'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
      'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h',
      'ی': 'y', 'ك': 'k', 'ي': 'y'
    };
    text = Array.from(text).map(ch => map[ch] || ch).join('');
  }

  // Replace whitespace and punctuation with hyphens, preserve Persian/Arabic Unicode range
  let slug = text
    .replace(/[^\w\s-\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, '');
  }

  return {
    output: slug,
    metadata: { slug }
  };
}

/**
 * 5. Readability Checker Processor
 */
export function readabilityCheckerProcessor(input: string) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { words: 0, sentences: 0, fleschEase: 0, gradeLevel: 0, isNonEnglish: false } };
  }

  const words = countWords(input);
  const sentences = Math.max(1, countSentences(input));
  const chars = countCharacters(input);

  // Heuristic check for Persian/Arabic characters
  const isNonEnglish = /[\u0600-\u06FF]/.test(input);

  if (isNonEnglish) {
    return {
      output: input,
      metadata: {
        words,
        sentences,
        chars,
        isNonEnglish: true,
        disclaimer: 'Flesch Reading Ease & Grade Level formulas are calibrated specifically for English syllable structures. Core text statistics are displayed below.'
      }
    };
  }

  // Calculate English syllables
  const wordList = extractWords(input);
  let totalSyllables = 0;

  wordList.forEach(w => {
    let word = w.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return;
    if (word.length <= 3) {
      totalSyllables += 1;
      return;
    }

    word = word.replace(/(?:机制|e|es|ed|ing)$/i, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    const count = matches ? matches.length : 1;
    totalSyllables += Math.max(1, count);
  });

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = totalSyllables / Math.max(1, words);

  const fleschEase = Math.min(100, Math.max(0, Math.round((206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)) * 10) / 10));
  const gradeLevel = Math.max(0, Math.round(((0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59) * 10) / 10);

  let label = 'Plain English (8th-9th Grade)';
  if (fleschEase >= 90) label = 'Very Easy (5th Grade)';
  else if (fleschEase >= 80) label = 'Easy (6th Grade)';
  else if (fleschEase >= 70) label = 'Fairly Easy (7th Grade)';
  else if (fleschEase >= 60) label = 'Standard / Plain English (8th-9th Grade)';
  else if (fleschEase >= 50) label = 'Fairly Difficult (10th-12th Grade)';
  else if (fleschEase >= 30) label = 'Difficult (College Level)';
  else label = 'Very Confusing (Graduate Level)';

  return {
    output: input,
    metadata: {
      words,
      sentences,
      chars,
      totalSyllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      fleschEase,
      gradeLevel,
      label,
      isNonEnglish: false
    }
  };
}

/**
 * 6. Meta Title Checker Processor
 */
export function metaTitleCheckerProcessor(input: string, options?: Record<string, any>) {
  const title = (input || '').trim();
  const charCount = countCharacters(title);
  const wordCount = countWords(title);
  const targetKeyword = (options?.targetKeyword || '').trim();

  // Pixel width estimation for desktop Google SERP title (~580px max)
  let pixelWidth = 0;
  for (const char of title) {
    if (/[A-Z]/.test(char)) pixelWidth += 11;
    else if (/[mwnMWN]/.test(char)) pixelWidth += 13;
    else if (/[ijlI1\s]/.test(char)) pixelWidth += 4;
    else pixelWidth += 8;
  }

  let status: 'optimal' | 'short' | 'long' = 'optimal';
  let message = 'Typical length guideline for desktop and mobile snippet previews (~30-60 characters / ~580px). Note: Search engine display width varies by font, device, query, and search context, and search engines may rewrite title tags.';

  if (charCount < 30) {
    status = 'short';
    message = 'Title is under the ~30 character heuristic guideline. Consider adding more descriptive details or brand name.';
  } else if (charCount > 60 || pixelWidth > 580) {
    status = 'long';
    message = 'Title exceeds the ~580px / 60 character heuristic guideline and may be truncated in search results.';
  }

  const hasKeyword = targetKeyword ? title.toLowerCase().includes(targetKeyword.toLowerCase()) : false;

  return {
    output: title,
    metadata: {
      charCount,
      wordCount,
      pixelWidth,
      status,
      message,
      targetKeyword,
      hasKeyword
    }
  };
}

/**
 * 7. Meta Description Checker Processor
 */
export function metaDescriptionCheckerProcessor(input: string, options?: Record<string, any>) {
  const description = (input || '').trim();
  const charCount = countCharacters(description);
  const wordCount = countWords(description);
  const targetKeyword = (options?.targetKeyword || '').trim();

  // Pixel width estimation (~990px desktop limit)
  let pixelWidth = 0;
  for (const char of description) {
    if (/[A-Z]/.test(char)) pixelWidth += 9;
    else if (/[mwnMWN]/.test(char)) pixelWidth += 11;
    else if (/[ijlI1\s]/.test(char)) pixelWidth += 3.5;
    else pixelWidth += 6.5;
  }

  let status: 'optimal' | 'short' | 'long' = 'optimal';
  let message = 'Typical length guideline for snippet previews (~120-160 characters / ~990px). Note: Search engines dynamically adjust snippet lengths based on search query, device screen size, and user intent.';

  if (charCount < 120) {
    status = 'short';
    message = 'Description is below the ~120 character heuristic guideline. You can expand to summarize core benefits.';
  } else if (charCount > 160 || pixelWidth > 990) {
    status = 'long';
    message = 'Description exceeds the ~990px / 160 character heuristic guideline and may be truncated in search results.';
  }

  const hasKeyword = targetKeyword ? description.toLowerCase().includes(targetKeyword.toLowerCase()) : false;

  return {
    output: description,
    metadata: {
      charCount,
      wordCount,
      pixelWidth,
      status,
      message,
      targetKeyword,
      hasKeyword
    }
  };
}

/**
 * 8. Heading Analyzer Processor
 */
export function headingAnalyzerProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { headings: [], counts: {}, warnings: [] } };
  }

  const mode = options?.mode || (input.includes('<') && input.includes('>') ? 'html' : 'text');
  const headings: Array<{ level: number; text: string; tag: string }> = [];
  const warnings: string[] = [];

  if (mode === 'html') {
    try {
      // First strip scripts and styles cleanly
      const cleanInput = input
        .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '');

      const sanitizedHtml = typeof DOMPurify !== 'undefined' && DOMPurify.sanitize
        ? DOMPurify.sanitize(cleanInput, {
            FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'canvas'],
            FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style', 'href', 'src']
          })
        : cleanInput;

      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizedHtml, 'text/html');
        const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        elements.forEach(el => {
          const level = parseInt(el.tagName.replace('H', ''), 10);
          headings.push({
            level,
            text: (el.textContent || '').trim(),
            tag: el.tagName.toUpperCase()
          });
        });
      }

      // Fallback to regex HTML extraction if DOMParser is unavailable or returned 0
      if (headings.length === 0) {
        const htmlHeadingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;
        while ((match = htmlHeadingRegex.exec(sanitizedHtml)) !== null) {
          const level = parseInt(match[1].substring(1), 10);
          const rawInner = match[2] || '';
          const text = rawInner.replace(/<[^>]+>/g, '').trim();
          headings.push({
            level,
            text,
            tag: match[1].toUpperCase()
          });
        }
      }
    } catch {
      // Fallback to text mode
    }
  }

  if (headings.length === 0) {
    // Text Mode parsing e.g. "H1: Title", "H2: Section", "# Title", "## Section"
    const lines = input.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const hMatch = trimmed.match(/^(H[1-6]):\s*(.+)$/i);
      const mdMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

      if (hMatch) {
        const level = parseInt(hMatch[1].replace(/H/i, ''), 10);
        headings.push({ level, text: hMatch[2].trim(), tag: `H${level}` });
      } else if (mdMatch) {
        const level = mdMatch[1].length;
        headings.push({ level, text: mdMatch[2].trim(), tag: `H${level}` });
      }
    });
  }

  const counts: Record<string, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 };
  headings.forEach(h => {
    counts[h.tag] = (counts[h.tag] || 0) + 1;
  });

  if (counts.H1 === 0) {
    warnings.push('No H1 heading found in document.');
  } else if (counts.H1 > 1) {
    warnings.push(`Multiple H1 headings (${counts.H1}) detected. Having one clear primary H1 usually improves document hierarchy.`);
  }

  // Check skipped levels
  let prevLevel = 0;
  headings.forEach(h => {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      warnings.push(`Skipped heading level: Moved from H${prevLevel} directly to H${h.level}.`);
    }
    if (!h.text) {
      warnings.push(`Empty H${h.level} heading detected.`);
    }
    prevLevel = h.level;
  });

  return {
    output: input,
    metadata: {
      headings,
      counts,
      warnings,
      totalHeadings: headings.length
    }
  };
}

/**
 * 9. Keyword Extractor Processor
 */
export function keywordExtractorProcessor(input: string, options?: Record<string, any>) {
  if (!input || !input.trim()) {
    return { output: '', metadata: { singleKeywords: [], phrases: [] } };
  }

  const minFrequency = Number(options?.minFrequency) || 2;
  const minLength = Number(options?.minLength) || 3;

  const rawWords = extractWords(input);
  const cleanWords: string[] = [];

  rawWords.forEach(w => {
    const lower = w.toLowerCase().replace(/[^\w\u0600-\u06FF]/g, '');
    if (lower.length >= minLength && !ENGLISH_STOP_WORDS.has(lower) && !PERSIAN_STOP_WORDS.has(lower) && !/^\d+$/.test(lower)) {
      cleanWords.push(lower);
    }
  });

  // Count single keywords
  const singleMap = new Map<string, number>();
  cleanWords.forEach(w => {
    singleMap.set(w, (singleMap.get(w) || 0) + 1);
  });

  const singleKeywords = Array.from(singleMap.entries())
    .filter(([_, count]) => count >= minFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  // Count 2-word phrases (bigrams)
  const phraseMap = new Map<string, number>();
  for (let i = 0; i < cleanWords.length - 1; i++) {
    const phrase = `${cleanWords[i]} ${cleanWords[i + 1]}`;
    phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
  }

  const phrases = Array.from(phraseMap.entries())
    .filter(([_, count]) => count >= minFrequency)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  return {
    output: input,
    metadata: {
      singleKeywords: singleKeywords.slice(0, 30),
      phrases: phrases.slice(0, 20),
      totalWordsAnalyzed: rawWords.length
    }
  };
}
