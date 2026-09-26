import React, { useState } from 'react';
import { Sparkles, Copy, Download, Check, RefreshCw } from 'lucide-react';
import { loremIpsumProcessor, randomTextProcessor } from '../../lib/text/processors/essentials';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

interface GeneratorsToolProps {
  type: 'lorem' | 'random';
}

export const GeneratorsTool: React.FC<GeneratorsToolProps> = ({ type }) => {
  const [mode, setMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includePunctuation, setIncludePunctuation] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [seed, setSeed] = useState(0);

  const res = type === 'lorem'
    ? loremIpsumProcessor({ mode, count, seed })
    : randomTextProcessor({ mode, count, includeNumbers, includePunctuation, seed });

  const outputText = res.output;

  const handleRegenerate = () => {
    setSeed(s => s + 1);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const filename = type === 'lorem' ? 'lorem-ipsum.txt' : 'random-text.txt';
    downloadAsTxtFile(outputText, filename);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Options Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Generate By:</span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setMode('paragraphs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'paragraphs' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                Paragraphs
              </button>
              <button
                onClick={() => setMode('sentences')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'sentences' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                Sentences
              </button>
              <button
                onClick={() => setMode('words')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'words' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                Words
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-slate-700">Quantity (1-100):</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          </div>
        </div>

        {type === 'random' && (
          <div className="flex items-center gap-4 pt-2 border-t border-slate-200 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Include Numbers
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includePunctuation}
                onChange={(e) => setIncludePunctuation(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Include Punctuation
            </label>
          </div>
        )}
      </div>

      {/* Output Workspace */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Generated Text Output
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloaded ? 'Saved' : 'TXT'}
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={outputText}
          className="w-full min-h-[300px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-sans leading-relaxed text-slate-900"
        />
      </div>
    </div>
  );
};
