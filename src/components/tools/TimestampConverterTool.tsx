import React, { useState } from 'react';
import { Clock, Calendar, Copy, Check, RefreshCw } from 'lucide-react';
import { timestampConverterProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';

export const TimestampConverterTool: React.FC = () => {
  const now = new Date();
  const [timestampInput, setTimestampInput] = useState<string>(Math.floor(now.getTime() / 1000).toString());
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const res = timestampConverterProcessor(timestampInput);
  const meta: Record<string, any> = res.metadata || {};

  const handleSetNow = () => {
    setTimestampInput(Math.floor(Date.now() / 1000).toString());
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok.success) {
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Control Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Unix Timestamp / Date String:
          </label>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="e.g. 1774517290 or 2026-03-26T00:00:00Z"
            className="w-64 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
          />
        </div>

        <button
          onClick={handleSetNow}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Use Current Time (Now)</span>
        </button>
      </div>

      {/* Conversion Output Grid */}
      {meta.valid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">Unix Seconds</span>
              <button
                onClick={() => handleCopy(String(meta.sec || ''), 'sec')}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === 'sec' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-base font-bold text-slate-900">{meta.sec}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">Unix Milliseconds</span>
              <button
                onClick={() => handleCopy(String(meta.ms || ''), 'ms')}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'ms' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === 'ms' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-base font-bold text-slate-900">{meta.ms}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">ISO 8601 String</span>
              <button
                onClick={() => handleCopy(meta.iso || '', 'iso')}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'iso' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === 'iso' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-sm font-bold text-indigo-700">{meta.iso}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">UTC String</span>
              <button
                onClick={() => handleCopy(meta.utc || '', 'utc')}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'utc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === 'utc' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-sm font-bold text-emerald-700">{meta.utc}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">Local Timezone Format</span>
              <button
                onClick={() => handleCopy(meta.local || '', 'local')}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === 'local' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-base font-bold text-slate-900">{meta.local}</div>
          </div>
        </div>
      )}
    </div>
  );
};
