import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Cpu, Database, EyeOff } from 'lucide-react';
import { updatePageMetadata } from '../../lib/seo/metadata';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    updatePageMetadata(
      {
        title: 'Privacy Policy & Data Protection Guarantee – Text Tools',
        description: 'Read the Text Tools privacy first policy. Learn how all text processing executes 100% locally in your browser with zero server uploads.'
      },
      '/privacy'
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy First Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          100% Client-Side Privacy Guarantee
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          At Text Tools, we believe your text is your business. We engineered this platform so that your text content never leaves your computer or mobile device.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Zero Network Transmission</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you type or paste text into any tool on this platform, the transformation happens instantly in your browser's memory using JavaScript and Web Workers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Database Storage</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not operate a backend database for storing text. Your documents, code snippets, notes, or emails exist strictly within your browser tab session.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Content Analytics</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not track or inspect the words, topics, or content you process. You can process confidential legal briefs, API keys, or financial reports with complete peace of mind.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Web Worker Isolation</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Large text processing tasks are offloaded to background Web Worker threads in isolated sandbox threads, keeping your user interface fluid and responsive.
          </p>
        </div>
      </div>
    </div>
  );
};
