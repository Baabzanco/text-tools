import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Tag as TagIcon,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  getAdminBlogTags,
  createAdminBlogTag,
  updateAdminBlogTag,
  deleteAdminBlogTag,
  BlogTag
} from '../../lib/api/cms-client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export const AdminBlogTags: React.FC = () => {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await getAdminBlogTags();
      setTags(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEditClick = (t: BlogTag) => {
    setEditingId(t.id);
    setName(t.name);
    setSlug(t.slug);
    setDescription(t.description || '');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const cleanSlug = slug.trim() ? slugify(slug) : slugify(name);

    try {
      if (editingId) {
        await updateAdminBlogTag(editingId, {
          name,
          slug: cleanSlug,
          description: description || null
        });
        setSuccess('Tag updated successfully');
      } else {
        await createAdminBlogTag({
          name,
          slug: cleanSlug,
          description: description || null
        });
        setSuccess('Tag created successfully');
      }
      handleCancelEdit();
      fetchTags();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete tag "${name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await deleteAdminBlogTag(id);
      setSuccess('Tag deleted successfully');
      fetchTags();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blog"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Blog Tags</h1>
            <p className="text-xs text-slate-500">Cross-topic indexing keywords for articles.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tag Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            {editingId ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., TypeScript"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label>
              <input
                type="text"
                placeholder="typescript"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief tag scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Tag' : 'Create Tag'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Tags Grid / List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              All Tags ({tags.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No tags created yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tags.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <TagIcon className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-semibold text-sm text-slate-900">#{t.name}</span>
                      <span className="text-slate-400 text-xs font-mono ml-2">/blog/tag/{t.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
