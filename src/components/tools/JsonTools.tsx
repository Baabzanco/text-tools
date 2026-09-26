import React, { useState } from 'react';
import { Code, Copy, Download, Check, AlertCircle, FileCode, CheckCircle2, Braces } from 'lucide-react';
import { jsonFormatterProcessor, jsonValidatorProcessor, jsonMinifierProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

interface JsonToolsProps {
  toolMode: 'formatter' | 'validator' | 'minifier';
}

export const JsonTools: React.FC<JsonToolsProps> = ({ toolMode }) => {
  const [inputText, setInputText] = useState('{\n  "name": "Text Tools",\n  "type": "Developer Utility",\n  "features": ["JSON Formatter", "Validator", "Minifier"],\n  "privacy": "100% Client Side"\n}');
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const getOutput = () => {
    if (toolMode === 'formatter') {
      return jsonFormatterProcessor(inputText, { indent });
    }
    if (toolMode === 'minifier') {
      return jsonMinifierProcessor(inputText);
    }
    return jsonValidatorProcessor(inputText);
  };

  const res = getOutput();
  const meta: Record<string, any> = res.metadata || {};
  const outputText = res.output;
  const isValidJson = meta.valid === true || meta.isValid === true;

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
    downloadAsTxtFile(outputText, 'json-output.json');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Options Bar for Formatter */}
      {toolMode === 'formatter' && (
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Indentation:</span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
              <button
                onClick={() => setIndent('2')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  indent === '2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => setIndent('4')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  indent === '4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                4 Spaces
              </button>
              <button
                onClick={() => setIndent('tab')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  indent === 'tab' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tabs
              </button>
            </div>
          </div>

          <span className="text-slate-400 font-mono">JSON Engine</span>
        </div>
      )}

      {/* Validation Status Banner */}
      {meta.error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block font-bold">Invalid JSON Syntax:</strong>
            <p className="font-mono text-[11px]">{meta.error}</p>
          </div>
        </div>
      ) : toolMode === 'validator' && isValidJson ? (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">Valid JSON Document</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-emerald-800">
            <span>Type: <strong>{meta.rootType}</strong></span>
            <span>Nesting Depth: <strong>{meta.nestingDepth}</strong></span>
            <span>Total Keys: <strong>{meta.keyCount}</strong></span>
          </div>
        </div>
      ) : null}

      {/* Main Dual Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[340px]">
        {/* Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Braces className="w-3.5 h-3.5 text-indigo-600" />
              Raw JSON Input
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Input
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw JSON here..."
            className="w-full flex-1 min-h-[280px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {toolMode === 'formatter' ? 'Formatted Output' : toolMode === 'minifier' ? 'Minified Compact Output' : 'Validation Tree'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!outputText || !isValidJson}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputText || !isValidJson}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloaded ? 'Saved' : 'JSON'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder="Result will appear here..."
            className="w-full flex-1 min-h-[280px] p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-900 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
