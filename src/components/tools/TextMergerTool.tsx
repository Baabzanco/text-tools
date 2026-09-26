import React, { useState } from 'react';
import { Plus, Trash2, Copy, Download, Check, Layers, ArrowDown } from 'lucide-react';
import { textMergerProcessor } from '../../lib/text/processors/essentials';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const TextMergerTool: React.FC = () => {
  const [blocks, setBlocks] = useState<string[]>(['', '']);
  const [separator, setSeparator] = useState<string>('\n');
  const [customSep, setCustomSep] = useState<string>('---');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const activeSep = separator === 'custom' ? customSep : separator;
  const res = textMergerProcessor(blocks, activeSep);
  const outputText = res.output;

  const handleAddBlock = () => {
    setBlocks([...blocks, '']);
  };

  const handleRemoveBlock = (index: number) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, val: string) => {
    const updated = [...blocks];
    updated[index] = val;
    setBlocks(updated);
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
    downloadAsTxtFile(outputText, 'merged-text-output.txt');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Separator Controls */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 uppercase tracking-wider">Join Separator:</span>
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setSeparator('\n')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                separator === '\n' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              New Line
            </button>
            <button
              onClick={() => setSeparator('\n\n')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                separator === '\n\n' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              Double Line
            </button>
            <button
              onClick={() => setSeparator(' ')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                separator === ' ' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              Space
            </button>
            <button
              onClick={() => setSeparator('custom')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                separator === 'custom' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {separator === 'custom' && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Custom String:</span>
            <input
              type="text"
              value={customSep}
              onChange={(e) => setCustomSep(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        )}
      </div>

      {/* Input Blocks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Input Text Sections ({blocks.length})
          </span>

          <button
            onClick={handleAddBlock}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text Block</span>
          </button>
        </div>

        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-mono text-slate-600">Section {idx + 1}</span>
                {blocks.length > 1 && (
                  <button
                    onClick={() => handleRemoveBlock(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <textarea
                value={block}
                onChange={(e) => handleUpdateBlock(idx, e.target.value)}
                placeholder={`Enter text block ${idx + 1}...`}
                className="w-full h-[90px] p-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Merged Output */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
            Merged Output
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy Merged'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloaded ? 'Saved' : 'TXT'}
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={outputText}
          placeholder="Merged result will appear here..."
          className="w-full h-[180px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
        />
      </div>
    </div>
  );
};
