import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  getAdminBlogCategories,
  createAdminBlogCategory,
  updateAdminBlogCategory,
  deleteAdminBlogCategory,
  BlogCategory
} from '../../lib/api/cms-client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export const AdminBlogCategories: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAdminBlogCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
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
        await updateAdminBlogCategory(editingId, {
          name,
          slug: cleanSlug,
          description: description || null,
          parentId: parentId || null
        });
        setSuccess('Category updated successfully');
      } else {
        await createAdminBlogCategory({
          name,
          slug: cleanSlug,
          description: description || null,
          parentId: parentId || null
        });
        setSuccess('Category created successfully');
      }
      handleCancelEdit();
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? If it contains posts or child categories, deletion will be blocked.`)) return;
    setError(null);
    setSuccess(null);
    try {
      await deleteAdminBlogCategory(id);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  // Group root and children
  const rootCategories = categories.filter((c) => !c.parentId);

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
            <h1 className="text-xl font-bold text-slate-900">Blog Categories</h1>
            <p className="text-xs text-slate-500">Organize articles hierarchically with parent and child categories.</p>
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
        {/* Left Column: Category Creation / Edit Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Natural Language Processing"
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
                placeholder="natural-language-processing"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Category (Hierarchy)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              >
                <option value="">None (Top-Level Root Category)</option>
                {rootCategories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief category scope..."
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
                {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
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

        {/* Right Column: Category Hierarchy List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Category Hierarchy Tree ({categories.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No categories created yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rootCategories.map((root) => {
                const children = categories.filter((c) => c.parentId === root.id);
                return (
                  <div key={root.id} className="p-4 space-y-2">
                    {/* Root Category Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-sm text-slate-900">{root.name}</span>
                        <span className="text-xs text-slate-400 font-mono">/blog/category/{root.slug}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(root)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(root.id, root.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Child Categories */}
                    {children.length > 0 && (
                      <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 ml-2">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2 text-slate-700">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold">{child.name}</span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                /blog/category/{child.slug}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditClick(child)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(child.id, child.name)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
