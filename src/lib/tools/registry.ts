import { CategoryInfo, ToolCategory, ToolDefinition } from '../../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'developer',
    name: 'Developer Utilities',
    description: 'Format JSON, HTML, CSS, JS, SQL, test regular expressions, and decode JWTs.',
    icon: 'Code'
  },
  {
    id: 'encoding',
    name: 'Encoding & Hashing',
    description: 'Base64, URL encoding, HTML entity escaping, Unicode converters, and SHA hashes.',
    icon: 'Binary'
  },
  {
    id: 'text',
    name: 'Text Operations',
    description: 'Transform cases, clean spaces, compare differences, and edit raw text.',
    icon: 'Wand2'
  },
  {
    id: 'writing',
    name: 'Writing & Analysis',
    description: 'Count words, analyze reading times, calculate character counts, and inspect metrics.',
    icon: 'FileText'
  },
  {
    id: 'generators',
    name: 'Generators',
    description: 'Generate placeholder Lorem Ipsum, random text, and dummy paragraph content.',
    icon: 'Sparkles'
  },
  {
    id: 'seo',
    name: 'SEO & Content',
    description: 'Upcoming content analysis, meta inspection, and keyword utilities.',
    icon: 'Search'
  }
];

export const TOOL_REGISTRY: ToolDefinition[] = [
  // --- DEVELOPER TOOLS (20 PHASE 3 TOOLS) ---

  // 1. JSON Formatter
  {
    id: 'json-formatter',
    slug: 'json-formatter',
    title: 'JSON Formatter',
    shortDescription: 'Prettify, format, and validate raw JSON with customizable indentation.',
    description: 'Prettify and format unformatted or minified JSON strings. Supports 2-space, 4-space, or tab indentation, identifies syntax errors, and calculates key statistics locally in your browser.',
    category: 'developer',
    icon: 'Code',
    keywords: ['json formatter', 'prettify json', 'format json', 'json editor', 'beautify json'],
    seo: {
      title: 'JSON Formatter – Prettify & Format JSON Online',
      description: 'Format, validate, and prettify JSON strings online with customizable 2-space, 4-space, or tab indentation.'
    },
    requiresClient: true,
    processorId: 'json-formatter',
    relatedTools: ['json-validator', 'json-minifier', 'jwt-decoder'],
    faq: [
      {
        question: 'Is my JSON uploaded to a server?',
        answer: 'No. JSON parsing and formatting execute 100% locally in your browser DOM. Your data remains strictly private.'
      }
    ]
  },

  // 2. JSON Validator
  {
    id: 'json-validator',
    slug: 'json-validator',
    title: 'JSON Validator',
    shortDescription: 'Validate JSON syntax, detect parsing errors, and inspect key metrics.',
    description: 'Validate JSON payloads against standard JSON specification. Locates syntax errors, displays root data types, total key counts, and maximum array nesting depth.',
    category: 'developer',
    icon: 'Code',
    keywords: ['json validator', 'validate json', 'check json syntax', 'json error checker'],
    seo: {
      title: 'JSON Validator – Check JSON Syntax & Locate Parsing Errors',
      description: 'Validate JSON syntax online. Identify syntax errors, inspect nesting depth, and count keys locally in your browser.'
    },
    requiresClient: true,
    processorId: 'json-validator',
    relatedTools: ['json-formatter', 'json-minifier', 'jwt-decoder'],
    faq: []
  },

  // 3. JSON Minifier
  {
    id: 'json-minifier',
    slug: 'json-minifier',
    title: 'JSON Minifier',
    shortDescription: 'Minify and compact JSON by stripping unnecessary whitespace.',
    description: 'Compress and minify JSON files by removing extra spaces, tabs, and newlines. Reduces payload size for production APIs and config files.',
    category: 'developer',
    icon: 'Code',
    keywords: ['json minifier', 'compress json', 'compact json', 'minify json'],
    seo: {
      title: 'JSON Minifier – Compress & Compact JSON Online',
      description: 'Minify JSON payloads online safely without altering valid data semantics.'
    },
    requiresClient: true,
    processorId: 'json-minifier',
    relatedTools: ['json-formatter', 'json-validator', 'base64-encoder'],
    faq: []
  },

  // 4. Base64 Encoder
  {
    id: 'base64-encoder',
    slug: 'base64-encoder',
    title: 'Base64 Encoder',
    shortDescription: 'Convert plain text, Unicode, and emojis into Base64 encoded strings.',
    description: 'Encode text strings into Base64 format. Full support for Unicode, Persian, Arabic, and emoji surrogate pairs using client-side UTF-8 encoding.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['base64 encoder', 'encode base64', 'base64 string', 'base64 unicode'],
    seo: {
      title: 'Base64 Encoder – Convert UTF-8 Text to Base64 Online',
      description: 'Encode text strings and Unicode to Base64 format safely in your browser.'
    },
    requiresClient: true,
    processorId: 'base64-encoder',
    relatedTools: ['base64-decoder', 'url-encoder', 'unicode-converter'],
    faq: []
  },

  // 5. Base64 Decoder
  {
    id: 'base64-decoder',
    slug: 'base64-decoder',
    title: 'Base64 Decoder',
    shortDescription: 'Decode Base64 strings back into plain UTF-8 text.',
    description: 'Decode Base64 encoded data back into plain text. Safely decodes UTF-8 strings, Unicode, and emojis with clear error detection for malformed payloads.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['base64 decoder', 'decode base64', 'base64 to text', 'base64 convert'],
    seo: {
      title: 'Base64 Decoder – Decode Base64 Strings to Text Online',
      description: 'Decode Base64 data back to plain text online with full Unicode and emoji support.'
    },
    requiresClient: true,
    processorId: 'base64-decoder',
    relatedTools: ['base64-encoder', 'url-decoder', 'jwt-decoder'],
    faq: []
  },

  // 6. URL Encoder
  {
    id: 'url-encoder',
    slug: 'url-encoder',
    title: 'URL Encoder',
    shortDescription: 'Convert query parameters and special characters into percent-encoded URLs.',
    description: 'Encode special characters, spaces, non-ASCII symbols, and query parameters into percent-encoded URL component format for web requests.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['url encoder', 'percent encoding', 'encode uri', 'url component encoder'],
    seo: {
      title: 'URL Encoder – Percent-Encode Query Parameters & URLs',
      description: 'Convert special characters and query strings into valid percent-encoded URL format.'
    },
    requiresClient: true,
    processorId: 'url-encoder',
    relatedTools: ['url-decoder', 'base64-encoder', 'html-encoder'],
    faq: []
  },

  // 7. URL Decoder
  {
    id: 'url-decoder',
    slug: 'url-decoder',
    title: 'URL Decoder',
    shortDescription: 'Decode percent-encoded URL parameters back into readable text.',
    description: 'Decode percent-encoded URI parameters back into readable UTF-8 text. Handles malformed percent sequences gracefully without breaking.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['url decoder', 'percent decoding', 'decode uri', 'url component decoder'],
    seo: {
      title: 'URL Decoder – Decode Percent-Encoded URI Strings',
      description: 'Decode percent-encoded URL parameters back into readable plain text online.'
    },
    requiresClient: true,
    processorId: 'url-decoder',
    relatedTools: ['url-encoder', 'base64-decoder', 'html-decoder'],
    faq: []
  },

  // 8. HTML Encoder
  {
    id: 'html-encoder',
    slug: 'html-encoder',
    title: 'HTML Encoder',
    shortDescription: 'Escape special HTML characters into safe HTML entities (&lt;, &gt;, &amp;).',
    description: 'Convert reserved HTML characters (&, <, >, ", \') into safe HTML entity escape sequences to prevent unwanted browser rendering and XSS vulnerabilities.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['html encoder', 'escape html', 'html entities', 'html character encoder'],
    seo: {
      title: 'HTML Encoder – Convert Special Characters to HTML Entities',
      description: 'Escape special characters into safe HTML entity sequences (&amp;, &lt;, &gt;) online.'
    },
    requiresClient: true,
    processorId: 'html-encoder',
    relatedTools: ['html-decoder', 'url-encoder', 'escape-unescape'],
    faq: []
  },

  // 9. HTML Decoder
  {
    id: 'html-decoder',
    slug: 'html-decoder',
    title: 'HTML Decoder',
    shortDescription: 'Decode HTML entities back into plain readable text.',
    description: 'Decode named HTML entities (&amp;, &lt;, &quot;) and numeric entities (&#65;, &#x41;) back into plain text safely without executing code.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['html decoder', 'unescape html', 'decode html entities', 'html entity decoder'],
    seo: {
      title: 'HTML Decoder – Convert HTML Entities to Plain Text',
      description: 'Decode named and numeric HTML entities back into plain text safely in your browser.'
    },
    requiresClient: true,
    processorId: 'html-decoder',
    relatedTools: ['html-encoder', 'url-decoder', 'escape-unescape'],
    faq: []
  },

  // 10. Unicode Converter
  {
    id: 'unicode-converter',
    slug: 'unicode-converter',
    title: 'Unicode Encoder / Decoder',
    shortDescription: 'Convert text to \\uXXXX escape sequences and decode Unicode back to text.',
    description: 'Convert non-ASCII characters and emojis into \\uXXXX Unicode escape sequences or parse Unicode escape sequences back into readable UTF-8 text.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['unicode converter', 'unicode encoder', 'unicode decoder', 'unicode escape'],
    seo: {
      title: 'Unicode Encoder / Decoder – Convert Text to \\uXXXX Escape Sequences',
      description: 'Encode text into \\uXXXX escape sequences or decode Unicode back to UTF-8 text online.'
    },
    requiresClient: true,
    processorId: 'unicode-converter',
    relatedTools: ['base64-encoder', 'url-encoder', 'html-encoder'],
    faq: []
  },

  // 11. HTML Formatter
  {
    id: 'html-formatter',
    slug: 'html-formatter',
    title: 'HTML Formatter',
    shortDescription: 'Format and indent unformatted HTML markup.',
    description: 'Beautify and format messy or minified HTML documents. Indents element hierarchies, preserves comments, and formats tags cleanly.',
    category: 'developer',
    icon: 'Code',
    keywords: ['html formatter', 'beautify html', 'format html', 'html prettify'],
    seo: {
      title: 'HTML Formatter – Beautify & Format HTML Code Online',
      description: 'Format, indent, and prettify raw HTML code online with clean 2-space or 4-space hierarchy.'
    },
    requiresClient: true,
    processorId: 'html-formatter',
    relatedTools: ['css-formatter', 'javascript-formatter', 'markdown-to-html'],
    faq: []
  },

  // 12. CSS Formatter
  {
    id: 'css-formatter',
    slug: 'css-formatter',
    title: 'CSS Formatter',
    shortDescription: 'Format and indent CSS code blocks and media queries.',
    description: 'Beautify messy CSS stylesheets, format selectors, expand rule declarations, and preserve CSS custom properties.',
    category: 'developer',
    icon: 'Code',
    keywords: ['css formatter', 'beautify css', 'format css', 'css prettify'],
    seo: {
      title: 'CSS Formatter – Beautify & Format CSS Stylesheets Online',
      description: 'Format, indent, and beautify CSS code online. Clean stylesheet formatting in your browser.'
    },
    requiresClient: true,
    processorId: 'css-formatter',
    relatedTools: ['html-formatter', 'javascript-formatter', 'sql-formatter'],
    faq: []
  },

  // 13. JavaScript Formatter
  {
    id: 'javascript-formatter',
    slug: 'javascript-formatter',
    title: 'JavaScript Formatter',
    shortDescription: 'Format and indent JavaScript code with syntax preservation.',
    description: 'Beautify minified or unformatted JavaScript source code. Formats blocks, functions, arrays, and objects safely without executing code.',
    category: 'developer',
    icon: 'Code',
    keywords: ['javascript formatter', 'beautify js', 'format javascript', 'js prettify'],
    seo: {
      title: 'JavaScript Formatter – Beautify & Format JS Code Online',
      description: 'Format and indent JavaScript source code online with clean block structure.'
    },
    requiresClient: true,
    processorId: 'javascript-formatter',
    relatedTools: ['html-formatter', 'css-formatter', 'json-formatter'],
    faq: []
  },

  // 14. SQL Formatter
  {
    id: 'sql-formatter',
    slug: 'sql-formatter',
    title: 'SQL Formatter',
    shortDescription: 'Format SQL queries with capitalized keywords and structured clauses.',
    description: 'Format raw SQL statements into structured, readable queries. Capitalizes SQL keywords (SELECT, FROM, WHERE, JOIN) and indents subqueries.',
    category: 'developer',
    icon: 'Code',
    keywords: ['sql formatter', 'beautify sql', 'format sql query', 'sql prettify'],
    seo: {
      title: 'SQL Formatter – Beautify & Structure SQL Queries Online',
      description: 'Format, capitalize keywords, and structure complex SQL queries online safely in your browser.'
    },
    requiresClient: true,
    processorId: 'sql-formatter',
    relatedTools: ['javascript-formatter', 'json-formatter', 'text-compare'],
    faq: []
  },

  // 15. Markdown → HTML
  {
    id: 'markdown-to-html',
    slug: 'markdown-to-html',
    title: 'Markdown → HTML Converter',
    shortDescription: 'Convert Markdown text into sanitized HTML source and live preview.',
    description: 'Parse Markdown into HTML markup. Renders headings, lists, bold/italic formatting, code blocks, links, and blockquotes with DOMPurify sanitization.',
    category: 'developer',
    icon: 'Code',
    keywords: ['markdown to html', 'convert markdown', 'md to html', 'markdown preview'],
    seo: {
      title: 'Markdown to HTML Converter – Convert & Preview Markdown Online',
      description: 'Convert Markdown into sanitized HTML source code with instant live preview.'
    },
    requiresClient: true,
    processorId: 'markdown-to-html',
    relatedTools: ['html-formatter', 'html-encoder', 'text-cleaner'],
    faq: []
  },

  // 16. Regex Tester
  {
    id: 'regex-tester',
    slug: 'regex-tester',
    title: 'Regex Tester',
    shortDescription: 'Test regular expression patterns against text with live match highlights.',
    description: 'Interactive regular expression testing utility. Supports flags (g, i, m, s), match indexes, and captured group breakdowns with safe local execution.',
    category: 'developer',
    icon: 'Code',
    keywords: ['regex tester', 'test regex', 'regular expression tester', 'regex match'],
    seo: {
      title: 'Regex Tester – Test Regular Expressions & Capture Groups Online',
      description: 'Test regular expressions in real-time. Inspect pattern matches, indexes, and capture groups locally.'
    },
    requiresClient: true,
    processorId: 'regex-tester',
    relatedTools: ['find-and-replace', 'text-compare', 'escape-unescape'],
    faq: []
  },

  // 17. JWT Decoder
  {
    id: 'jwt-decoder',
    slug: 'jwt-decoder',
    title: 'JWT Decoder',
    shortDescription: 'Decode JSON Web Token headers, payloads, and signatures locally.',
    description: 'Inspect encoded JWT tokens locally. Decodes Header JSON, Payload claim details, and signature data without sending tokens to any external server.',
    category: 'developer',
    icon: 'Code',
    keywords: ['jwt decoder', 'decode jwt', 'jwt claims inspector', 'jwt token viewer'],
    seo: {
      title: 'JWT Decoder – Decode JSON Web Token Claims Locally',
      description: 'Decode JWT token headers, payloads, and claims locally in your browser with zero remote transmission.'
    },
    requiresClient: true,
    processorId: 'jwt-decoder',
    relatedTools: ['json-formatter', 'base64-decoder', 'timestamp-converter'],
    faq: [
      {
        question: 'Does decoding a JWT verify its signature?',
        answer: 'No. Decoding a JWT parses its claims JSON payload locally. It does not verify the secret signature or authenticate users.'
      }
    ]
  },

  // 18. Unix Timestamp Converter
  {
    id: 'timestamp-converter',
    slug: 'timestamp-converter',
    title: 'Unix Timestamp Converter',
    shortDescription: 'Convert Unix timestamps (seconds/ms) to ISO, UTC, and local dates.',
    description: 'Convert Unix epoch timestamps (seconds or milliseconds) into readable ISO 8601, UTC, and local date formats, or convert date strings into Unix timestamps.',
    category: 'developer',
    icon: 'Code',
    keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'date to timestamp'],
    seo: {
      title: 'Unix Timestamp Converter – Epoch Seconds to UTC & Local Date',
      description: 'Convert Unix epoch timestamps to ISO dates, UTC strings, and local timezone formats online.'
    },
    requiresClient: true,
    processorId: 'timestamp-converter',
    relatedTools: ['jwt-decoder', 'hash-generator', 'text-statistics'],
    faq: []
  },

  // 19. Hash Generator
  {
    id: 'hash-generator',
    slug: 'hash-generator',
    title: 'Hash Generator',
    shortDescription: 'Generate SHA-256, SHA-384, and SHA-512 cryptographic hashes.',
    description: 'Calculate cryptographic hex hashes using the browser Web Crypto API. Generates SHA-256, SHA-384, and SHA-512 hashes instantly without external server APIs.',
    category: 'encoding',
    icon: 'Binary',
    keywords: ['hash generator', 'sha256 generator', 'sha512 hash', 'crypto hash online'],
    seo: {
      title: 'Hash Generator – Calculate SHA-256, SHA-384 & SHA-512 Hashes',
      description: 'Generate SHA-256, SHA-384, and SHA-512 cryptographic hashes locally using browser Web Crypto APIs.'
    },
    requiresClient: true,
    processorId: 'hash-generator',
    relatedTools: ['timestamp-converter', 'jwt-decoder', 'base64-encoder'],
    faq: []
  },

  // 20. Escape / Unescape String
  {
    id: 'escape-unescape',
    slug: 'escape-unescape',
    title: 'Escape / Unescape String',
    shortDescription: 'Escape strings for JSON or JavaScript code, or decode escaped strings.',
    description: 'Escape quotation marks, slashes, and control characters for JSON or JavaScript strings, or unescape escaped strings back to plain text.',
    category: 'developer',
    icon: 'Code',
    keywords: ['escape string', 'unescape string', 'json escape', 'js string escape'],
    seo: {
      title: 'Escape / Unescape String – JSON & JavaScript String Escaper',
      description: 'Escape or unescape strings for JSON and JavaScript code safely online.'
    },
    requiresClient: true,
    processorId: 'escape-unescape',
    relatedTools: ['json-formatter', 'html-encoder', 'regex-tester'],
    faq: []
  },


  // --- PHASE 2 TEXT ESSENTIALS TOOLS ---

  {
    id: 'word-counter',
    slug: 'word-counter',
    title: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, paragraphs, and estimated reading time.',
    description: 'A fast, accurate online word counter tool. Calculates real-time word count, letter counts excluding spaces, lines, paragraph counts, and estimated reading duration.',
    category: 'writing',
    icon: 'FileText',
    keywords: ['word counter', 'count words', 'character count', 'reading time'],
    seo: {
      title: 'Word Counter – Free Online Word & Character Count Tool',
      description: 'Count words, characters, sentences, paragraphs, and reading times instantly in your browser.'
    },
    requiresClient: true,
    processorId: 'word-counter',
    relatedTools: ['character-counter', 'text-statistics', 'reading-time-calculator'],
    faq: []
  },
  {
    id: 'character-counter',
    slug: 'character-counter',
    title: 'Character Counter',
    shortDescription: 'Count characters, letters without spaces, UTF-8 byte sizes, and words.',
    description: 'Precise character counter and UTF-8 byte calculator. Accurately counts visible characters, surrogate pairs, emojis, and byte sizes.',
    category: 'writing',
    icon: 'FileText',
    keywords: ['character counter', 'count characters', 'char count', 'byte counter'],
    seo: {
      title: 'Character Counter – Free Online Char & UTF-8 Byte Counter',
      description: 'Calculate character length, characters without spaces, UTF-8 byte size, and word count locally.'
    },
    requiresClient: true,
    processorId: 'character-counter',
    relatedTools: ['word-counter', 'text-statistics', 'reading-time-calculator'],
    faq: []
  },
  {
    id: 'text-statistics',
    slug: 'text-statistics',
    title: 'Text Statistics',
    shortDescription: 'Complete text metrics dashboard including average word length and sentence lengths.',
    description: 'In-depth text analysis dashboard. Displays words, characters with/without spaces, UTF-8 bytes, line count, sentence count, paragraph count, and longest/shortest words.',
    category: 'writing',
    icon: 'FileText',
    keywords: ['text statistics', 'text metrics', 'text analyzer', 'average word length'],
    seo: {
      title: 'Text Statistics – Complete Online Text Analysis Dashboard',
      description: 'Analyze complete text metrics: word lengths, sentence lengths, paragraphs, and reading time.'
    },
    requiresClient: true,
    processorId: 'text-statistics',
    relatedTools: ['word-counter', 'character-counter', 'reading-time-calculator'],
    faq: []
  },
  {
    id: 'reading-time-calculator',
    slug: 'reading-time-calculator',
    title: 'Reading Time Calculator',
    shortDescription: 'Estimate reading duration with customizable WPM speeds (100 WPM to 300 WPM).',
    description: 'Calculate exact reading time for articles, essays, and speeches with customizable WPM speed controls.',
    category: 'writing',
    icon: 'Clock',
    keywords: ['reading time calculator', 'estimated reading time', 'wpm calculator'],
    seo: {
      title: 'Reading Time Calculator – Estimate Article & Speech Duration',
      description: 'Calculate article and speech reading times with adjustable WPM settings.'
    },
    requiresClient: true,
    processorId: 'reading-time-calculator',
    relatedTools: ['word-counter', 'character-counter', 'text-statistics'],
    faq: []
  },
  {
    id: 'uppercase-converter',
    slug: 'uppercase-converter',
    title: 'Uppercase Converter',
    shortDescription: 'Convert all text characters to ALL CAPS UPPERCASE.',
    description: 'Transform text to UPPERCASE instantly. Preserves spacing, line breaks, punctuation, and Unicode script accents.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['uppercase converter', 'all caps', 'capitalize text'],
    seo: {
      title: 'Uppercase Converter – Convert Text to ALL CAPS Online',
      description: 'Convert text to uppercase online. Fast, browser-based capital letter transformer.'
    },
    requiresClient: true,
    processorId: 'uppercase-converter',
    relatedTools: ['lowercase-converter', 'title-case-converter', 'sentence-case-converter'],
    faq: []
  },
  {
    id: 'lowercase-converter',
    slug: 'lowercase-converter',
    title: 'Lowercase Converter',
    shortDescription: 'Convert text to all small lowercase letters.',
    description: 'Transform text to small lowercase letters. Preserves original paragraphs, line breaks, and special characters.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['lowercase converter', 'small letters', 'un-capitalize'],
    seo: {
      title: 'Lowercase Converter – Convert Text to Small Letters Online',
      description: 'Convert text to lowercase letters online instantly.'
    },
    requiresClient: true,
    processorId: 'lowercase-converter',
    relatedTools: ['uppercase-converter', 'title-case-converter', 'sentence-case-converter'],
    faq: []
  },
  {
    id: 'title-case-converter',
    slug: 'title-case-converter',
    title: 'Title Case Converter',
    shortDescription: 'Capitalize Headings & Titles Intelligently.',
    description: 'Intelligent title casing utility for headlines, book titles, and email subject lines.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['title case converter', 'headline casing', 'capitalize titles'],
    seo: {
      title: 'Title Case Converter – Capitalize Headlines & Titles Online',
      description: 'Convert headlines and titles to Title Case with intelligent handling of minor words.'
    },
    requiresClient: true,
    processorId: 'title-case-converter',
    relatedTools: ['uppercase-converter', 'lowercase-converter', 'sentence-case-converter'],
    faq: []
  },
  {
    id: 'sentence-case-converter',
    slug: 'sentence-case-converter',
    title: 'Sentence Case Converter',
    shortDescription: 'Capitalize the first letter of each sentence automatically.',
    description: 'Format unformatted text into clean sentence case. Capitalizes sentence beginnings after periods and question marks.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['sentence case converter', 'capitalize sentences'],
    seo: {
      title: 'Sentence Case Converter – Capitalize First Letter of Sentences',
      description: 'Automatically capitalize the first letter of every sentence in your text.'
    },
    requiresClient: true,
    processorId: 'sentence-case-converter',
    relatedTools: ['title-case-converter', 'uppercase-converter', 'lowercase-converter'],
    faq: []
  },
  {
    id: 'remove-extra-spaces',
    slug: 'remove-extra-spaces',
    title: 'Remove Extra Spaces',
    shortDescription: 'Clean double spaces, repeated tabs, and trailing whitespace.',
    description: 'Clean messy text documents by collapsing multiple consecutive spaces and tabs into a single space.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['remove extra spaces', 'clean spaces', 'collapse whitespace'],
    seo: {
      title: 'Remove Extra Spaces – Clean Double Spaces & Repeated Whitespace',
      description: 'Clean extra spaces, collapse double spaces, and remove trailing whitespace online.'
    },
    requiresClient: true,
    processorId: 'remove-extra-spaces',
    relatedTools: ['remove-empty-lines', 'remove-duplicate-lines', 'text-cleaner'],
    faq: []
  },
  {
    id: 'remove-empty-lines',
    slug: 'remove-empty-lines',
    title: 'Remove Empty Lines',
    shortDescription: 'Strip out blank lines and empty line breaks from documents.',
    description: 'Remove blank lines and whitespace-only lines from code files, lists, or text documents.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['remove empty lines', 'delete blank lines', 'strip newlines'],
    seo: {
      title: 'Remove Empty Lines – Strip Blank Lines & Extra Newlines',
      description: 'Remove blank lines and empty line breaks from text files online.'
    },
    requiresClient: true,
    processorId: 'remove-empty-lines',
    relatedTools: ['remove-extra-spaces', 'remove-duplicate-lines', 'text-cleaner'],
    faq: []
  },
  {
    id: 'remove-duplicate-lines',
    slug: 'remove-duplicate-lines',
    title: 'Remove Duplicate Lines',
    shortDescription: 'Deduplicate lines from lists, data files, and logs.',
    description: 'Remove duplicate lines from text lists while preserving original line order.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['remove duplicate lines', 'deduplicate list', 'unique lines'],
    seo: {
      title: 'Remove Duplicate Lines – Deduplicate Text & Lists Online',
      description: 'Deduplicate lines in text lists instantly while preserving original order.'
    },
    requiresClient: true,
    processorId: 'remove-duplicate-lines',
    relatedTools: ['sort-lines', 'remove-empty-lines', 'text-cleaner'],
    faq: []
  },
  {
    id: 'sort-lines',
    slug: 'sort-lines',
    title: 'Sort Lines',
    shortDescription: 'Sort text lines alphabetically (A-Z, Z-A) or numerically.',
    description: 'Sort lists and text files alphabetically ascending, descending, or numerically.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['sort lines', 'alphabetical sort', 'sort list online'],
    seo: {
      title: 'Sort Lines – Alphabetical & Numeric List Sorting Tool',
      description: 'Sort lines alphabetically or numerically online.'
    },
    requiresClient: true,
    processorId: 'sort-lines',
    relatedTools: ['remove-duplicate-lines', 'reverse-text', 'text-cleaner'],
    faq: []
  },
  {
    id: 'reverse-text',
    slug: 'reverse-text',
    title: 'Reverse Text',
    shortDescription: 'Reverse entire text, individual lines, or word order.',
    description: 'Reverse text characters, flip lines, or reverse word order using Unicode grapheme segmenters.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['reverse text', 'reverse words', 'reverse lines'],
    seo: {
      title: 'Reverse Text – Reverse Characters, Lines, or Word Order Online',
      description: 'Reverse text strings or line order safely without breaking emojis.'
    },
    requiresClient: true,
    processorId: 'reverse-text',
    relatedTools: ['sort-lines', 'uppercase-converter', 'text-cleaner'],
    faq: []
  },
  {
    id: 'text-cleaner',
    slug: 'text-cleaner',
    title: 'Text Cleaner',
    shortDescription: 'All-in-one text cleaning tool for whitespace, empty lines, and duplicates.',
    description: 'Configurable text cleanup workstation. Combine trim, extra space removal, and blank line stripping.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['text cleaner', 'clean text', 'format text'],
    seo: {
      title: 'Text Cleaner – All-in-One Text Sanitizer & Cleanup Tool',
      description: 'Clean text, remove extra spaces, and strip empty lines in one click.'
    },
    requiresClient: true,
    processorId: 'text-cleaner',
    relatedTools: ['remove-extra-spaces', 'remove-empty-lines', 'remove-duplicate-lines'],
    faq: []
  },
  {
    id: 'find-and-replace',
    slug: 'find-and-replace',
    title: 'Find & Replace',
    shortDescription: 'Search and replace text strings with case sensitivity and whole word options.',
    description: 'Find and replace words or phrases in large documents with match counters.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['find and replace', 'search and replace text'],
    seo: {
      title: 'Find & Replace – Online Search & Replace Text Utility',
      description: 'Find and replace text strings instantly in your browser.'
    },
    requiresClient: true,
    processorId: 'find-and-replace',
    relatedTools: ['text-cleaner', 'text-compare', 'text-splitter'],
    faq: []
  },
  {
    id: 'text-compare',
    slug: 'text-compare',
    title: 'Text Compare',
    shortDescription: 'Compare two text blocks side-by-side to highlight added and removed lines.',
    description: 'Side-by-side text comparison tool. Compares Text A and Text B line-by-line to identify additions and deletions.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['text compare', 'diff tool', 'compare text online'],
    seo: {
      title: 'Text Compare – Free Online Side-by-Side Text Diff Tool',
      description: 'Compare two text blocks side-by-side to highlight added and removed lines.'
    },
    requiresClient: true,
    processorId: 'text-compare',
    relatedTools: ['find-and-replace', 'text-merger', 'text-cleaner'],
    faq: []
  },
  {
    id: 'text-splitter',
    slug: 'text-splitter',
    title: 'Text Splitter',
    shortDescription: 'Split large text documents into smaller chunks by character, word, or line counts.',
    description: 'Divide large documents into manageable chunks by character limits, word limits, or line counts.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['text splitter', 'split text', 'chunk text'],
    seo: {
      title: 'Text Splitter – Split Text by Characters, Words, or Lines',
      description: 'Split large text into smaller parts by character count, word count, or line count.'
    },
    requiresClient: true,
    processorId: 'text-splitter',
    relatedTools: ['text-merger', 'word-counter', 'text-cleaner'],
    faq: []
  },
  {
    id: 'text-merger',
    slug: 'text-merger',
    title: 'Text Merger',
    shortDescription: 'Combine multiple text blocks or files into a single unified output.',
    description: 'Merge multiple text sections or files into a single continuous document with customizable separators.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['text merger', 'combine text', 'merge files'],
    seo: {
      title: 'Text Merger – Combine Multiple Text Blocks & Files Online',
      description: 'Combine multiple text blocks or files into a single file with custom separators.'
    },
    requiresClient: true,
    processorId: 'text-merger',
    relatedTools: ['text-splitter', 'sort-lines', 'remove-duplicate-lines'],
    faq: []
  },
  {
    id: 'lorem-ipsum-generator',
    slug: 'lorem-ipsum-generator',
    title: 'Lorem Ipsum Generator',
    shortDescription: 'Generate custom placeholder text by paragraphs, sentences, or word counts.',
    description: 'Generate Latin Lorem Ipsum dummy placeholder text for website mockups and print design.',
    category: 'generators',
    icon: 'Sparkles',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text'],
    seo: {
      title: 'Lorem Ipsum Generator – Generate Custom Placeholder Text',
      description: 'Generate Lorem Ipsum dummy text by paragraphs, sentences, or words.'
    },
    requiresClient: true,
    processorId: 'lorem-ipsum-generator',
    relatedTools: ['random-text-generator', 'word-counter', 'text-statistics'],
    faq: []
  },
  {
    id: 'random-text-generator',
    slug: 'random-text-generator',
    title: 'Random Text Generator',
    shortDescription: 'Generate randomized readable dummy text with customizable numbers and punctuation.',
    description: 'Generate readable random text for software testing, mock data population, and UX design.',
    category: 'generators',
    icon: 'Sparkles',
    keywords: ['random text generator', 'dummy text', 'test data text'],
    seo: {
      title: 'Random Text Generator – Generate Custom Dummy Text',
      description: 'Generate randomized dummy text paragraphs, sentences, and words.'
    },
    requiresClient: true,
    processorId: 'random-text-generator',
    relatedTools: ['lorem-ipsum-generator', 'word-counter', 'text-statistics'],
    faq: []
  },

  // --- PHASE 4 SEO / CONTENT TOOLS (9 TOOLS) ---

  // 1. Keyword Counter
  {
    id: 'keyword-counter',
    slug: 'keyword-counter',
    title: 'Keyword Counter',
    shortDescription: 'Count exact keyword matches and frequency percentages in your text.',
    description: 'Calculate exact keyword frequencies, occurrence counts, and keyword density percentages for targeted terms locally in your browser.',
    category: 'seo',
    icon: 'Search',
    keywords: ['keyword counter', 'count keywords', 'keyword frequency', 'search term count'],
    seo: {
      title: 'Keyword Counter – Calculate Exact Keyword Occurrences & Frequency',
      description: 'Count exact target keyword occurrences and density percentages in text online.'
    },
    requiresClient: true,
    processorId: 'keyword-counter',
    relatedTools: ['keyword-density-checker', 'word-frequency-counter', 'keyword-extractor'],
    faq: [
      {
        question: 'Does Keyword Counter support multiple keywords at once?',
        answer: 'Yes! You can enter multiple keywords separated by commas or line breaks to check all of them simultaneously.'
      }
    ]
  },

  // 2. Keyword Density Checker
  {
    id: 'keyword-density-checker',
    slug: 'keyword-density-checker',
    title: 'Keyword Density Checker',
    shortDescription: 'Analyze word frequency density percentages using heuristic benchmarks.',
    description: 'Analyze document word density percentages. Provides high-density warnings based on heuristic statistical benchmarks to review repetitive terms.',
    category: 'seo',
    icon: 'Search',
    keywords: ['keyword density', 'check keyword density', 'text frequency analyzer', 'seo keyword density'],
    seo: {
      title: 'Keyword Density Checker – Analyze Word Density & Frequency Metrics',
      description: 'Analyze text keyword density percentages online with heuristic statistical density benchmarks.'
    },
    requiresClient: true,
    processorId: 'keyword-density-checker',
    relatedTools: ['keyword-counter', 'word-frequency-counter', 'keyword-extractor'],
    faq: [
      {
        question: 'Is keyword density a guaranteed ranking factor for Google?',
        answer: 'No. Keyword density is a statistical textual measurement. Modern search engines evaluate semantics, intent, and user experience rather than enforcing a specific fixed keyword percentage.'
      }
    ]
  },

  // 3. Word Frequency Counter
  {
    id: 'word-frequency-counter',
    slug: 'word-frequency-counter',
    title: 'Word Frequency Counter',
    shortDescription: 'Count occurrences of all words with stop word filtering and length controls.',
    description: 'Generate a complete word frequency table. Filter out common English and Persian stop words, exclude numbers, and set minimum word length thresholds.',
    category: 'seo',
    icon: 'Search',
    keywords: ['word frequency counter', 'word occurrence', 'filter stop words', 'word count table'],
    seo: {
      title: 'Word Frequency Counter – Count Word Occurrences with Stop Word Filter',
      description: 'Generate word frequency tables online. Filter stop words, numbers, and set word length controls.'
    },
    requiresClient: true,
    processorId: 'word-frequency-counter',
    relatedTools: ['keyword-density-checker', 'keyword-counter', 'keyword-extractor'],
    faq: []
  },

  // 4. URL Slug Generator
  {
    id: 'slug-generator',
    slug: 'slug-generator',
    title: 'URL Slug Generator',
    shortDescription: 'Convert titles into clean, SEO-friendly URL slugs.',
    description: 'Transform article titles and headlines into sanitized, URL-friendly slugs. Includes options for character limits and Unicode transliteration.',
    category: 'seo',
    icon: 'Search',
    keywords: ['slug generator', 'url slug converter', 'make url slug', 'seo url generator'],
    seo: {
      title: 'URL Slug Generator – Convert Titles to SEO-Friendly URL Slugs',
      description: 'Convert article titles and text into clean, sanitized, lowercased URL slugs online.'
    },
    requiresClient: true,
    processorId: 'slug-generator',
    relatedTools: ['meta-title-checker', 'meta-description-checker', 'heading-analyzer'],
    faq: []
  },

  // 5. Text Readability Calculator
  {
    id: 'text-readability-calculator',
    slug: 'text-readability-calculator',
    title: 'Text Readability Calculator',
    shortDescription: 'Calculate Flesch Reading Ease and Flesch-Kincaid Grade Level scores.',
    description: 'Evaluate document readability using Flesch Reading Ease and Flesch-Kincaid Grade Level metrics with total syllable and sentence breakdowns.',
    category: 'seo',
    icon: 'Search',
    keywords: ['text readability calculator', 'flesch reading ease', 'flesch kincaid grade level', 'readability score'],
    seo: {
      title: 'Text Readability Calculator – Check Flesch Reading Ease & Grade Level',
      description: 'Calculate Flesch Reading Ease and Flesch-Kincaid Grade Level readability scores for articles online.'
    },
    requiresClient: true,
    processorId: 'text-readability-calculator',
    relatedTools: ['word-counter', 'text-statistics', 'heading-analyzer'],
    faq: []
  },

  // 6. Meta Title Length Checker
  {
    id: 'meta-title-checker',
    slug: 'meta-title-checker',
    title: 'Meta Title Length Checker',
    shortDescription: 'Check meta title pixel width and character counts against snippet preview guidelines.',
    description: 'Check HTML page meta title lengths against desktop SERP pixel width guidelines (~580px / ~60 characters). Includes live search result snippet preview.',
    category: 'seo',
    icon: 'Search',
    keywords: ['meta title checker', 'title tag length', 'serp pixel width', 'google title preview'],
    seo: {
      title: 'Meta Title Length Checker – Test SERP Pixel Width & Title Guidelines',
      description: 'Check meta title lengths and pixel widths against search result snippet guidelines with live previews.'
    },
    requiresClient: true,
    processorId: 'meta-title-checker',
    relatedTools: ['meta-description-checker', 'slug-generator', 'heading-analyzer'],
    faq: [
      {
        question: 'Does Google enforce a strict 60 character limit for titles?',
        answer: 'No. Search engines render titles based on display pixel width (~580px desktop guideline) rather than character counts, and may dynamically adjust or rewrite title tags depending on user search queries.'
      }
    ]
  },

  // 7. Meta Description Length Checker
  {
    id: 'meta-description-checker',
    slug: 'meta-description-checker',
    title: 'Meta Description Length Checker',
    shortDescription: 'Inspect meta description pixel width and character counts against snippet guidelines.',
    description: 'Inspect meta description snippets against search result display guidelines (~990px / ~160 characters) with live search result snippet previews.',
    category: 'seo',
    icon: 'Search',
    keywords: ['meta description checker', 'description tag length', 'serp description preview', 'google snippet checker'],
    seo: {
      title: 'Meta Description Length Checker – Inspect SERP Snippet Preview Guidelines',
      description: 'Inspect meta description lengths against search result snippet display guidelines with live SERP preview.'
    },
    requiresClient: true,
    processorId: 'meta-description-checker',
    relatedTools: ['meta-title-checker', 'slug-generator', 'keyword-counter'],
    faq: [
      {
        question: 'Will search engines always display my exact meta description?',
        answer: 'Search engines frequently generate dynamic snippets from page content when they believe it better matches the user query. The ~160 character / ~990px limit serves as an approximate guideline for snippet display.'
      }
    ]
  },

  // 8. Headline Analyzer & Heading Inspector
  {
    id: 'heading-analyzer',
    slug: 'heading-analyzer',
    title: 'Headline Analyzer & Heading Inspector',
    shortDescription: 'Analyze H1-H6 document hierarchy, detect missing H1s, and check skipped levels.',
    description: 'Analyze HTML or Markdown heading structures (H1 through H6). Detect missing H1 tags, duplicate H1s, skipped heading levels, and empty headings.',
    category: 'seo',
    icon: 'Search',
    keywords: ['heading analyzer', 'h1 checker', 'heading inspector', 'document structure validator'],
    seo: {
      title: 'Headline Analyzer & Heading Inspector – Validate H1-H6 Document Structure',
      description: 'Inspect HTML and Markdown heading hierarchies online. Locate missing H1 tags and skipped heading levels.'
    },
    requiresClient: true,
    processorId: 'heading-analyzer',
    relatedTools: ['meta-title-checker', 'text-readability-calculator', 'slug-generator'],
    faq: []
  },

  // 9. Keyword Extractor
  {
    id: 'keyword-extractor',
    slug: 'keyword-extractor',
    title: 'Keyword Extractor',
    shortDescription: 'Extract top single keywords and two-word phrases (bigrams) from content.',
    description: 'Extract key topics, single keywords, and two-word phrases (bigrams) from articles and documents with frequency thresholds.',
    category: 'seo',
    icon: 'Search',
    keywords: ['keyword extractor', 'extract keywords', 'phrase extractor', 'top topics extractor'],
    seo: {
      title: 'Keyword Extractor – Extract Key Topics & 2-Word Phrases from Content',
      description: 'Extract top keywords and 2-word phrases from articles online locally without external APIs.'
    },
    requiresClient: true,
    processorId: 'keyword-extractor',
    relatedTools: ['keyword-counter', 'keyword-density-checker', 'word-frequency-counter'],
    faq: []
  },

  // Foundation Demo Tool
  {
    id: 'foundation-demo-tool',
    slug: 'demo-text-transformer',
    title: 'Demo Text Transformer',
    shortDescription: 'Foundation tool demonstrating workspace, statistics, clipboard, and Web Worker processing.',
    description: 'This foundation tool validates the core Text Tools engine.',
    category: 'text',
    icon: 'Wand2',
    keywords: ['demo', 'foundation', 'case converter', 'text transformer'],
    seo: {
      title: 'Demo Text Transformer – Client-Side Text Utility | Text Tools',
      description: 'Test the Text Tools browser workspace with case conversion and live statistics.'
    },
    requiresClient: true,
    processorId: 'demo-transformer',
    relatedTools: ['word-counter', 'uppercase-converter', 'json-formatter'],
    isFoundationDemo: true,
    faq: []
  }
];

