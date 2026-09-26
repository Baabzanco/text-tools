import React, { useState } from 'react';
import { Columns, Check, AlertCircle, Copy, Download, Trash2, ArrowRightLeft } from 'lucide-react';
import { textCompareProcessor } from '../../lib/text/processors/essentials';
import { copyToClipboard } from '../../lib/utils/clipboard';

export const TextCompareTool: React.FC = () => {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const res = textCompareProcessor(textA, textB);
  const { isIdentical, diffLines } = res.metadata as {
    isIdentical: boolean;
    diffLines: Array<{
      type: 'added' | 'removed' | 'unchanged';
      lineANumber?: number;
      lineBNumber?: number;
      text: string;
    }>;
  };

  const handleCopyDiff = async () => {
    const summary = diffLines.map(d => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' ';
      return `${prefix} ${d.text}`;
    }).join('\n');

    const ok = await copyToClipboard(summary);
    if (ok.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Side-by-side Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[280px]">
        {/* Input A */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Text Block A (Original)
            </span>
            {textA && (
              <button
                onClick={() => setTextA('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text (Block A) here..."
            className="w-full flex-1 min-h-[220px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-800"
          />
        </div>

        {/* Input B */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Text Block B (Modified)
            </span>
            {textB && (
              <button
                onClick={() => setTextB('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste modified text (Block B) here..."
            className="w-full flex-1 min-h-[220px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-800"
          />
        </div>
      </div>

      {/* Comparison Results Section */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isIdentical ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                <Check className="w-4 h-4 text-emerald-600" />
                Both Texts Are Identical
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Differences Detected
              </span>
            )}
          </div>

          <button
            onClick={handleCopyDiff}
            disabled={!textA && !textB}
            className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Copied Diff' : 'Copy Diff Summary'}
          </button>
        </div>

        {/* Visual Line Diff Output */}
        <div className="p-4 font-mono text-xs max-h-[400px] overflow-y-auto space-y-1">
          {!textA && !textB ? (
            <p className="text-slate-400 italic text-center py-6">
              Enter text in Block A and Block B above to see real-time line differences...
            </p>
          ) : (
            diffLines.map((line, idx) => {
              if (line.type === 'added') {
                return (
                  <div key={idx} className="bg-emerald-50 text-emerald-900 p-1.5 rounded border-l-4 border-emerald-500 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">+</span>
                    <span className="whitespace-pre-wrap break-all">{line.text}</span>
                  </div>
                );
              }
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="bg-rose-50 text-rose-900 p-1.5 rounded border-l-4 border-rose-500 flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">-</span>
                    <span className="whitespace-pre-wrap break-all">{line.text}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="text-slate-600 p-1 flex items-start gap-2">
                  <span className="text-slate-300 font-bold shrink-0"> </span>
                  <span className="whitespace-pre-wrap break-all">{line.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
