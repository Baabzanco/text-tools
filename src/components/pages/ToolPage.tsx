import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wand2, ShieldCheck, ArrowLeft, ArrowRight, HelpCircle, AlertCircle, FileText, Sparkles, Code } from 'lucide-react';
import { getToolBySlug, getRelatedTools } from '../../lib/tools/registry';
import { TextWorkspace } from '../workspace/TextWorkspace';
import { FindAndReplaceTool } from '../tools/FindAndReplaceTool';
import { TextCompareTool } from '../tools/TextCompareTool';
import { TextSplitterTool } from '../tools/TextSplitterTool';
import { TextMergerTool } from '../tools/TextMergerTool';
import { ReadingTimeTool } from '../tools/ReadingTimeTool';
import { GeneratorsTool } from '../tools/GeneratorsTool';
import { StatisticsTool } from '../tools/StatisticsTool';
import { JsonTools } from '../tools/JsonTools';
import { CodeFormatterTool } from '../tools/CodeFormatterTool';
import { MarkdownToHtmlTool } from '../tools/MarkdownToHtmlTool';
import { RegexTesterTool } from '../tools/RegexTesterTool';
import { JwtDecoderTool } from '../tools/JwtDecoderTool';
import { TimestampConverterTool } from '../tools/TimestampConverterTool';
import { HashGeneratorTool } from '../tools/HashGeneratorTool';
import { EscapeUnescapeTool } from '../tools/EscapeUnescapeTool';
import { SEOTools } from '../tools/SEOTools';
import { updatePageMetadata, injectStructuredData } from '../../lib/seo/metadata';

export const ToolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;
  const relatedTools = slug ? getRelatedTools(slug) : [];

  useEffect(() => {
    if (tool) {
      updatePageMetadata(
        {
          title: tool.seo.title,
          description: tool.seo.description,
          keywords: tool.seo.keywords || tool.keywords
        },
        `/tools/${tool.slug}`
      );
      injectStructuredData(tool);
    } else {
      updatePageMetadata(
        {
          title: 'Tool Not Found – Text Tools',
          description: 'The requested developer or text tool could not be found in our directory.'
        },
        '/tools/not-found'
      );
    }
  }, [tool, slug]);

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Tool Not Found
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          We couldn't find a tool matching <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600">{slug}</code>.
        </p>
        <div className="pt-2">
          <Link
            to="/text-tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Tools</span>
          </Link>
        </div>
      </div>
    );
  }

  const getWorkspaceOptions = () => {
    if (tool.slug === 'unicode-converter') {
      return {
        modes: [
          { id: 'encode', label: 'Encode to \\uXXXX' },
          { id: 'decode', label: 'Decode \\uXXXX' }
        ],
        defaultMode: 'encode'
      };
    }
    if (tool.slug === 'reverse-text') {
      return {
        modes: [
          { id: 'entire', label: 'Reverse Entire Text' },
          { id: 'perLine', label: 'Reverse Each Line' },
          { id: 'wordOrder', label: 'Reverse Word Order' }
        ],
        defaultMode: 'entire'
      };
    }
    if (tool.slug === 'sort-lines') {
      return {
        modes: [
          { id: 'asc', label: 'Sort A → Z' },
          { id: 'desc', label: 'Sort Z → A' }
        ],
        defaultMode: 'asc'
      };
    }
    return undefined;
  };

  const renderToolComponent = () => {
    switch (tool.slug) {
      // JSON Tools
      case 'json-formatter':
        return <JsonTools toolMode="formatter" />;
      case 'json-validator':
        return <JsonTools toolMode="validator" />;
      case 'json-minifier':
        return <JsonTools toolMode="minifier" />;

      // Code / Formatters
      case 'html-formatter':
        return <CodeFormatterTool language="html" />;
      case 'css-formatter':
        return <CodeFormatterTool language="css" />;
      case 'javascript-formatter':
        return <CodeFormatterTool language="js" />;
      case 'sql-formatter':
        return <CodeFormatterTool language="sql" />;
      case 'markdown-to-html':
        return <MarkdownToHtmlTool />;

      // Developer Tools
      case 'regex-tester':
        return <RegexTesterTool />;
      case 'jwt-decoder':
        return <JwtDecoderTool />;
      case 'timestamp-converter':
        return <TimestampConverterTool />;
      case 'hash-generator':
        return <HashGeneratorTool />;
      case 'escape-unescape':
        return <EscapeUnescapeTool />;

      // Statistics & Text Essentials
      case 'word-counter':
      case 'character-counter':
      case 'text-statistics':
        return <StatisticsTool />;
      case 'reading-time-calculator':
        return <ReadingTimeTool />;
      case 'find-and-replace':
        return <FindAndReplaceTool />;
      case 'text-compare':
        return <TextCompareTool />;
      case 'text-splitter':
        return <TextSplitterTool />;
      case 'text-merger':
        return <TextMergerTool />;
      case 'lorem-ipsum-generator':
        return <GeneratorsTool type="lorem" />;
      case 'random-text-generator':
        return <GeneratorsTool type="random" />;

      // SEO & Content Tools
      case 'keyword-counter':
        return <SEOTools toolMode="keyword-counter" />;
      case 'keyword-density-checker':
        return <SEOTools toolMode="keyword-density" />;
      case 'word-frequency-counter':
        return <SEOTools toolMode="word-frequency" />;
      case 'slug-generator':
        return <SEOTools toolMode="slug-generator" />;
      case 'text-readability-calculator':
        return <SEOTools toolMode="readability" />;
      case 'meta-title-checker':
        return <SEOTools toolMode="meta-title" />;
      case 'meta-description-checker':
        return <SEOTools toolMode="meta-description" />;
      case 'heading-analyzer':
        return <SEOTools toolMode="heading-analyzer" />;
      case 'keyword-extractor':
        return <SEOTools toolMode="keyword-extractor" />;

      default:
        return (
          <TextWorkspace
            processorId={tool.processorId}
            placeholder={`Enter or paste your text to process with ${tool.title}...`}
            optionsConfig={getWorkspaceOptions()}
            toolSlug={tool.slug}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/text-tools" className="hover:text-slate-900 transition-colors">
          All Tools
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{tool.title}</span>
      </nav>

      {/* Tool Header & Metadata Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {tool.category} Utility
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {tool.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Executed</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {tool.description}
        </p>
      </div>

      {/* Core Tool Interface */}
      <section className="space-y-4">
        <h2 className="sr-only">Interactive {tool.title} Interface</h2>
        {renderToolComponent()}
      </section>

      {/* Tool FAQ Section */}
      {tool.faq && tool.faq.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.faq.map((item, idx) => (
              <div key={idx} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools Section */}
      {relatedTools.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedTools.map((rel) => (
              <Link
                key={rel.id}
                to={`/tools/${rel.slug}`}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {rel.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