export function getAllTools(): ToolDefinition[] {
  return TOOL_REGISTRY;
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.category === category);
}

export function getRelatedTools(currentSlug: string): ToolDefinition[] {
  const current = getToolBySlug(currentSlug);
  if (!current) return [];

  if (current.relatedTools && current.relatedTools.length > 0) {
    const matched = TOOL_REGISTRY.filter((t) => current.relatedTools.includes(t.slug));
    if (matched.length > 0) return matched;
  }

  return TOOL_REGISTRY.filter((t) => t.category === current.category && t.slug !== currentSlug).slice(0, 3);
}

export function searchTools(query: string, category?: ToolCategory | 'all'): ToolDefinition[] {
  let list = TOOL_REGISTRY;

  if (category && category !== 'all') {
    list = list.filter((t) => t.category === category);
  }

  if (!query || !query.trim()) {
    return list;
  }

  const q = query.toLowerCase().trim();
  return list.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
  );
}

export interface RegistryValidationReport {
  isValid: boolean;
  totalToolsCount: number;
  seoToolsCount: number;
  errors: string[];
}

export function validateRegistryIntegrity(processorRegistryKeys: string[]): RegistryValidationReport {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const validCategories = new Set(CATEGORIES.map((c) => c.id));
  const validProcessorKeys = new Set(processorRegistryKeys);

  const seoTools = TOOL_REGISTRY.filter((t) => t.category === 'seo');
  if (seoTools.length !== 9) {
    errors.push(`Expected 9 SEO category tools, but found ${seoTools.length}.`);
  }

  TOOL_REGISTRY.forEach((tool, index) => {
    // ID Check
    if (!tool.id) errors.push(`Tool at index ${index} is missing an ID.`);
    if (seenIds.has(tool.id)) errors.push(`Duplicate tool ID found: "${tool.id}".`);
    seenIds.add(tool.id);

    // Slug Check
    if (!tool.slug) errors.push(`Tool "${tool.id}" is missing a slug.`);
    if (seenSlugs.has(tool.slug)) errors.push(`Duplicate tool slug found: "${tool.slug}".`);
    seenSlugs.add(tool.slug);

    // Category Check
    if (!validCategories.has(tool.category)) {
      errors.push(`Tool "${tool.id}" has invalid category: "${tool.category}".`);
    }

    // SEO Metadata Check
    if (!tool.seo || !tool.seo.title || !tool.seo.description) {
      errors.push(`Tool "${tool.id}" is missing complete SEO title or description.`);
    }

    // Processor Mapping Check
    if (tool.processorId && !validProcessorKeys.has(tool.processorId)) {
      errors.push(`Tool "${tool.id}" maps to unknown processorId: "${tool.processorId}".`);
    }
  });

  // Related Tools Reference Check
  TOOL_REGISTRY.forEach((tool) => {
    if (tool.relatedTools) {
      tool.relatedTools.forEach((relSlug) => {
        if (!seenSlugs.has(relSlug)) {
          errors.push(`Tool "${tool.id}" references unknown related tool slug: "${relSlug}".`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    totalToolsCount: TOOL_REGISTRY.length,
    seoToolsCount: seoTools.length,
    errors
  };
}
