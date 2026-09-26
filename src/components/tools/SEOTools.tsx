import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Globe,
  Gauge,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Info
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';
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
} from '../../lib/text/processors/seo';

export type SEOToolMode =
  | 'keyword-counter'
  | 'keyword-density'
  | 'word-frequency'
  | 'slug-generator'
  | 'readability'
  | 'meta-title'
  | 'meta-description'
  | 'heading-analyzer'
  | 'keyword-extractor';

interface Props {
  toolMode: SEOToolMode;
}

export const SEOTools: React.FC<Props> = ({ toolMode }) => {
  const [inputText, setInputText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Keyword Counter Options
  const [keywordsInput, setKeywordsInput] = useState<string>('text, tools, seo, content');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(true);

  // Word Frequency / Extractor Options
  const [minLength, setMinLength] = useState<number>(3);
  const [minFrequency, setMinFrequency] = useState<number>(2);
  const [ignoreNumbers, setIgnoreNumbers] = useState<boolean>(true);
  const [ignoreStopWords, setIgnoreStopWords] = useState<boolean>(true);

  // Slug Generator Options
  const [maxSlugLength, setMaxSlugLength] = useState<number>(80);
  const [transliterate, setTransliterate] = useState<boolean>(true);

  // Meta Title / Description Target Keyword
  const [targetKeyword, setTargetKeyword] = useState<string>('');

  const handleCopy = async (textToCopy: string) => {
    const res = await copyToClipboard(textToCopy);
    if (res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    downloadAsTxtFile(content, filename);
  };

  // --- Compute Results locally based on toolMode ---
  const result = useMemo(() => {
    switch (toolMode) {
      case 'keyword-counter':
        return keywordCounterProcessor(inputText, {
          keywords: keywordsInput,
          caseSensitive,
          wholeWord
        });

      case 'keyword-density':
        return keywordDensityProcessor(inputText);

      case 'word-frequency':
        return wordFrequencyProcessor(inputText, {
          caseSensitive,
          minLength,
          ignoreNumbers,
          ignoreStopWords
        });

      case 'slug-generator':
        return slugGeneratorProcessor(inputText, {
          maxLength: maxSlugLength,
          transliterate
        });

      case 'readability':
        return readabilityCheckerProcessor(inputText);

      case 'meta-title':
        return metaTitleCheckerProcessor(inputText, { targetKeyword });

      case 'meta-description':
        return metaDescriptionCheckerProcessor(inputText, { targetKeyword });

      case 'heading-analyzer':
        return headingAnalyzerProcessor(inputText);

      case 'keyword-extractor':
        return keywordExtractorProcessor(inputText, {
          minFrequency,
          minLength
        });

      default:
        return { output: inputText, metadata: {} };
    }
  }, [
    toolMode,
    inputText,
    keywordsInput,
    caseSensitive,
    wholeWord,
    minLength,
    minFrequency,
    ignoreNumbers,
    ignoreStopWords,
    maxSlugLength,
    transliterate,
    targetKeyword
  ]);

  const meta = (result.metadata || {}) as any;

  return (
    <div className="space-y-6">
      {/* 1. KEYWORD COUNTER UI */}
      {toolMode === 'keyword-counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document / Article Text
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text or article here to search for target keywords..."
              className="w-full h-80 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-sans focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
            />
          </div>

          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Target Keywords</span>
            </h3>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1.5">
                Keywords (comma or newline separated)
              </label>
              <textarea
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g. text tools, online, privacy"
                className="w-full h-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholeWord}
                  onChange={(e) => setWholeWord(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Whole Word Match Only</span>
              </label>
            </div>

            {/* Keyword Match Results Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Words Analyzed:</span>
                <span className="font-bold text-slate-900">{meta.totalWords || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Matches Found:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {meta.totalMatches || 0}
                </span>
              </div>

              {meta.results && meta.results.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Occurrences:</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {meta.results.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
                      >
                        <span className="font-mono text-slate-800 truncate max-w-[120px]">
                          {item.keyword}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600">{item.count}x</span>
                          <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. KEYWORD DENSITY CHECKER UI */}
      {toolMode === 'keyword-density' && (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Text
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article text to inspect keyword density and identify potential keyword stuffing..."
              className="w-full h-64 p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-sans focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-600" />
                <span>Keyword Density Table (Top Words)</span>
              </h3>
              <span className="text-xs text-slate-500">
                Total Words: <strong className="text-slate-900">{meta.totalWords || 0}</strong>
              </span>
            </div>

            {meta.items && meta.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Word</th>
                      <th className="py-2.5 px-3">Count</th>
                      <th className="py-2.5 px-3">Density</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meta.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{item.word}</td>
                        <td className="py-2.5 px-3 text-slate-700">{item.count}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.density}%</td>
                        <td className="py-2.5 px-3">
                          {item.isHighDensity ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              <span>High-Density Warning (Heuristic &gt;4.5%)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Standard Frequency
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Enter text above to compute keyword density analysis.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. WORD FREQUENCY COUNTER UI */}
      {toolMode === 'word-frequency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article text to generate word frequency list..."
              className="w-full h-80 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-sans focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Frequency Controls
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">
                  Min Word Length: <strong>{minLength}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={ignoreStopWords}
                  onChange={(e) => setIgnoreStopWords(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Filter Common Stop Words</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreNumbers}
                  onChange={(e) => setIgnoreNumbers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Ignore Numbers</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Case Sensitive</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Unique Words:</span>
                <span className="font-bold text-slate-900">{meta.uniqueWords || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Words:</span>
                <span className="font-bold text-slate-900">{meta.totalWords || 0}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Word Frequency Results</h3>
            {meta.frequencies && meta.frequencies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                {meta.frequencies.map((f: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 truncate">{f.word}</span>
                      <span className="text-indigo-600 font-bold">{f.count}x</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, f.percentage * 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No words matching current criteria.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. SLUG GENERATOR UI */}
      {toolMode === 'slug-generator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Title or Article Headline
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 10 Best Online Text Utilities for Developers in 2026!"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transliterate}
                  onChange={(e) => setTransliterate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Transliterate Non-Latin (Persian/Arabic → Latin)</span>
              </label>

              <div className="flex items-center gap-2">
                <span>Max Slug Length:</span>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={maxSlugLength}
                  onChange={(e) => setMaxSlugLength(Number(e.target.value))}
                  className="w-20 p-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span>Generated URL Slug</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(result.output)}
                  disabled={!result.output}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Slug'}</span>
                </button>
                <button
                  onClick={() => handleDownload(result.output, 'url-slug.txt')}
                  disabled={!result.output}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-sm rounded-xl break-all">
              {result.output ? result.output : <span className="text-slate-500 italic">your-slug-will-appear-here</span>}
            </div>
          </div>
        </div>
      )}

      {/* 5. TEXT READABILITY CALCULATOR UI */}
      {toolMode === 'readability' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Article Text
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article or essay text to evaluate readability score..."
              className="w-full h-64 p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-sans focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {meta.disclaimer ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>{meta.disclaimer}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-medium text-slate-500">Flesch Reading Ease</span>
                <div className="text-3xl font-extrabold text-indigo-600">
                  {meta.fleschEase ?? '--'}
                </div>
                <span className="text-[10px] text-slate-400 block">Scale 0 (Hard) to 100 (Easy)</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-medium text-slate-500">Flesch-Kincaid Grade</span>
                <div className="text-3xl font-extrabold text-slate-900">
                  {meta.gradeLevel ?? '--'}
                </div>
                <span className="text-[10px] text-slate-400 block">Estimated School Grade Level</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 lg:col-span-2">
                <span className="text-xs font-medium text-slate-500">Readability Assessment</span>
                <div className="text-base font-bold text-slate-900">
                  {meta.label ?? 'Enter text to calculate'}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Words: <strong>{meta.words || 0}</strong></span>
                  <span>Sentences: <strong>{meta.sentences || 0}</strong></span>
                  <span>Syllables: <strong>{meta.totalSyllables || 0}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. META TITLE CHECKER UI */}
      {toolMode === 'meta-title' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Meta Title Text
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. Free Online Text Tools – Privacy-First Text Utilities"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">
                Target Keyword (Optional)
              </label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g. Text Tools"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Metrics Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Character Count:</span>
                <span className="text-lg font-bold text-slate-900">
                  {meta.charCount || 0} / 60
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Pixel Width:</span>
                <span className="text-lg font-bold text-slate-900">
                  {meta.pixelWidth || 0}px / 580px
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Keyword:</span>
                <span className={`text-sm font-bold ${meta.hasKeyword ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {meta.targetKeyword ? (meta.hasKeyword ? 'Included ✓' : 'Missing') : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Google SERP Live Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Google Desktop SERP Snippet Preview</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-sans">
              <div className="text-[12px] text-slate-700 flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Text Tools</span>
                <span className="text-slate-400">https://texttools.app › tools</span>
              </div>
              <div className="text-lg text-indigo-700 hover:underline font-normal cursor-pointer leading-tight truncate max-w-[580px]">
                {result.output ? result.output : 'Your Page Title Preview Will Appear Here'}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 max-w-[600px]">
                An example meta description showing how your page snippet will look on Google desktop search results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. META DESCRIPTION CHECKER UI */}
      {toolMode === 'meta-description' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Meta Description Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter meta description string..."
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">
                Target Keyword (Optional)
              </label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g. Text Tools"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Character Count:</span>
                <span className="text-lg font-bold text-slate-900">
                  {meta.charCount || 0} / 160
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Pixel Width:</span>
                <span className="text-lg font-bold text-slate-900">
                  {meta.pixelWidth || 0}px / 990px
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Keyword:</span>
                <span className={`text-sm font-bold ${meta.hasKeyword ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {meta.targetKeyword ? (meta.hasKeyword ? 'Included ✓' : 'Missing') : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Google Desktop SERP Snippet Preview</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-sans">
              <div className="text-[12px] text-slate-700 flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Text Tools</span>
                <span className="text-slate-400">https://texttools.app › tools</span>
              </div>
              <div className="text-lg text-indigo-700 hover:underline font-normal cursor-pointer leading-tight">
                Sample Title – Online Text Utility Platform
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 max-w-[600px] break-words">
                {result.output ? result.output : 'Your meta description preview will appear here.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. HEADING ANALYZER UI */}
      {toolMode === 'heading-analyzer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              HTML Code, Markdown, or Heading Outline
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste HTML source or Markdown headings e.g.
<h1>Main Title</h1>
<h2>Section 1</h2>
<h3>Subsection</h3>"
              className="w-full h-64 p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Warnings Panel */}
          {meta.warnings && meta.warnings.length > 0 && (
            <div className="p-5 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Document Hierarchy Warnings ({meta.warnings.length})</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                {meta.warnings.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Heading Count Badges */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Heading Level Breakdown</h3>

            <div className="flex flex-wrap gap-3">
              {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map((tag) => (
                <div key={tag} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
                  <span className="font-bold text-indigo-600">{tag}:</span>
                  <span className="font-bold text-slate-900">{meta.counts?.[tag] || 0}</span>
                </div>
              ))}
            </div>

            {meta.headings && meta.headings.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Extracted Headings Hierarchy:</span>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {meta.headings.map((h: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 rounded-lg text-xs font-mono flex items-center gap-3"
                      style={{ marginLeft: `${(h.level - 1) * 16}px` }}
                    >
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                        {h.tag}
                      </span>
                      <span className="text-slate-800 truncate">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. KEYWORD EXTRACTOR UI */}
      {toolMode === 'keyword-extractor' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Article Text to Extract Topics
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article text to automatically extract top keywords and key 2-word phrases..."
              className="w-full h-64 p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-sans focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Keywords */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Top Single Keywords</span>
              </h3>
              {meta.singleKeywords && meta.singleKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                  {meta.singleKeywords.map((k: any, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono flex items-center gap-2"
                    >
                      <span className="text-slate-900 font-medium">{k.word}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">
                        {k.count}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">No single keywords extracted.</p>
              )}
            </div>

            {/* Top 2-Word Phrases / Bigrams */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Top 2-Word Phrases</span>
              </h3>
              {meta.phrases && meta.phrases.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                  {meta.phrases.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono flex items-center gap-2"
                    >
                      <span className="text-slate-900 font-medium">{p.phrase}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                        {p.count}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">No 2-word phrases extracted.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
