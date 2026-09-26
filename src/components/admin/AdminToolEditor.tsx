import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Globe,
  Plus,
  Trash2,
  Check,
  ShieldCheck
} from 'lucide-react';
import { getAdminTool, updateAdminTool, ToolContent, SeoMetadata } from '../../lib/api/cms-client';

export const AdminToolEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [tool, setTool] = useState<Partial<ToolContent>>({});
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([]);
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

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getAdminTool(slug)
        .then((data) => {
          setTool(data);
          setFaq(data.faq || []);
          setSeo(data.seoMetadata || seo);
          setLoading(false);
        })
        .catch((err) => {
          alert(err.message || 'Failed to load tool content');
          navigate('/admin/tools');
        });
    }
  }, [slug, navigate]);

  const handleAddFaq = () => {
    setFaq([...faq, { question: 'New Question?', answer: 'New Answer.' }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaq(faq.filter((_, i) => i !== idx));
  };

  const handleUpdateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faq];
    updated[idx][field] = val;
    setFaq(updated);
  };

  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);

    try {
      const res = await updateAdminTool(slug, {
        ...tool,
        faq,
        seoMetadata: seo
      });
      setTool(res);
      setSuccessMsg('Tool content and SEO metadata updated successfully in database!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update tool');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading tool editable content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tools"
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Edit Tool Content: {tool.toolName}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              /tools/{tool.slug} | Engine Processor ID: {tool.slug}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Engine Separation Verified:</strong> Editing metadata here changes public presentation content and SEO copy. Processing logic & Web Worker algorithms remain untouched.
        </span>
      </div>

      {/* Editable Tool Fields */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Tool Presentation Content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Tool Display Name
            </label>
            <input
              type="text"
              value={tool.toolName || ''}
              onChange={(e) => setTool({ ...tool, toolName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Category Label
            </label>
            <input
              type="text"
              value={tool.categoryLabel || ''}
              onChange={(e) => setTool({ ...tool, categoryLabel: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Short Description (Card Subtitle)
            </label>
            <input
              type="text"
              value={tool.shortDescription || ''}
              onChange={(e) => setTool({ ...tool, shortDescription: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Long Description (Tool Banner Body)
            </label>
            <textarea
              value={tool.longDescription || ''}
              onChange={(e) => setTool({ ...tool, longDescription: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20"
            />
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Frequently Asked Questions (FAQ)
          </h2>
          <button
            onClick={handleAddFaq}
            className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ Pair</span>
          </button>
        </div>

        <div className="space-y-3">
          {faq.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">FAQ Item #{idx + 1}</span>
                <button
                  onClick={() => handleRemoveFaq(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={item.question}
                onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                placeholder="Question..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
              />
              <textarea
                value={item.answer}
                onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                placeholder="Answer..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg h-16"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SEO Metadata Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>SEO & Search Metadata</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              SEO Title Tag
            </label>
            <input
              type="text"
              value={seo.seoTitle || ''}
              onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
