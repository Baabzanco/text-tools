import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  Wand2,
  ArrowRight,
  RefreshCw,
  Layers,
  BookOpen,
  Image as ImageIcon,
  Plus,
  Tag
} from 'lucide-react';
import { getDashboardStats } from '../../lib/api/cms-client';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = () => {
    setLoading(true);
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading database statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CMS Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real database-backed status for Blog CMS, Media Library, Pages, and 50 Tools.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/blog/new"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Blog Post</span>
          </Link>
          <button
            onClick={fetchStats}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Blog Posts Metric */}
        <Link
          to="/admin/blog"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition-colors group block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              Blog Posts
            </span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalBlogPosts || 0}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats?.publishedBlogPosts || 0} Published</span>
            <span>{stats?.draftBlogPosts || 0} Drafts</span>
          </div>
        </Link>

        {/* Media Assets Metric */}
        <Link
          to="/admin/media"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition-colors group block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              Media Assets
            </span>
            <ImageIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalMediaAssets || 0}</div>
          <span className="text-[11px] text-slate-400 block">Uploaded & managed media</span>
        </Link>

        {/* Total CMS Pages */}
        <Link
          to="/admin/pages"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition-colors group block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              Total CMS Pages
            </span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalPages || 0}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats?.publishedPages || 0} Live</span>
            <span>{stats?.draftPages || 0} Drafts</span>
          </div>
        </Link>

        {/* Active Tools */}
        <Link
          to="/admin/tools"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition-colors group block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              Active Tools
            </span>
            <Wand2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalTools || 50}</div>
          <span className="text-[11px] text-slate-400 block">Editable metadata models</span>
        </Link>
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (Blog & Page revisions) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Blog Posts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Recent Blog Posts</span>
              </h2>
              <Link to="/admin/blog" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All Posts →
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentBlogPosts && stats.recentBlogPosts.length > 0 ? (
                stats.recentBlogPosts.map((post: any) => (
                  <Link
                    key={post.id}
                    to={`/admin/blog/edit/${post.id}`}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors group block"
                  >
                    <div className="space-y-1 truncate pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {post.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : post.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">/blog/{post.slug}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-slate-400">No blog posts created yet.</p>
                  <Link
                    to="/admin/blog/new"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create your first post</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Page Revisions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Recent Page Revisions</span>
              </h2>
              <Link to="/admin/pages" className="text-xs text-indigo-600 font-semibold hover:underline">
                Manage Pages →
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentRevisions && stats.recentRevisions.length > 0 ? (
                stats.recentRevisions.map((rev: any) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {rev.pageTitle} <code className="text-indigo-600 font-mono text-[11px]">v{rev.versionNumber}</code>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{rev.changeSummary}</p>
                    <span className="text-[10px] text-slate-400 block">By: {rev.createdBy}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No revisions recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Quick Actions
          </h2>

          <div className="space-y-2.5">
            <Link
              to="/admin/blog/new"
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
            >
              <span>+ Create Blog Post</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/blog"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Manage Blog Posts</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/media"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Media Library</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/blog/categories"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Blog Categories & Tags</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/pages/new"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>+ Create New Page</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/pages"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Manage Pages & Revisions</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/tools"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Edit 50 Tools Content</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/navigation"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Edit Menus & Links</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
