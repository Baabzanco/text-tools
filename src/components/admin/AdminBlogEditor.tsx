import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  History,
  Image as ImageIcon,
  X,
  Layers,
  Tag as TagIcon,
  Globe,
  Share2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import {
  getAdminBlogPost,
  createAdminBlogPost,
  updateAdminBlogPost,
  publishAdminBlogPost,
  scheduleAdminBlogPost,
  archiveAdminBlogPost,
  restoreAdminBlogPostRevision,
  getAdminBlogCategories,
  getAdminBlogTags,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPostRevision,
  SeoMetadata
} from '../../lib/api/cms-client';
import { RichTextEditor } from './RichTextEditor';
import { MediaPickerModal, MediaAssetItem } from './MediaPickerModal';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'failed'>('saved');
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [autoSlug, setAutoSlug] = useState<boolean>(isNew);
  const [excerpt, setExcerpt] = useState<string>('');
  const [content, setContent] = useState<any>({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  });
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'>('DRAFT');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<any | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>('');

  // SEO Metadata State
  const [seo, setSeo] = useState<SeoMetadata>({
    seoTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    schemaJson: ''
  });

  // Modal States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [isRevisionsModalOpen, setIsRevisionsModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [revisions, setRevisions] = useState<BlogPostRevision[]>([]);

  // Metadata Catalogs
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [allTags, setAllTags] = useState<BlogTag[]>([]);

  useEffect(() => {
    Promise.all([getAdminBlogCategories(), getAdminBlogTags()])
      .then(([cats, tags]) => {
        setCategories(cats);
        setAllTags(tags);
      })
      .catch(console.error);

    if (!isNew && id) {
      getAdminBlogPost(id)
        .then((res) => {
          const p = res.post;
          setTitle(p.title);
          setSlug(p.slug);
          setAutoSlug(false);
          setExcerpt(p.excerpt || '');
          setContent(p.content || { type: 'doc', content: [] });
          setStatus(p.status);
          setCategoryId(p.categoryId || '');
          setSelectedTagIds((p.tags || []).map((t) => t.id));
          setFeaturedImage(p.featuredImage || null);
          setScheduledAt(p.scheduledAt ? p.scheduledAt.substring(0, 16) : '');
          if (p.seoMetadata) {
            setSeo({
              seoTitle: p.seoMetadata.seoTitle || p.title,
              metaDescription: p.seoMetadata.metaDescription || p.excerpt || '',
              canonicalUrl: p.seoMetadata.canonicalUrl || `/blog/${p.slug}`,
              robotsIndex: p.seoMetadata.robotsIndex !== false,
              robotsFollow: p.seoMetadata.robotsFollow !== false,
              ogTitle: p.seoMetadata.ogTitle || p.title,
              ogDescription: p.seoMetadata.ogDescription || p.excerpt || '',
              ogImage: p.seoMetadata.ogImage || (p.featuredImage?.publicUrl || ''),
              twitterTitle: p.seoMetadata.twitterTitle || p.title,
              twitterDescription: p.seoMetadata.twitterDescription || p.excerpt || '',
              twitterImage: p.seoMetadata.twitterImage || (p.featuredImage?.publicUrl || ''),
              schemaJson: p.seoMetadata.schemaJson || ''
            });
          }
          setRevisions(res.revisions || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load post');
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSaveStatus('unsaved');
    if (autoSlug) {
      setSlug(generateSlug(val));
    }
  };

  const handleEditorChange = (newJson: any) => {
    setContent(newJson);
    setSaveStatus('unsaved');
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('Article title is required.');
      return;
    }
    const cleanSlug = slug.trim() || generateSlug(title);
    setSaving(true);
    setSaveStatus('saving');
    setError(null);

    const payload = {
      title,
      slug: cleanSlug,
      excerpt,
      content,
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
      featuredImageId: featuredImage ? featuredImage.id : null,
      seoMetadata: {
        ...seo,
        seoTitle: seo.seoTitle || title,
        metaDescription: seo.metaDescription || excerpt,
        canonicalUrl: seo.canonicalUrl || `/blog/${cleanSlug}`
      }
    };

    try {
      if (isNew) {
        const created = await createAdminBlogPost(payload as any);
        setSaveStatus('saved');
        navigate(`/admin/blog/edit/${created.id}`);
      } else if (id) {
        const updated = await updateAdminBlogPost(id, payload as any);
        setSaveStatus('saved');
        // Refresh revisions
        getAdminBlogPost(id).then((res) => setRevisions(res.revisions));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
      setSaveStatus('failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isNew) {
      alert('Please save the article draft first before publishing.');
      return;
    }
    if (!id) return;
    setSaving(true);
    try {
      // First save any unsaved working draft changes
      await updateAdminBlogPost(id, {
        title,
        slug,
        excerpt,
        content,
        categoryId: categoryId || null,
        tagIds: selectedTagIds,
        featuredImageId: featuredImage ? featuredImage.id : null,
        seoMetadata: seo
      });
      // Then explicitly publish (creating the published snapshot)
      const res = await publishAdminBlogPost(id);
      setStatus(res.status);
      setSaveStatus('saved');
      getAdminBlogPost(id).then((r) => setRevisions(r.revisions));
      alert('Article has been published successfully to the public blog!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !scheduledAt) return;
    setSaving(true);
    try {
      await scheduleAdminBlogPost(id, scheduledAt);
      setStatus('SCHEDULED');
      setIsScheduleModalOpen(false);
      getAdminBlogPost(id).then((r) => setRevisions(r.revisions));
      alert(`Article scheduled for ${new Date(scheduledAt).toLocaleString()}`);
    } catch (err: any) {
      alert(`Scheduling failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    if (!window.confirm('Archive this article? It will no longer be visible on the public site.')) return;
    setSaving(true);
    try {
      const res = await archiveAdminBlogPost(id);
      setStatus(res.status);
      getAdminBlogPost(id).then((r) => setRevisions(r.revisions));
    } catch (err: any) {
      alert(`Archiving failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreRevision = async (revId: string) => {
    if (!id) return;
    if (!window.confirm('Restore this revision? A new revision will be created with its contents.')) return;
    try {
      await restoreAdminBlogPostRevision(id, revId);
      // Reload full post
      const res = await getAdminBlogPost(id);
      setTitle(res.post.title);
      setExcerpt(res.post.excerpt || '');
      setContent(res.post.content);
      if (res.post.seoMetadata) setSeo(res.post.seoMetadata);
      setRevisions(res.revisions);
      setIsRevisionsModalOpen(false);
      alert('Revision restored successfully to working editor draft.');
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
    setSaveStatus('unsaved');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading article editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blog"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isNew ? 'New Blog Post' : `Edit: ${title || 'Untitled Post'}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Status: <strong className="text-slate-700">{status}</strong></span>
              <span>·</span>
              <span className={saveStatus === 'saved' ? 'text-emerald-600' : 'text-amber-600'}>
                {saveStatus === 'saved' ? 'All changes saved' : 'Unsaved changes'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button
                type="button"
                onClick={() => setIsRevisionsModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <History className="w-4 h-4 text-slate-500" />
                History ({revisions.length})
              </button>
              <Link
                to={`/blog/${slug}?previewToken=admin_preview_active`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                Preview
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {!isNew && status !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Publish
            </button>
          )}

          {!isNew && status === 'PUBLISHED' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Update Published
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns (Editor + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title, Slug, Rich Text Editor, Excerpt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., How to Clean and Normalize String Data in JavaScript"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">URL Slug</label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(!autoSlug);
                    if (!autoSlug) setSlug(generateSlug(title));
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {autoSlug ? 'Auto-generating from title (click to edit manually)' : 'Manual slug (click to auto-sync)'}
                </button>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-600">
                <span>/blog/</span>
                <input
                  type="text"
                  disabled={autoSlug}
                  value={slug}
                  onChange={(e) => {
                    setSlug(generateSlug(e.target.value));
                    setSaveStatus('unsaved');
                  }}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-slate-900 ml-1 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Excerpt / Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview summarizing what the reader will learn."
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setSaveStatus('unsaved');
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Real Tiptap Blog Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Article Content (Tiptap Document)</h2>
              <span className="text-[11px] text-slate-500">
                JSON persistence · Media library integration · No Base64
              </span>
            </div>
            <RichTextEditor
              initialContent={content}
              onChange={handleEditorChange}
              saveStatus={saveStatus}
              placeholder="Write rich, informative article content here..."
            />
          </div>

          {/* Full SEO Management & Previews */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Search Engine Optimization (SEO)</h2>
              </div>
              <span className="text-xs text-slate-500">Article & Social Metadata</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  placeholder={title || 'Custom search engine title'}
                  value={seo.seoTitle}
                  onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Estimated length: ~50–60 characters (actual display width varies by pixel length).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Canonical URL</label>
                <input
                  type="text"
                  placeholder={`https://texttools.app/blog/${slug}`}
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder={excerpt || 'Search engine snippet summary'}
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Estimated length: ~150–160 characters (search engines truncate depending on device).
                </span>
              </div>
            </div>

            {/* Google Search Result Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Google Search Result Preview
              </span>
              <div className="text-blue-700 text-base font-medium hover:underline cursor-pointer truncate">
                {seo.seoTitle || title || 'Article Title'} – Text Tools
              </div>
              <div className="text-emerald-700 text-xs font-mono truncate">
                https://texttools.app/blog/{slug || 'post-slug'}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2">
                {seo.metaDescription || excerpt || 'Detailed educational text processing article on texttools.app.'}
              </div>
            </div>

            {/* Social Card Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                OpenGraph / Twitter Social Card Preview
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-w-sm">
                {(seo.ogImage || featuredImage?.publicUrl) ? (
                  <img
                    src={seo.ogImage || featuredImage?.publicUrl}
                    alt=""
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    No Social Image
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">texttools.app</div>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {seo.ogTitle || seo.seoTitle || title || 'Article Title'}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {seo.ogDescription || seo.metaDescription || excerpt || 'Read this article on Text Tools.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Publishing Controls, Category, Tags, Featured Image */}
        <div className="space-y-6">
          {/* Status & Actions Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Publishing Controls</h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Current Status:</span>
              <span className="font-bold text-slate-900">{status}</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {!isNew && status !== 'SCHEDULED' && status !== 'PUBLISHED' && (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Schedule Publication
                </button>
              )}

              {!isNew && status === 'PUBLISHED' && (
                <button
                  type="button"
                  onClick={handleArchive}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive Post
                </button>
              )}
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Featured Image</h3>
            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                  <img
                    src={featuredImage.publicUrl}
                    alt={featuredImage.altText || ''}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(null);
                      setSaveStatus('unsaved');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Replace Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="w-full py-8 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-semibold">Select Featured Image</span>
              </button>
            )}
          </div>

          {/* Category Selector (Hierarchy Indentation) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h3>
              <Link to="/admin/blog/categories" className="text-[11px] text-indigo-600 hover:underline">
                Manage
              </Link>
            </div>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSaveStatus('unsaved');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            >
              <option value="">None (Uncategorized)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `— ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tags</h3>
              <Link to="/admin/blog/tags" className="text-[11px] text-indigo-600 hover:underline">
                Manage
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal for Featured Image */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectAsset={(asset: MediaAssetItem) => {
          setFeaturedImage(asset);
          setSaveStatus('unsaved');
          setIsMediaModalOpen(false);
        }}
      />

      {/* Revision History Modal */}
      {isRevisionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Revision History</h3>
              <button
                onClick={() => setIsRevisionsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Revisions are immutable. Restoring a revision creates a new revision and restores the working draft without immediately overwriting the public version.
            </p>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2 pr-1">
              {revisions.map((rev) => (
                <div key={rev.id} className="pt-2 pb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      Version {rev.versionNumber} – {rev.changeSummary || 'Saved edit'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      By {rev.createdBy || 'Admin'} on {new Date(rev.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestoreRevision(rev.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Schedule Post</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publication Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
