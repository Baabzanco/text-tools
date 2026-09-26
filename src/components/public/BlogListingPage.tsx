import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, Loader2, ChevronRight, Tag as TagIcon, Layers } from 'lucide-react';
import {
  getPublicBlogPosts,
  getPublicBlogCategories,
  getPublicBlogCategory,
  getPublicBlogTag,
  BlogPost,
  BlogCategory,
  BlogTag
} from '../../lib/api/cms-client';

export const BlogListingPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isCategoryRoute = location.pathname.startsWith('/blog/category/');
  const isTagRoute = location.pathname.startsWith('/blog/tag/');

  const activeCategory = isCategoryRoute ? (slug || '') : (searchParams.get('category') || '');
  const activeTag = isTagRoute ? (slug || '') : (searchParams.get('tag') || '');
  const currentPage = Number(searchParams.get('page')) || 1;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<BlogCategory | null>(null);
  const [tagInfo, setTagInfo] = useState<BlogTag | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    getPublicBlogCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch category or tag metadata if on specialized route
  useEffect(() => {
    if (isCategoryRoute && slug) {
      getPublicBlogCategory(slug)
        .then(setCategoryInfo)
        .catch(() => setCategoryInfo(null));
    } else {
      setCategoryInfo(null);
    }

    if (isTagRoute && slug) {
      getPublicBlogTag(slug)
        .then(setTagInfo)
        .catch(() => setTagInfo(null));
    } else {
      setTagInfo(null);
    }
  }, [isCategoryRoute, isTagRoute, slug]);

  // Dynamic SEO title & description
  useEffect(() => {
    let title = 'Text Processing & Engineering Blog – Text Tools';
    let description = 'Guides, performance benchmarks, and deep-dives into client-side text processing, regular expressions, typography, and formatting automation.';

    if (categoryInfo) {
      title = `${categoryInfo.seoMetadata?.seoTitle || categoryInfo.name} – Blog – Text Tools`;
      description = categoryInfo.seoMetadata?.metaDescription || categoryInfo.description || description;
    } else if (tagInfo) {
      title = `Tag: ${tagInfo.seoMetadata?.seoTitle || tagInfo.name} – Blog – Text Tools`;
      description = tagInfo.seoMetadata?.metaDescription || tagInfo.description || description;
    }

    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    return () => {
      document.title = 'Text Tools – Online Text Utilities & Platform';
    };
  }, [categoryInfo, tagInfo]);

  useEffect(() => {
    setLoading(true);
    getPublicBlogPosts({
      page: currentPage,
      limit: 9,
      categorySlug: activeCategory || undefined,
      tagSlug: activeTag || undefined
    })
      .then((res) => {
        setPosts(res.posts);
        setTotalPages(res.pagination.pages || 1);
        setTotalCount(res.pagination.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog posts', err);
        setLoading(false);
      });
  }, [activeCategory, activeTag, currentPage]);

  const setCategoryFilter = (catSlug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catSlug) {
      nextParams.set('category', catSlug);
    } else {
      nextParams.delete('category');
    }
    nextParams.delete('tag');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const setPage = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate reading time estimate
  const getReadTime = (content: any): string => {
    const text = typeof content === 'string' ? content : JSON.stringify(content || {});
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  // Structured Data for Blog Listing
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: categoryInfo?.name ? `${categoryInfo.name} - Text Tools Blog` : 'Text Tools Editorial & Developer Blog',
    description: categoryInfo?.description || 'In-depth engineering tutorials, text manipulation strategies, and developer utilities.',
    url: `https://texttools.app${location.pathname}`
  };

  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://texttools.app/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://texttools.app/blog'
      },
      ...(isCategoryRoute && categoryInfo
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: categoryInfo.name,
              item: `https://texttools.app/blog/category/${categoryInfo.slug}`
            }
          ]
        : []),
      ...(isTagRoute && tagInfo
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: `Tag: ${tagInfo.name}`,
              item: `https://texttools.app/blog/tag/${tagInfo.slug}`
            }
          ]
        : [])
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />

      {/* Breadcrumb Navigation */}
      {(isCategoryRoute || isTagRoute) && (
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {isCategoryRoute && (
            <span className="font-semibold text-slate-800">
              {categoryInfo ? categoryInfo.name : slug}
            </span>
          )}
          {isTagRoute && (
            <span className="font-semibold text-slate-800">
              #{tagInfo ? tagInfo.name : slug}
            </span>
          )}
        </nav>
      )}

      {/* Hero / Header */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {categoryInfo ? (
            <span className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-600 inline-block shrink-0" />
              Category: {categoryInfo.name}
            </span>
          ) : tagInfo ? (
            <span className="flex items-center gap-3">
              <TagIcon className="w-8 h-8 text-indigo-600 inline-block shrink-0" />
              Topic: #{tagInfo.name}
            </span>
          ) : (
            'Text Processing & Engineering Blog'
          )}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {categoryInfo?.description ||
            tagInfo?.description ||
            'Guides, performance benchmarks, and deep-dives into client-side text processing, regular expressions, typography, and formatting automation.'}
        </p>
      </div>

      {/* Interactive Category Filter Controls */}
      {!isCategoryRoute && !isTagRoute && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3.5 py-2 font-medium rounded-xl transition-colors whitespace-nowrap ${
              activeCategory === '' && activeTag === ''
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.slug)}
              className={`px-3.5 py-2 font-medium rounded-xl transition-colors whitespace-nowrap ${
                activeCategory === cat.slug
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-sm">Loading articles...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No articles found</h3>
          <p className="text-xs text-slate-500">
            {activeCategory || activeTag
              ? 'No published articles in this category or tag yet. Check back soon.'
              : 'Our editorial team is preparing comprehensive guides. Stay tuned.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
            >
              {/* Featured Image */}
              <Link to={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-slate-100">
                {post.featuredImage?.publicUrl ? (
                  <img
                    src={post.featuredImage.publicUrl}
                    alt={post.featuredImage.altText || post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/40 text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </Link>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Clean unboxed metadata with bullet separators (Zero-Pill Rule) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {post.category && (
                      <>
                        <Link
                          to={`/blog/category/${post.category.slug}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {post.category.name}
                        </Link>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getReadTime(post.content)}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {post.author?.name || post.createdBy || 'Editorial Team'}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Database Pagination Bar */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {posts.length} of {totalCount} articles
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-900 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
