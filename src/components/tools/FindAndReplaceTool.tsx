import React, { useState } from 'react';
import { Search, Replace, Check, Copy, Download, Trash2, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';
import { findAndReplaceProcessor } from '../../lib/text/processors/essentials';

export const FindAndReplaceTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [searchString, setSearchString] = useState('');
  const [replaceString, setReplaceString] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const res = findAndReplaceProcessor(inputText, {
    search: searchString,
    replace: replaceString,
    replaceAll: true,
    caseSensitive,
    wholeWord
  });

  const outputText = res.output;
  const matchCount = res.metadata?.count || 0;

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
    downloadAsTxtFile(outputText, 'find-and-replace-result.txt');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Search & Replace Control Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Find Text
            </label>
            <input
              type="text"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="Enter text to search for..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Replace className="w-3.5 h-3.5 text-indigo-600" />
              Replace With
            </label>
            <input
              type="text"
              value={replaceString}
              onChange={(e) => setReplaceString(e.target.value)}
              placeholder="Enter replacement text..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/60 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Case Sensitive
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Whole Word Only
            </label>
          </div>

          <div className="font-mono text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200">
            {searchString ? (
              <span>Matches Found: <strong className="text-indigo-600">{matchCount}</strong></span>
            ) : (
              <span className="text-slate-400">Enter search term above</span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px]">
        {/* Source Text Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Source Text
            </span>
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your source text here..."
            className="w-full flex-1 min-h-[260px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Processed Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Replaced Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloaded ? 'Saved' : 'TXT'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder="Replaced output will appear here..."
            className="w-full flex-1 min-h-[260px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
          />
        </div>
      </div>
    </div>
  );
};
