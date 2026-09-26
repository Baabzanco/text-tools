import React, { useState } from 'react';
import { ShieldAlert, Check, Copy, AlertCircle, Key, FileCode } from 'lucide-react';
import { jwtDecoderProcessor } from '../../lib/text/processors/developer';
import { copyToClipboard } from '../../lib/utils/clipboard';

export const JwtDecoderTool: React.FC = () => {
  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiZGV2ZWxvcGVyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const [jwtInput, setJwtInput] = useState<string>(sampleJwt);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const res = jwtDecoderProcessor(jwtInput);
  const meta = res.metadata || {};

  const handleCopySection = async (data: any, sectionName: string) => {
    const text = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    const ok = await copyToClipboard(text);
    if (ok.success) {
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Disclaimer:</strong> Decoding a JWT locally inspects its claims structure. It does <strong>NOT</strong> verify the cryptographic signature or authenticate users.
        </span>
      </div>

      {/* Input Area */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            Encoded JWT Token Input
          </span>
          <button
            onClick={() => setJwtInput('')}
            className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear Token
          </button>
        </div>
        <textarea
          value={jwtInput}
          onChange={(e) => setJwtInput(e.target.value)}
          placeholder="Paste encoded JSON Web Token (ey...)"
          className="w-full h-[100px] p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 break-all"
        />
      </div>

      {meta.error && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{meta.error}</span>
        </div>
      )}

      {/* Decoded Sections Grid */}
      {meta.valid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Header (Algorithm & Token Type)
              </span>
              <button
                onClick={() => handleCopySection(meta.header, 'header')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedSection === 'header' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'header' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
              {JSON.stringify(meta.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Payload (Claims & Data)
              </span>
              <button
                onClick={() => handleCopySection(meta.payload, 'payload')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedSection === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'payload' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
              {JSON.stringify(meta.payload, null, 2)}
            </pre>
          </div>

          {/* Signature */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Signature (Base64URL Encoded Data)
              </span>
              <button
                onClick={() => handleCopySection(meta.signature, 'signature')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedSection === 'signature' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'signature' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-800 break-all bg-white p-3 rounded-lg border border-slate-200">
              {meta.signature}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
