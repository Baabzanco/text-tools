import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Edit, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getAdminTools, ToolContent } from '../../lib/api/cms-client';

export const AdminToolsList: React.FC = () => {
  const [tools, setTools] = useState<ToolContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    getAdminTools()
      .then((data) => {
        setTools(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tools.filter(
    (t) =>
      t.toolName.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.categoryLabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          50 Tools Content & SEO Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage editable titles, descriptions, FAQs, and SEO tags for all 50 tools. Algorithms and Web Worker processing engines remain strictly code-driven and isolated.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 50 tools by title, slug, or category..."
          className="w-full text-xs font-medium bg-transparent focus:outline-none"
        />
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading tools catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Tool Name & Slug</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Short Description</th>
                  <th className="py-3 px-4 font-bold">Engine Isolation</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tool.toolName}</div>
                      <div className="font-mono text-[11px] text-slate-400">/tools/{tool.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {tool.categoryLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {tool.shortDescription}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Engine Isolated</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/tools/${tool.slug}`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Content</span>
                      </Link>
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
