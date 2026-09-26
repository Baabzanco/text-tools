import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  Layers,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Clock,
  Archive,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  getAdminBlogPosts,
  getAdminBlogCategories,
  publishAdminBlogPost,
  archiveAdminBlogPost,
  duplicateAdminBlogPost,
  deleteAdminBlogPost,
  scheduleAdminBlogPost,
  BlogPost,
  BlogCategory
} from '../../lib/api/cms-client';

export const AdminBlogList: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Scheduling Modal
  const [schedulingPostId, setSchedulingPostId] = useState<string | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [schedulingSubmitting, setSchedulingSubmitting] = useState<boolean>(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminBlogPosts({
        page,
        limit: 10,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        search: searchQuery || undefined
      });
      setPosts(res.posts);
      setTotalPages(res.pagination.pages || 1);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminBlogCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm('Publish this post immediately to the public blog?')) return;
    try {
      await publishAdminBlogPost(id);
      fetchPosts();
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Archive this post? It will be removed from the public site.')) return;
    try {
      await archiveAdminBlogPost(id);
      fetchPosts();
    } catch (err: any) {
      alert(`Archiving failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateAdminBlogPost(id);
      navigate(`/admin/blog/edit/${copy.id}`);
    } catch (err: any) {
      alert(`Duplication failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminBlogPost(id);
      fetchPosts();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingPostId || !scheduledDateTime) return;
    setSchedulingSubmitting(true);
    try {
      await scheduleAdminBlogPost(schedulingPostId, scheduledDateTime);
      setSchedulingPostId(null);
      setScheduledDateTime('');
      fetchPosts();
    } catch (err: any) {
      alert(`Scheduling failed: ${err.message}`);
    } finally {
      setSchedulingSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="text-emerald-700 font-medium text-xs">Published</span>;
      case 'SCHEDULED':
        return <span className="text-blue-700 font-medium text-xs">Scheduled</span>;
      case 'ARCHIVED':
        return <span className="text-slate-500 font-medium text-xs">Archived</span>;
      case 'DRAFT':
      default:
        return <span className="text-amber-700 font-medium text-xs">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, publish, and manage long-form educational articles and developer guides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blog/categories"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Categories
          </Link>
          <Link
            to="/admin/blog/tags"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            Tags
          </Link>
          <Link
            to="/admin/blog/new"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs (Interactive Filter Controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
            {['', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === '' ? 'All Posts' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Search Input */}
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading blog posts from PostgreSQL...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">No blog posts found matching your criteria.</p>
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {post.featuredImage?.publicUrl ? (
                          <img
                            src={post.featuredImage.publicUrl}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <Link
                            to={`/admin/blog/edit/${post.id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                          >
                            {post.title}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">/blog/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">{statusBadge(post.status)}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                      {post.category ? post.category.name : <span className="text-slate-400">None</span>}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                      {post.author?.name || post.createdBy || 'Admin'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500">
                      <div>
                        {post.publishedAt
                          ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}`
                          : `Updated: ${new Date(post.updatedAt).toLocaleDateString()}`}
                      </div>
                      {post.scheduledAt && (
                        <div className="text-blue-600">
                          Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/blog/${post.slug}?previewToken=admin_preview_active`}
                          target="_blank"
                          rel="noreferrer"
                          title="Preview Post"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/blog/edit/${post.id}`}
                          title="Edit Post"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(post.id)}
                          title="Duplicate Post"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {post.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            title="Publish Immediately"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {post.status !== 'SCHEDULED' && post.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => {
                              setSchedulingPostId(post.id);
                              setScheduledDateTime('');
                            }}
                            title="Schedule Publication"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {post.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleArchive(post.id)}
                            title="Archive Post"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          title="Delete Post"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Database-side Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {posts.length} of {totalCount} posts
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Previous
            </button>
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {schedulingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Schedule Post Publication</h3>
            <p className="text-xs text-slate-500">
              Select a future timestamp when this post should automatically become publicly accessible.
            </p>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingPostId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {schedulingSubmitting ? 'Scheduling...' : 'Set Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
