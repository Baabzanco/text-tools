import React, { useState, useEffect, useCallback, useId } from 'react';
import { Copy, Download, Trash2, ArrowRightLeft, Sparkles, Check, FileText, Layers, Clock, Hash, Cpu } from 'lucide-react';
import { TextStatistics, ProcessorResult } from '../../types';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';
import { runTextProcessor } from '../../lib/text/worker-client';

interface TextWorkspaceProps {
  processorId?: string;
  initialText?: string;
  placeholder?: string;
  optionsConfig?: {
    modes?: { id: string; label: string }[];
    defaultMode?: string;
  };
  onTextChange?: (text: string, stats: TextStatistics) => void;
  toolSlug?: string;
}

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({
  processorId = 'demo-transformer',
  initialText = '',
  placeholder = 'Type, paste, or drag and drop your text here to begin analyzing or transforming...',
  optionsConfig,
  toolSlug = 'demo-text-transformer'
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [outputText, setOutputText] = useState<string>('');
  const [activeMode, setActiveMode] = useState<string>(
    optionsConfig?.defaultMode || optionsConfig?.modes?.[0]?.id || 'uppercase'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [executionMeta, setExecutionMeta] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'split' | 'output'>('split');
  const [stats, setStats] = useState<TextStatistics>({
    charCount: 0,
    wordCount: 0,
    lineCount: 0,
    byteCount: 0,
    readingTimeMinutes: 0
  });

  const textareaId = useId();

  // Process text whenever inputText, activeMode, or processorId changes
  const processInput = useCallback(async (text: string, mode: string) => {
    setIsProcessing(true);
    try {
      const result: ProcessorResult = await runTextProcessor(processorId, {
        text,
        options: { mode }
      });

      if (result.success && result.data) {
        setOutputText(result.data.output);
        setStats(result.data.statistics);
        if (result.data.metadata) {
          setExecutionMeta(result.data.metadata);
        }
      } else {
        setOutputText(text); // fallback
      }
    } catch (err) {
      console.error('Workspace process error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [processorId]);

  useEffect(() => {
    processInput(inputText, activeMode);
  }, [inputText, activeMode, processInput]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setIsCopied(false);
  };

  const handleCopy = async (targetText: string) => {
    if (!targetText) return;
    const res = await copyToClipboard(targetText);
    if (res.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = (targetText: string) => {
    if (!targetText) return;
    const filename = `${toolSlug}-output.txt`;
    const ok = downloadAsTxtFile(targetText, filename);
    if (ok) {
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2000);
    }
  };

  const handleLoadSample = () => {
    const sampleText = `Welcome to Text Tools!
Text Tools is a fast, privacy-first online text utility platform designed to work completely in your browser.

Key Features:
- 100% Client-Side Processing: Your text never leaves your device.
- Instant Calculations: Word count, character count, lines, bytes, and reading time.
- Web Worker Multi-threading: Smooth processing even for large documents.
- Free & Unlimited: No accounts, no subscriptions, no ads.

Try switching transformation modes above (UPPERCASE, Title Case, Reverse, Slugify) or click Copy / Download!`;
    setInputText(sampleText);
  };

  const handleSwapInputOutput = () => {
    if (outputText) {
      setInputText(outputText);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Options & Mode Selection Bar */}
      {optionsConfig?.modes && optionsConfig.modes.length > 0 && (
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Operation:
            </span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              {optionsConfig.modes.map((m) => {
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveMode(m.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Local Browser Engine</span>
            {isProcessing && <span className="text-indigo-600 animate-pulse font-sans font-medium">Processing...</span>}
          </div>
        </div>
      )}

      {/* Main Workspace Grid (Input vs Output) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 min-h-[380px]">
        {/* Input Pane */}
        <div className="flex flex-col p-4 bg-white relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <label htmlFor={textareaId} className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Source Input
            </label>
            <div className="flex items-center gap-2">
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100"
                  title="Clear source text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id={textareaId}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder}
            className="w-full flex-1 min-h-[260px] p-2 text-slate-800 text-sm font-sans focus:outline-none resize-y placeholder:text-slate-400 border-none"
            aria-label="Source text input editor"
          />

          {!inputText && (
            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Paste or start typing your content above</span>
              <button
                onClick={handleLoadSample}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Text
              </button>
            </div>
          )}
        </div>

        {/* Output Pane */}
        <div className="flex flex-col p-4 bg-slate-50/50 relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Processed Result
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {outputText && (
                <button
                  onClick={handleSwapInputOutput}
                  className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200/60"
                  title="Use result as source input"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Use as Input
                </button>
              )}
              
              <button
                onClick={() => handleCopy(outputText || inputText)}
                disabled={!inputText && !outputText}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={() => handleDownload(outputText || inputText)}
                disabled={!inputText && !outputText}
                className={`px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDownloaded ? 'border-emerald-500 text-emerald-700' : ''
                }`}
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                {isDownloaded ? 'Saved' : 'TXT'}
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={outputText}
            placeholder="Result will appear here in real-time..."
            className="w-full flex-1 min-h-[260px] p-2 text-slate-900 text-sm font-sans focus:outline-none resize-y placeholder:text-slate-400 bg-transparent border-none font-medium"
            aria-label="Processed result output"
          />
        </div>
      </div>

      {/* Bottom Statistics Bar */}
      <div className="bg-slate-900 text-slate-200 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Characters:</span>
            <span className="font-bold text-white text-sm tabular-nums">{stats.charCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Words:</span>
            <span className="font-bold text-white text-sm tabular-nums">{stats.wordCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Lines:</span>
            <span className="font-bold text-white text-sm tabular-nums">{stats.lineCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Bytes:</span>
            <span className="font-bold text-emerald-400 text-sm tabular-nums">{stats.byteCount.toLocaleString()} B</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Read Time:</span>
            <span className="font-bold text-indigo-300 text-sm tabular-nums">~{stats.readingTimeMinutes} min</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>100% Client-Side Privacy Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
