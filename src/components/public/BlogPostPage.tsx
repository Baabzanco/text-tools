import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Tag as TagIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getPublicBlogPost, BlogPost } from '../../lib/api/cms-client';
import { RichTextRenderer } from './RichTextRenderer';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('previewToken') || undefined;
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [articleJsonLd, setArticleJsonLd] = useState<any | null>(null);
  const [breadcrumbJsonLd, setBreadcrumbJsonLd] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    getPublicBlogPost(slug, previewToken)
      .then((res) => {
        if (res.redirect) {
          navigate(res.redirect.toPath, { replace: true });
          return;
        }
        setPost(res.post);
        setRelatedPosts(res.relatedPosts || []);
        setIsPreview(res.isPreview || false);
        setArticleJsonLd(res.articleJsonLd || null);
        setBreadcrumbJsonLd(res.breadcrumbJsonLd || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Article not found');
        setLoading(false);
      });
  }, [slug, previewToken, navigate]);

  // Dynamic OpenGraph, Twitter, and canonical metadata sync
  useEffect(() => {
    if (!post) return;
    const meta = post.seoMetadata || {};
    const pageTitle = meta.seoTitle || post.title;
    document.title = `${pageTitle} – Text Tools`;

    // Robots index / noindex
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    if (isPreview || meta.robotsIndex === false) {
      robotsTag.setAttribute('content', 'noindex, nofollow');
    } else {
      robotsTag.setAttribute('content', 'index, follow');
    }

    return () => {
      document.title = 'Text Tools – Online Text Utilities & Platform';
      robotsTag?.setAttribute('content', 'index, follow');
    };
  }, [post, isPreview]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-sm">Loading article...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
        <p className="text-sm text-slate-600">
          The requested post does not exist or may be an unpublished draft.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  // Calculate read time
  const wordCount = (typeof post.content === 'string' ? post.content : JSON.stringify(post.content || {})).split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Article Schema.org Structured Data */}
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      {/* Secure Preview Mode Warning Banner */}
      {isPreview && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Preview Mode Active:</strong> You are viewing an unpublished draft. Search engine indexing is disabled (<code>noindex</code>).
            </span>
          </div>
          <Link
            to={`/admin/blog/edit/${post.id}`}
            className="font-semibold text-indigo-700 hover:underline shrink-0"
          >
            Edit in Admin
          </Link>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/blog" className="hover:text-slate-900 transition-colors">
          Blog
        </Link>
        {post.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="hover:text-slate-900 transition-colors"
            >
              {post.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-medium truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Header Section */}
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Clean unboxed metadata with separators (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 border-b border-slate-200 pb-4">
          <span className="font-semibold text-slate-900">
            {post.author?.name || post.createdBy || 'Editorial Team'}
          </span>
          <span aria-hidden="true">·</span>
          <span>Published on {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span aria-hidden="true">·</span>
          <span>{readTime}</span>
          {post.category && (
            <>
              <span aria-hidden="true">·</span>
              <Link
                to={`/blog/category/${post.category.slug}`}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage?.publicUrl && (
        <figure className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
          <img
            src={post.featuredImage.publicUrl}
            alt={post.featuredImage.altText || post.title}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[500px] object-cover"
          />
          {post.featuredImage.caption && (
            <figcaption className="text-center text-xs text-slate-500 py-2 bg-slate-50 border-t border-slate-100">
              {post.featuredImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Tiptap Article Content rendered via existing RichTextRenderer */}
      <div className="py-2">
        <RichTextRenderer content={post.content} className="prose-lg" />
      </div>

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Tags</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/blog/tag/${tag.slug}`}
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts Section (Shared Category OR Shared Tags) */}
      {relatedPosts.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
              >
                {rel.featuredImage?.publicUrl && (
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={rel.featuredImage.publicUrl}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <span className="text-[11px] text-slate-500">
                    {rel.category ? rel.category.name : 'Article'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
