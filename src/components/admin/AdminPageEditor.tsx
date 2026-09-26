import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Send,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  Globe,
  Check,
  History
} from 'lucide-react';
import {
  getAdminPage,
  saveAdminPageDraft,
  publishAdminPage,
  createAdminPage,
  Page,
  PageVersion,
  PageSection,
  SeoMetadata
} from '../../lib/api/cms-client';
import { RichTextEditor } from './RichTextEditor';

export const AdminPageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessSuccessMsg] = useState<string | null>(null);

  const [page, setPage] = useState<Partial<Page>>({
    title: '',
    slug: '',
    status: 'DRAFT'
  });

  const [sections, setSections] = useState<PageSection[]>([
    {
      id: `sec-${Date.now()}-1`,
      type: 'hero',
      data: {
        eyebrow: 'Section Eyebrow',
        title: 'Hero Heading Title',
        description: 'Descriptive subtitle or introduction for this page.'
      }
    }
  ]);

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

  const [changeSummary, setChangeSummary] = useState<string>('Updated section content and SEO metadata.');

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      getAdminPage(id)
        .then((res) => {
          setPage(res.page);
          if (res.latestVersion) {
            setSections(res.latestVersion.content?.sections || []);
            setSeo(res.latestVersion.seoMetadata || seo);
          }
          setLoading(false);
        })
        .catch((err) => {
          alert(err.message || 'Failed to load page');
          navigate('/admin/pages');
        });
    }
  }, [id, isNew, navigate]);

  const handleAddSection = (type: 'hero' | 'richText' | 'cta' | 'faq' | 'toolGrid') => {
    const newSec: PageSection = {
      id: `sec-${Date.now()}-${sections.length + 1}`,
      type,
      data:
        type === 'hero'
          ? { eyebrow: 'Badge', title: 'New Hero Title', description: 'Hero description...' }
          : type === 'richText'
          ? { heading: 'Section Heading', content: '<p>Enter text paragraph here...</p>' }
          : type === 'cta'
          ? { heading: 'Ready to format text?', subtitle: 'Try our 50 free utilities.', buttonText: 'Explore Tools', buttonUrl: '/text-tools' }
          : type === 'faq'
          ? { items: [{ question: 'Sample Question?', answer: 'Sample Answer.' }] }
          : { title: 'Featured Tools', description: 'Catalog preview', category: 'all' }
    };
    setSections([...sections, newSec]);
  };

  const handleRemoveSection = (secId: string) => {
    setSections(sections.filter((s) => s.id !== secId));
  };

  const handleUpdateSectionData = (secId: string, key: string, val: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === secId) {
          return { ...s, data: { ...s.data, [key]: val } };
        }
        return s;
      })
    );
  };

  const handleSaveDraft = async () => {
    if (!page.title || !page.slug) {
      alert('Title and Slug are required.');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const res = await createAdminPage({
          slug: page.slug,
          title: page.title,
          sections,
          seoMetadata: seo
        });
        setSuccessSuccessMsg('New draft page created successfully!');
        setTimeout(() => navigate(`/admin/pages/${res.page.id}`), 1000);
      } else if (id) {
        const res = await saveAdminPageDraft(id, {
          title: page.title,
          sections,
          seoMetadata: seo,
          changeSummary
        });
        setPage(res.page);
        setSuccessSuccessMsg(`Draft Version #${res.version.versionNumber} saved successfully! Currently published version remains unaffected.`);
        setTimeout(() => setSuccessSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isNew) {
      alert('Please save the initial draft first before publishing.');
      return;
    }
    if (!id) return;

    setSaving(true);
    try {
      // First save draft to make sure latest changes are in a version
      const draftRes = await saveAdminPageDraft(id, {
        title: page.title,
        sections,
        seoMetadata: seo,
        changeSummary: 'Published version update.'
      });

      // Publish the newly created version
      const pubRes = await publishAdminPage(id, draftRes.version.id);
      setPage(pubRes.page);
      setSuccessSuccessMsg(`Page Version #${draftRes.version.versionNumber} is now PUBLISHED LIVE on the public site!`);
      setTimeout(() => setSuccessSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to publish page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading page editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/pages"
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isNew ? 'Create New CMS Page' : `Edit Page: ${page.title}`}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Slug: /{page.slug || 'your-slug'} | Status: {page.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Link
                to={`/admin/pages/${id}/revisions`}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>Revisions</span>
              </Link>

              <a
                href={`/${page.slug === 'home' ? '' : page.slug}?previewToken=draft`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Draft</span>
              </a>
            </>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Page Core Metadata Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Page Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Page Title
            </label>
            <input
              type="text"
              required
              value={page.title || ''}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              placeholder="e.g. About Text Tools"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              URL Slug
            </label>
            <input
              type="text"
              required
              value={page.slug || ''}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              placeholder="e.g. about"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Structured Sections Builder */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Structured Content Sections</h2>
            <p className="text-xs text-slate-500">
              Build page layout using modular, versionable section components.
            </p>
          </div>

          {/* Add Section Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddSection('hero')}
              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Hero</span>
            </button>
            <button
              onClick={() => handleAddSection('richText')}
              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Rich Text</span>
            </button>
            <button
              onClick={() => handleAddSection('cta')}
              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ CTA Banner</span>
            </button>
            <button
              onClick={() => handleAddSection('toolGrid')}
              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tool Grid</span>
            </button>
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div key={sec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">
                  Section #{idx + 1} — [{sec.type.toUpperCase()}]
                </span>
                <button
                  onClick={() => handleRemoveSection(sec.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  title="Remove Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Fields based on section type */}
              {sec.type === 'hero' && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Eyebrow Badge</label>
                    <input
                      type="text"
                      value={sec.data.eyebrow || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'eyebrow', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={sec.data.title || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'title', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Description</label>
                    <textarea
                      value={sec.data.description || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'description', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg h-16"
                    />
                  </div>
                </div>
              )}

              {sec.type === 'richText' && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={sec.data.heading || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'heading', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Rich Text Content & Media</label>
                    <RichTextEditor
                      initialContent={sec.data.document || sec.data.content || ''}
                      onChange={(jsonDoc, htmlStr) => {
                        handleUpdateSectionData(sec.id, 'document', jsonDoc);
                        handleUpdateSectionData(sec.id, 'content', htmlStr);
                      }}
                      saveStatus={saving ? 'saving' : 'saved'}
                    />
                  </div>
                </div>
              )}

              {sec.type === 'cta' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Heading</label>
                    <input
                      type="text"
                      value={sec.data.heading || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'heading', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={sec.data.subtitle || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'subtitle', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={sec.data.buttonText || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'buttonText', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Button Target URL</label>
                    <input
                      type="text"
                      value={sec.data.buttonUrl || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'buttonUrl', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              {sec.type === 'toolGrid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Grid Title</label>
                    <input
                      type="text"
                      value={sec.data.title || ''}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'title', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Tool Category Filter</label>
                    <select
                      value={sec.data.category || 'all'}
                      onChange={(e) => handleUpdateSectionData(sec.id, 'category', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="all">All Tools</option>
                      <option value="text">Text Essentials</option>
                      <option value="developer">Developer Utilities</option>
                      <option value="seo">SEO & Content</option>
                      <option value="encoding">Encoding & Security</option>
                      <option value="writing">Writing & Analysis</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SEO Metadata Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>SEO & Social Share Metadata</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              SEO Page Title
            </label>
            <input
              type="text"
              value={seo.seoTitle || ''}
              onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
              placeholder="Recommended length: ~30-60 chars"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Canonical URL
            </label>
            <input
              type="text"
              value={seo.canonicalUrl || ''}
              onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
              placeholder="https://texttools.app/page"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Meta Description
            </label>
            <textarea
              value={seo.metaDescription || ''}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              placeholder="Recommended length: ~120-160 chars"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Change Summary Note (for Revision History)
          </label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Updated hero section headline and SEO description"
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>
    </div>
  );
};
