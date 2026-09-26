import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wand2, AlertCircle, ArrowRight, HelpCircle, ShieldCheck, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import { getPublicPage, Page, PageVersion, PageSection } from '../../lib/api/cms-client';
import { TOOL_REGISTRY } from '../../lib/tools/registry';
import { updatePageMetadata } from '../../lib/seo/metadata';
import { RichTextRenderer } from '../public/RichTextRenderer';

interface Props {
  fixedSlug?: string;
  previewToken?: string;
}

export const PublicCmsPage: React.FC<Props> = ({ fixedSlug, previewToken }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = fixedSlug || routeSlug || 'home';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<{ page: Page; version: PageVersion } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getPublicPage(slug, previewToken)
      .then((res) => {
        if (isMounted) {
          setPageData(res);
          setLoading(false);

          // Update SEO metadata
          if (res.version.seoMetadata) {
            updatePageMetadata(
              {
                title: res.version.seoMetadata.seoTitle || res.page.title,
                description: res.version.seoMetadata.metaDescription,
                keywords: []
              },
              res.version.seoMetadata.canonicalUrl || `/${slug}`
            );
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Page not found');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, previewToken]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading page content...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-600">
          The requested page <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600">/{slug}</code> could not be loaded from the CMS database.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { version } = pageData;
  const sections = version.content?.sections || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {previewToken && (
        <div className="bg-amber-500 text-white p-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <ShieldCheck className="w-4 h-4" />
          <span>CMS DRAFT PREVIEW MODE — Version #{version.versionNumber} (Not Publicly Published)</span>
        </div>
      )}

      {sections.map((section: PageSection) => {
        switch (section.type) {
          case 'hero':
            return (
              <div key={section.id} className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                {section.data.eyebrow && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full text-xs font-semibold">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{section.data.eyebrow}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {section.data.title}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                  {section.data.description}
                </p>
              </div>
            );

          case 'richText':
            return (
              <div key={section.id} className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4">
                {section.data.heading && (
                  <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {section.data.heading}
                  </h2>
                )}
                <RichTextRenderer content={section.data.document || section.data.content} />
              </div>
            );

          case 'cta':
            return (
              <div key={section.id} className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-4 text-center">
                <h2 className="text-2xl font-bold">{section.data.heading || 'Ready to format your text?'}</h2>
                <p className="text-slate-300 text-sm max-w-2xl mx-auto">{section.data.subtitle}</p>
                {section.data.buttonText && (
                  <Link
                    to={section.data.buttonUrl || '/text-tools'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    <span>{section.data.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );

          case 'toolGrid':
            const category = section.data.category || 'all';
            const filtered = category === 'all'
              ? TOOL_REGISTRY.slice(0, 12)
              : TOOL_REGISTRY.filter((t) => t.category === category).slice(0, 12);

            return (
              <div key={section.id} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">{section.data.title || 'Popular Text Tools'}</h2>
                  <p className="text-xs text-slate-500">{section.data.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tools/${tool.slug}`}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {tool.category}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {tool.shortDescription}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
