import { ProcessorInput, ProcessorResult } from '../../../types';
import { computeTextStatistics } from '../../utils/unicode';
import {
  wordCounterProcessor,
  characterCounterProcessor,
  textStatisticsProcessor,
  readingTimeCalculatorProcessor,
  uppercaseProcessor,
  lowercaseProcessor,
  titleCaseProcessor,
  sentenceCaseProcessor,
  removeExtraSpacesProcessor,
  removeEmptyLinesProcessor,
  removeDuplicateLinesProcessor,
  sortLinesProcessor,
  reverseTextProcessor,
  textCleanerProcessor,
  findAndReplaceProcessor,
  textCompareProcessor,
  textSplitterProcessor,
  textMergerProcessor,
  loremIpsumProcessor,
  randomTextProcessor
} from './essentials';

import {
  jsonFormatterProcessor,
  jsonValidatorProcessor,
  jsonMinifierProcessor,
  base64EncoderProcessor,
  base64DecoderProcessor,
  urlEncoderProcessor,
  urlDecoderProcessor,
  htmlEncoderProcessor,
  htmlDecoderProcessor,
  unicodeConverterProcessor,
  htmlFormatterProcessor,
  cssFormatterProcessor,
  javascriptFormatterProcessor,
  sqlFormatterProcessor,
  markdownToHtmlProcessor,
  regexTesterProcessor,
  jwtDecoderProcessor,
  timestampConverterProcessor,
  escapeUnescapeProcessor
} from './developer';

import {
  keywordCounterProcessor,
  keywordDensityProcessor,
  wordFrequencyProcessor,
  slugGeneratorProcessor,
  readabilityCheckerProcessor,
  metaTitleCheckerProcessor,
  metaDescriptionCheckerProcessor,
  headingAnalyzerProcessor,
  keywordExtractorProcessor
} from './seo';

export type ProcessorFunction = (input: string, options?: Record<string, any>) => {
  output: string;
  metadata?: Record<string, any>;
};

export const processorRegistry: Record<string, ProcessorFunction> = {
  'demo-transformer': (input: string, options?: Record<string, any>) => {
    const mode = options?.mode || 'uppercase';
    if (mode === 'uppercase') return uppercaseProcessor(input);
    if (mode === 'lowercase') return lowercaseProcessor(input);
    if (mode === 'titlecase') return titleCaseProcessor(input);
    if (mode === 'reverse') return reverseTextProcessor(input, { mode: 'entire' });
    if (mode === 'trim') return textCleanerProcessor(input, { trim: true });
    return uppercaseProcessor(input);
  },

  // 1. Statistics
  'word-counter': (input) => wordCounterProcessor(input),
  'character-counter': (input) => characterCounterProcessor(input),
  'text-statistics': (input) => textStatisticsProcessor(input),
  'reading-time-calculator': (input, options) => readingTimeCalculatorProcessor(input, options),

  // 2. Case Converters
  'uppercase-converter': (input) => uppercaseProcessor(input),
  'lowercase-converter': (input) => lowercaseProcessor(input),
  'title-case-converter': (input) => titleCaseProcessor(input),
  'sentence-case-converter': (input) => sentenceCaseProcessor(input),

  // 3. Text Cleaning
  'remove-extra-spaces': (input, options) => removeExtraSpacesProcessor(input, options),
  'remove-empty-lines': (input, options) => removeEmptyLinesProcessor(input, options),
  'remove-duplicate-lines': (input, options) => removeDuplicateLinesProcessor(input, options),
  'sort-lines': (input, options) => sortLinesProcessor(input, options),
  'reverse-text': (input, options) => reverseTextProcessor(input, options),
  'text-cleaner': (input, options) => textCleanerProcessor(input, options),

  // 4. Text Editing
  'find-and-replace': (input, options) => findAndReplaceProcessor(input, options),
  'text-compare': (input, options) => textCompareProcessor(input, options?.inputB || ''),
  'text-splitter': (input, options) => textSplitterProcessor(input, options),
  'text-merger': (input, options) => textMergerProcessor(options?.textBlocks || [input], options?.separator || '\n'),

  // 5. Generators
  'lorem-ipsum-generator': (_, options) => loremIpsumProcessor(options),
  'random-text-generator': (_, options) => randomTextProcessor(options),

  // 6. JSON Tools
  'json-formatter': (input, options) => jsonFormatterProcessor(input, options),
  'json-validator': (input) => jsonValidatorProcessor(input),
  'json-minifier': (input) => jsonMinifierProcessor(input),

  // 7. Encoding Tools
  'base64-encoder': (input) => base64EncoderProcessor(input),
  'base64-decoder': (input) => base64DecoderProcessor(input),
  'url-encoder': (input) => urlEncoderProcessor(input),
  'url-decoder': (input) => urlDecoderProcessor(input),
  'html-encoder': (input) => htmlEncoderProcessor(input),
  'html-decoder': (input) => htmlDecoderProcessor(input),
  'unicode-converter': (input, options) => unicodeConverterProcessor(input, options),

  // 8. Code / Markup Formatters
  'html-formatter': (input, options) => htmlFormatterProcessor(input, options),
  'css-formatter': (input, options) => cssFormatterProcessor(input, options),
  'javascript-formatter': (input, options) => javascriptFormatterProcessor(input, options),
  'sql-formatter': (input, options) => sqlFormatterProcessor(input, options),
  'markdown-to-html': (input) => markdownToHtmlProcessor(input),

  // 9. Developer Utilities
  'regex-tester': (input, options) => regexTesterProcessor(input, options),
  'jwt-decoder': (input) => jwtDecoderProcessor(input),
  'timestamp-converter': (input, options) => timestampConverterProcessor(input, options),
  'hash-generator': (input) => ({ output: input, metadata: { note: 'Async hash calculated in UI component' } }),
  'escape-unescape': (input, options) => escapeUnescapeProcessor(input, options),

  // 10. SEO & Content Tools
  'keyword-counter': (input, options) => keywordCounterProcessor(input, options),
  'keyword-density-checker': (input, options) => keywordDensityProcessor(input, options),
  'word-frequency-counter': (input, options) => wordFrequencyProcessor(input, options),
  'slug-generator': (input, options) => slugGeneratorProcessor(input, options),
  'text-readability-calculator': (input) => readabilityCheckerProcessor(input),
  'meta-title-checker': (input, options) => metaTitleCheckerProcessor(input, options),
  'meta-description-checker': (input, options) => metaDescriptionCheckerProcessor(input, options),
  'heading-analyzer': (input, options) => headingAnalyzerProcessor(input, options),
  'keyword-extractor': (input, options) => keywordExtractorProcessor(input, options)
};

export function executeProcessorSync(
  processorId: string,
  input: ProcessorInput
): ProcessorResult {
  try {
    const text = input.text ?? '';
    const processor = processorRegistry[processorId];

    if (!processor) {
      const statistics = computeTextStatistics(text);
      return {
        success: true,
        data: {
          output: text,
          statistics,
          metadata: { note: 'Identity processor fallback' }
        }
      };
    }

    const { output, metadata } = processor(text, input.options);
    const statistics = computeTextStatistics(output);

    return {
      success: true,
      data: {
        output,
        statistics,
        metadata
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error processing text'
    };
  }
}
