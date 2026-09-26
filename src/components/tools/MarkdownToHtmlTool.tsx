import React, { useState } from 'react';
import { FileText, Eye, Copy, Download, Check, ShieldCheck } from 'lucide-react';
import { markdownToHtmlProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const MarkdownToHtmlTool: React.FC = () => {
  const sampleMarkdown = `# Markdown to HTML Converter

Text Tools allows converting **Markdown** into sanitized HTML output.

## Features:
- Headings & Paragraphs
- **Bold** & *Italic* text
- [Text Tools Homepage](/)
- Inline \`code\` and code blocks
- Unordered lists & Blockquotes

> All HTML output is client-side sanitized with DOMPurify to prevent XSS.`;

  const [inputText, setInputText] = useState(sampleMarkdown);
  const [viewMode, setViewMode] = useState<'source' | 'preview'>('source');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const res = markdownToHtmlProcessor(inputText);
  const htmlOutput = res.output;

  const handleCopy = async () => {
    if (!htmlOutput) return;
    const ok = await copyToClipboard(htmlOutput);
    if (ok.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!htmlOutput) return;
    downloadAsTxtFile(htmlOutput, 'converted-markdown.html');
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sanitized Output: Preview HTML is strictly sanitized using DOMPurify before rendering.</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[340px]">
        {/* Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Markdown Source
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste Markdown text here..."
            className="w-full flex-1 min-h-[300px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('source')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'source' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                HTML Source
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Rendered Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!htmlOutput}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy HTML'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!htmlOutput}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloaded ? 'Saved' : 'HTML'}
              </button>
            </div>
          </div>

          {viewMode === 'source' ? (
            <textarea
              readOnly
              value={htmlOutput}
              placeholder="HTML source will appear here..."
              className="w-full flex-1 min-h-[300px] p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-900 font-medium"
            />
          ) : (
            <div
              className="w-full flex-1 min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
