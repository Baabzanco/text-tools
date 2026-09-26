import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ShieldCheck, Zap, Lock, Code, FileText, Search, Binary, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, TOOL_REGISTRY } from '../../lib/tools/registry';
import { updatePageMetadata, injectStructuredData } from '../../lib/seo/metadata';

export const HomePage: React.FC = () => {
  useEffect(() => {
    updatePageMetadata(
      {
        title: 'Text Tools – Free Online Text Utilities & Analyzer',
        description: 'Fast, privacy-friendly online text utility platform. Word counters, case converters, line cleaners, diff tools, and generators running locally in your browser.',
        keywords: ['text tools', 'word counter', 'character counter', 'case converter', 'text cleaner', 'private text utilities', 'find and replace']
      },
      '/'
    );
    injectStructuredData();
  }, []);

  const featuredTools = TOOL_REGISTRY.slice(0, 6);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wand2': return <Wand2 className="w-5 h-5 text-indigo-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'Code': return <Code className="w-5 h-5 text-indigo-600" />;
      case 'Search': return <Search className="w-5 h-5 text-indigo-600" />;
      case 'Binary': return <Binary className="w-5 h-5 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-600" />;
      default: return <Wand2 className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-12 pb-8 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>20 In-Browser Text Utilities · 100% Client-Side Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Free Online Text Tools for Writers, Developers & Marketers
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Count words, convert cases, clean duplicate lines, compare text diffs, and generate Lorem Ipsum text. Fast, private, lightweight, and completely free with no registration required.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tools/word-counter"
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Launch Word Counter</span>
            </Link>

            <Link
              to="/text-tools"
              className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All 20 Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Text Essentials Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Text Essentials</h2>
            <p className="text-xs text-slate-500">Popular utilities running locally in your browser.</p>
          </div>
          <Link
            to="/text-tools"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All 20 Utilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug}`}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                    {tool.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Architecture Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Designed for Every Text Workflow
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Browse our catalog organized into intuitive text utility categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const count = TOOL_REGISTRY.filter(t => t.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/text-tools?category=${cat.id}`}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {getCategoryIcon(cat.icon)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </h3>
                      {count > 0 && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {count} {count === 1 ? 'Tool' : 'Tools'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                  <span>Browse Category</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Privacy First Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Built on Privacy First Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Sensitive Content Stays in Your Browser
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Text processing runs completely client-side in your web browser. No text is ever transmitted to remote servers, saved to databases, or logged in analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zero Server Uploads</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Text transformations happen in JavaScript inside your browser tab or Web Worker thread.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instant Processing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No network delays or API rate limits. Thousands of lines are formatted instantly.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">100% Free & Unlimited</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No subscriptions, accounts, payment barriers, or usage restrictions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
