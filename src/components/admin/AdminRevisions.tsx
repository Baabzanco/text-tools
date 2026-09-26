import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  RotateCcw,
  CheckCircle2,
  X,
  Check
} from 'lucide-react';
import { getAdminPageRevisions, restoreAdminPageRevision, Page, PageVersion } from '../../lib/api/cms-client';

export const AdminRevisions: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<Page | null>(null);
  const [revisions, setRevisions] = useState<PageVersion[]>([]);
  const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRevisions = () => {
    if (!id) return;
    setLoading(true);
    getAdminPageRevisions(id)
      .then((res) => {
        setPage(res.page);
        setRevisions(res.revisions);
        setPublishedVersionId(res.publishedVersionId);
        setLoading(false);
      })
      .catch((err) => {
        alert(err.message || 'Failed to load revisions');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRevisions();
  }, [id]);

  const handleRestore = async (version: PageVersion) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to restore content from Version v${version.versionNumber}? This will create a NEW draft revision without deleting history.`)) return;

    try {
      const res = await restoreAdminPageRevision(id, version.id);
      setSuccessMsg(`Restored Revision v${version.versionNumber} into NEW Version v${res.restoredVersion.versionNumber}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchRevisions();
    } catch (err: any) {
      alert(err.message || 'Failed to restore revision');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading revision history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/admin/pages/${id}`}
          className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Revision History: {page?.title}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Slug: /{page?.slug} | Total Versions: {revisions.length}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Revisions Timeline List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <span>Immutable Version Timeline</span>
        </h2>

        <div className="space-y-3">
          {revisions.map((rev) => {
            const isLivePublished = rev.id === publishedVersionId;

            return (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLivePublished
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-xs font-mono font-bold">
                      v{rev.versionNumber}
                    </span>
                    {isLivePublished && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>LIVE PUBLISHED VERSION</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedVersion(rev)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Content
                    </button>

                    <button
                      onClick={() => handleRestore(rev)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore as New Draft</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs space-y-1">
                  <p className="text-slate-800 font-medium">{rev.changeSummary}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>Created by: <strong className="text-slate-600">{rev.createdBy}</strong></span>
                    <span>Date: {new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Inspector Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Version #{selectedVersion.versionNumber} Content Snapshot
              </h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  SEO Title
                </span>
                <p className="text-slate-900 bg-slate-50 p-2 rounded-lg font-mono">
                  {selectedVersion.seoMetadata?.seoTitle || 'None'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Sections Count
                </span>
                <p className="text-slate-900 font-mono">
                  {selectedVersion.content?.sections?.length || 0} sections
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Raw JSON Content
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto font-mono text-[11px] max-h-60">
                  {JSON.stringify(selectedVersion.content, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
