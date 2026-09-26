import React, { useState } from 'react';
import { Code, Copy, Download, Check, FileCode } from 'lucide-react';
import {
  htmlFormatterProcessor,
  cssFormatterProcessor,
  javascriptFormatterProcessor,
  sqlFormatterProcessor
} from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

interface CodeFormatterToolProps {
  language: 'html' | 'css' | 'js' | 'sql';
}

export const CodeFormatterTool: React.FC<CodeFormatterToolProps> = ({ language }) => {
  const defaultSamples = {
    html: '<div class="card"><h1>Header</h1><p>Paragraph text</p><ul><li>Item 1</li><li>Item 2</li></ul></div>',
    css: 'body{background:#f8fafc;color:#0f172a;} .card{padding:1rem;border-radius:0.5rem;background:#fff;}',
    js: 'function calculateSum(a,b){if(!a||!b){return 0;}let total=a+b;return total;}console.log(calculateSum(5,10));',
    sql: 'select id,name,email,created_at from users where status=\'active\' and created_at>= \'2026-01-01\' order by created_at desc;'
  };

  const [inputText, setInputText] = useState(defaultSamples[language]);
  const [indent, setIndent] = useState<number>(2);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const getFormattedCode = () => {
    if (language === 'html') return htmlFormatterProcessor(inputText, { indent });
    if (language === 'css') return cssFormatterProcessor(inputText, { indent });
    if (language === 'js') return javascriptFormatterProcessor(inputText, { indent });
    return sqlFormatterProcessor(inputText, { indent });
  };

  const res = getFormattedCode();
  const outputText = res.output;
  const error = res.metadata?.error;

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
    const extensions = { html: 'html', css: 'css', js: 'js', sql: 'sql' };
    downloadAsTxtFile(outputText, `formatted-code.${extensions[language]}`);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Options Bar */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider">Language:</span>
          <span className="font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
            {language} Formatter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Indent Size:</span>
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setIndent(2)}
              className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                indent === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => setIndent(4)}
              className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                indent === 4 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              4 Spaces
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-800 text-xs font-mono">
          Formatting warning: {error}
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px]">
        {/* Source Code */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              Unformatted Source
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
            placeholder={`Paste raw ${language.toUpperCase()} code here...`}
            className="w-full flex-1 min-h-[280px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>

        {/* Formatted Code */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Formatted Output
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
                {isDownloaded ? 'Saved' : 'Code'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder="Formatted output will appear here..."
            className="w-full flex-1 min-h-[280px] p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-900 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
