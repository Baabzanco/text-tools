import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit,
  History,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  Check
} from 'lucide-react';
import { getAdminPages, publishAdminPage, archiveAdminPage } from '../../lib/api/cms-client';

export const AdminPagesList: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPages = () => {
    setLoading(true);
    getAdminPages()
      .then((data) => {
        setPages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handlePublish = async (id: string, title: string) => {
    try {
      await publishAdminPage(id);
      setActionSuccess(`Page '${title}' published successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchPages();
    } catch (err: any) {
      alert(err.message || 'Failed to publish page');
    }
  };

  const handleArchive = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to archive page '${title}'?`)) return;
    try {
      await archiveAdminPage(id);
      setActionSuccess(`Page '${title}' archived.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchPages();
    } catch (err: any) {
      alert(err.message || 'Failed to archive page');
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage CMS Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, preview, version, and publish static & dynamic content pages.
          </p>
        </div>

        <Link
          to="/admin/pages/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pages by title or slug..."
          className="w-full text-xs font-medium bg-transparent focus:outline-none"
        />
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading pages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No matching pages found in database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Title & Slug</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Versions</th>
                  <th className="py-3 px-4 font-bold">Last Updated</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{page.title}</div>
                      <div className="font-mono text-[11px] text-slate-400">/{page.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {page.status === 'PUBLISHED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PUBLISHED (v{page.publishedVersionNumber})</span>
                        </span>
                      )}
                      {page.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>DRAFT (v{page.latestVersionNumber})</span>
                        </span>
                      )}
                      {page.status === 'ARCHIVED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <Archive className="w-3 h-3" />
                          <span>ARCHIVED</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {page.totalVersionsCount} version{page.totalVersionsCount > 1 ? 's' : ''}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(page.updatedAt).toLocaleDateString()}{' '}
                      <span className="text-slate-400">by {page.updatedBy}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/pages/${page.id}`}
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        <Link
                          to={`/admin/pages/${page.id}/revisions`}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <History className="w-3 h-3" />
                          <span>Revisions</span>
                        </Link>

                        <a
                          href={`/${page.slug === 'home' ? '' : page.slug}?previewToken=draft`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </a>

                        {page.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(page.id, page.title)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {page.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchive(page.id, page.title)}
                            className="px-2 py-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Archive Page"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
