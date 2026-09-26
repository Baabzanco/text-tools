import React, { useState } from 'react';
import { Search, Code, Check, AlertCircle, Copy, ShieldCheck } from 'lucide-react';
import { regexTesterProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';

export const RegexTesterTool: React.FC = () => {
  const [pattern, setPattern] = useState<string>('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b');
  const [testText, setTestText] = useState<string>('Contact support at hello@text-tools.app or sales@example.com for help.');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false
  });

  const flagStr = (flags.g ? 'g' : '') + (flags.i ? 'i' : '') + (flags.m ? 'm' : '') + (flags.s ? 's' : '');

  const res = regexTesterProcessor(testText, { pattern, flags: flagStr });
  const meta = res.metadata || {};
  const matches = (meta.matches as Array<{ match: string; index: number; groups: string[] }>) || [];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Pattern Input & Flag Toggles Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Regular Expression Pattern
            </label>
            <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded font-bold">
              /{pattern}/{flagStr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-sm font-bold">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
            <span className="text-slate-400 font-mono text-sm font-bold">/{flagStr}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600">Regex Flags:</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={flags.g}
                onChange={(e) => setFlags({ ...flags, g: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              g (global)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={flags.i}
                onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              i (case insensitive)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={flags.m}
                onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              m (multiline)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={flags.s}
                onChange={(e) => setFlags({ ...flags, s: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              s (dotAll)
            </label>
          </div>

          <div className="font-mono text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200">
            Total Matches: <strong className="text-indigo-600">{meta.matchCount || 0}</strong>
          </div>
        </div>
      </div>

      {meta.error && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Pattern error: {meta.error}</span>
        </div>
      )}

      <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Client-Side Local Evaluation:</strong> Regex evaluation executes 100% locally in your browser DOM. Highly complex nested patterns with catastrophic backtracking (ReDoS) can be computationally expensive on large inputs.
        </span>
      </div>

      {/* Test String & Match Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        <div className="flex flex-col space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
            Test Text
          </span>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to evaluate regex against..."
            className="w-full flex-1 min-h-[240px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
            Matches & Capture Groups
          </span>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
            {matches.length === 0 ? (
              <p className="text-slate-400 italic py-6 text-center">
                No regex matches found in test text.
              </p>
            ) : (
              matches.map((m, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-indigo-900 font-bold">
                    <span>Match #{idx + 1}: <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{m.match}</code></span>
                    <span className="text-[10px] text-slate-400 font-normal">Index: {m.index}</span>
                  </div>
                  {m.groups.length > 0 && (
                    <div className="pl-2 border-l-2 border-indigo-200 text-[11px] text-slate-600 space-y-0.5 pt-1">
                      {m.groups.map((g, gIdx) => (
                        <div key={gIdx}>Group {gIdx + 1}: <span className="text-slate-900 font-medium">{g || 'undefined'}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
