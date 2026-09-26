import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Wand2, ShieldCheck, FileText, Code, Binary, Sparkles, ArrowRight, Filter } from 'lucide-react';
import { TOOL_REGISTRY, CATEGORIES, searchTools } from '../../lib/tools/registry';
import { ToolCategory } from '../../types';
import { updatePageMetadata, injectStructuredData } from '../../lib/seo/metadata';

interface Props {
  defaultCategory?: ToolCategory | 'all';
}

export const ToolsDirectoryPage: React.FC<Props> = ({ defaultCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = defaultCategory || (searchParams.get('category') as ToolCategory) || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (selectedCategory === 'seo' || defaultCategory === 'seo') {
      updatePageMetadata(
        {
          title: 'Free SEO & Content Tools – Keyword Counters, Density & SERP Previews',
          description: '100% client-side free online SEO & content tools: Keyword counter, density analyzer, readability calculator, slug generator, and SERP checkers.',
          keywords: ['seo tools', 'keyword counter', 'keyword density checker', 'serp title checker', 'readability calculator']
        },
        '/seo-tools'
      );
    } else if (selectedCategory === 'developer' || defaultCategory === 'developer') {
      updatePageMetadata(
        {
          title: 'Free Online Developer Utilities – JSON, Encoders, Regex & Formatters',
          description: '100% client-side developer text utilities: JSON formatter, Base64 encoder/decoder, JWT decoder, Regex tester, and code formatters.',
          keywords: ['developer tools', 'json formatter', 'base64 encoder', 'jwt decoder', 'regex tester', 'sql formatter']
        },
        '/developer-tools'
      );
    } else {
      updatePageMetadata(
        {
          title: 'All Online Text Tools – Directory & Utilities Catalog',
          description: 'Browse all free online text utilities: word counters, case converters, JSON formatters, text cleaners, and Base64 encoders.',
          keywords: ['text tools directory', 'online text utilities', 'word counter', 'json formatter', 'case converter']
        },
        '/text-tools'
      );
    }
    injectStructuredData();
  }, [defaultCategory, selectedCategory]);

  // Update query params when category changes
  const handleCategoryChange = (cat: ToolCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const filteredTools = useMemo(() => {
    return searchTools(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full text-xs font-semibold">
          <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Text Utility Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Free Online Text Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Fast, private, client-side tools designed for writers, editors, engineers, and digital marketers. Every utility runs locally in your web browser.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text tools by name, keyword, or operation..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category Tabs (Segmented Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Categories ({TOOL_REGISTRY.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = TOOL_REGISTRY.filter((t) => t.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const isDemo = tool.isFoundationDemo;
          return (
            <div
              key={tool.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isDemo
                  ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Wand2 className="w-5 h-5" />
                  </div>

                  {isDemo ? (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-md">
                      Foundation Demo Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Phase 2 Blueprint
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>

                {/* Unboxed metadata discipline according to SKILL rules */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-2 border-t border-slate-100">
                  <span className="capitalize">{tool.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>100% In-Browser</span>
                  <span aria-hidden="true">·</span>
                  <span>Client Side</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to={`/tools/${tool.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Open Tool Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Wand2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No tools found matching your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Directory FAQ Architecture */}
      <section className="bg-slate-100/70 p-8 rounded-3xl border border-slate-200/80 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">Are these text tools completely free?</h3>
            <p className="text-slate-600">
              Yes. All utilities on Text Tools are 100% free with no limits, no mandatory signups, and no paywalls.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">Is my text private and secure?</h3>
            <p className="text-slate-600">
              Yes. Text processing runs locally in your web browser using client-side JavaScript and Web Worker threads. Your text is never uploaded to any remote server.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
