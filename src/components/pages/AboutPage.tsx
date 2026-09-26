import React, { useEffect } from 'react';
import { Wand2, Cpu, Shield, Zap } from 'lucide-react';
import { updatePageMetadata } from '../../lib/seo/metadata';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    updatePageMetadata(
      {
        title: 'About Text Tools – Architecture & Mission',
        description: 'Learn about the Text Tools platform architecture, client-side processing engine, and mission.'
      },
      '/about'
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full text-xs font-semibold">
          <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>About Text Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          High-Performance, In-Browser Utilities
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Text Tools was created to provide a fast, privacy-first alternative to ad-bloated, slow online text converters that upload your data to remote servers.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Technical Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Web Worker Offloading</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Computations for large text files are automatically dispatched to dedicated Web Worker threads to keep your browser tab smooth and lag-free.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Multilingual Unicode Engine</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Accurate character segmentation and word counting for non-English scripts, emojis, and surrogate pair characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
