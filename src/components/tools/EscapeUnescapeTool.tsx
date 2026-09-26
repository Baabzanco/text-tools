import React, { useState } from 'react';
import { Code, Copy, Download, Check, RefreshCw } from 'lucide-react';
import { escapeUnescapeProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const EscapeUnescapeTool: React.FC = () => {
  const [inputText, setInputText] = useState('Hello "World"!\nLine 2\tTabbed');
  const [mode, setMode] = useState<'json-escape' | 'js-escape' | 'unescape'>('json-escape');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const res = escapeUnescapeProcessor(inputText, { mode });
  const outputText = res.output;

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
    downloadAsTxtFile(outputText, 'escaped-string.txt');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Mode Control Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Operation:</span>
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setMode('json-escape')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'json-escape' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              JSON Escape
            </button>
            <button
              onClick={() => setMode('js-escape')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'js-escape' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              JavaScript String Escape
            </button>
            <button
              onClick={() => setMode('unescape')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'unescape' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              Unescape String
            </button>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        {/* Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Source Input String
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste string here to escape or unescape..."
            className="w-full flex-1 min-h-[260px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Result String
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
            placeholder="Result will appear here..."
            className="w-full flex-1 min-h-[260px] p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
