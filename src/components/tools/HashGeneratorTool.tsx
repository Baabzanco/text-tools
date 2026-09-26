import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Download, Check, Hash } from 'lucide-react';
import { hashGeneratorProcessorAsync } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';
import { downloadAsTxtFile } from '../../lib/utils/download';

export const HashGeneratorTool: React.FC = () => {
  const [inputText, setInputText] = useState('Text Tools');
  const [sha256, setSha256] = useState('');
  const [sha384, setSha384] = useState('');
  const [sha512, setSha512] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function computeHashes() {
      if (!inputText) {
        setSha256('');
        setSha384('');
        setSha512('');
        return;
      }

      const h256 = await hashGeneratorProcessorAsync(inputText, 'SHA-256');
      const h384 = await hashGeneratorProcessorAsync(inputText, 'SHA-384');
      const h512 = await hashGeneratorProcessorAsync(inputText, 'SHA-512');

      if (active) {
        setSha256(h256.output);
        setSha384(h384.output);
        setSha512(h512.output);
      }
    }

    computeHashes();

    return () => {
      active = false;
    };
  }, [inputText]);

  const handleCopy = async (hashVal: string, name: string) => {
    const ok = await copyToClipboard(hashVal);
    if (ok.success) {
      setCopiedHash(name);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Input Area */}
      <div className="flex flex-col space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Source Text String
        </span>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter plain text to calculate cryptographic hashes..."
          className="w-full h-[100px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Generated Hashes List */}
      <div className="space-y-4 font-mono text-xs">
        {/* SHA-256 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">SHA-256</span>
            <button
              onClick={() => handleCopy(sha256, 'sha256')}
              className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              {copiedHash === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHash === 'sha256' ? 'Copied' : 'Copy Hash'}
            </button>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-900 font-bold break-all">
            {sha256 || '—'}
          </div>
        </div>

        {/* SHA-384 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">SHA-384</span>
            <button
              onClick={() => handleCopy(sha384, 'sha384')}
              className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              {copiedHash === 'sha384' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHash === 'sha384' ? 'Copied' : 'Copy Hash'}
            </button>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-900 font-bold break-all">
            {sha384 || '—'}
          </div>
        </div>

        {/* SHA-512 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">SHA-512</span>
            <button
              onClick={() => handleCopy(sha512, 'sha512')}
              className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              {copiedHash === 'sha512' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHash === 'sha512' ? 'Copied' : 'Copy Hash'}
            </button>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-900 font-bold break-all">
            {sha512 || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
