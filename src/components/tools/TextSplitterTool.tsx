import React, { useState } from 'react';
import { Layers, Copy, Download, Check, Trash2, Scissors } from 'lucide-react';
import { textSplitterProcessor } from '../../lib/text/processors/essentials';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const TextSplitterTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [splitBy, setSplitBy] = useState<'chars' | 'words' | 'lines'>('chars');
  const [chunkSize, setChunkSize] = useState<number>(1000);
  const [copiedChunkIdx, setCopiedChunkIdx] = useState<number | null>(null);

  const res = textSplitterProcessor(inputText, { splitBy, chunkSize });
  const chunks = (res.metadata?.chunks as string[]) || [];

  const handleCopyChunk = async (chunkText: string, idx: number) => {
    const ok = await copyToClipboard(chunkText);
    if (ok.success) {
      setCopiedChunkIdx(idx);
      setTimeout(() => setCopiedChunkIdx(null), 2000);
    }
  };

  const handleDownloadAll = () => {
    if (chunks.length === 0) return;
    const content = chunks.map((c, i) => `=== CHUNK ${i + 1} ===\n${c}`).join('\n\n');
    downloadAsTxtFile(content, 'split-text-chunks.txt');
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Control Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Split Mode:</span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setSplitBy('chars')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  splitBy === 'chars' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                By Characters
              </button>
              <button
                onClick={() => setSplitBy('words')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  splitBy === 'words' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                By Words
              </button>
              <button
                onClick={() => setSplitBy('lines')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  splitBy === 'lines' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                By Lines
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-slate-700">Chunk Limit:</label>
            <input
              type="number"
              min={1}
              value={chunkSize}
              onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Editor & Chunks List */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Source Document</span>
            {inputText && (
              <button onClick={() => setInputText('')} className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer">
                Clear Source
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here to split into chunks..."
            className="w-full h-[180px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Chunks Output Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-indigo-600" />
              Generated Chunks ({chunks.length})
            </span>

            {chunks.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Chunks</span>
              </button>
            )}
          </div>

          {chunks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Paste text above to generate split chunks...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chunks.map((chunk, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Chunk {idx + 1}
                    </span>
                    <button
                      onClick={() => handleCopyChunk(chunk, idx)}
                      className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedChunkIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedChunkIdx === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap break-all max-h-[140px] overflow-y-auto">
                    {chunk}
                  </pre>
                  <div className="text-[10px] text-slate-400 font-mono text-right">
                    {chunk.length} characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
