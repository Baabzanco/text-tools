import React, { useState } from 'react';
import { FileText, Copy, Download, Check, Trash2, Clock, Hash, AlignLeft, Layers } from 'lucide-react';
import { textStatisticsProcessor } from '../../lib/text/processors/essentials';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const StatisticsTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const res = textStatisticsProcessor(inputText);
  const meta = res.metadata || {};

  const handleCopy = async () => {
    if (!inputText) return;
    const ok = await copyToClipboard(inputText);
    if (ok.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!inputText) return;
    downloadAsTxtFile(inputText, 'text-statistics-input.txt');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Words</span>
          <span className="text-2xl font-extrabold text-white tabular-nums">{(meta.wordCount || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Characters</span>
          <span className="text-2xl font-extrabold text-indigo-300 tabular-nums">{(meta.charCount || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Chars (No Spaces)</span>
          <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">{(meta.charsNoSpaces || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Sentences</span>
          <span className="text-2xl font-extrabold text-purple-300 tabular-nums">{(meta.sentenceCount || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-400 block text-[10px]">PARAGRAPHS</span>
          <span className="font-bold text-slate-800">{meta.paragraphCount || 0}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">LINES</span>
          <span className="font-bold text-slate-800">{meta.lineCount || 0}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">UTF-8 BYTES</span>
          <span className="font-bold text-slate-800">{(meta.byteCount || 0).toLocaleString()} B</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">AVG WORD LEN</span>
          <span className="font-bold text-slate-800">{meta.avgWordLength || 0} chars</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">LONGEST WORD</span>
          <span className="font-bold text-indigo-600 truncate block max-w-[120px]">{meta.longestWord || '—'}</span>
        </div>
      </div>

      {/* Input Editor */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Source Text Editor
          </span>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer mr-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!inputText}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!inputText}
              className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloaded ? 'Saved' : 'TXT'}
            </button>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text here to inspect live character counts, word statistics, and text metrics..."
          className="w-full min-h-[260px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
        />
      </div>
    </div>
  );
};
